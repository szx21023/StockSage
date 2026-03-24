from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AnalysisResult, Alert, Conversation, NewsCache, PriceCache, Watchlist


# --- Watchlist ---

async def get_watchlist(db: AsyncSession) -> list[Watchlist]:
    result = await db.execute(select(Watchlist).order_by(Watchlist.added_at.desc()))
    return result.scalars().all()


async def add_to_watchlist(db: AsyncSession, ticker: str, name: str | None, market: str | None, notes: str | None) -> Watchlist:
    item = Watchlist(ticker=ticker.upper(), name=name, market=market, notes=notes)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def remove_from_watchlist(db: AsyncSession, ticker: str) -> bool:
    result = await db.execute(select(Watchlist).where(Watchlist.ticker == ticker.upper()))
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    await db.commit()
    return True


# --- Analysis Results ---

async def save_analysis(db: AsyncSession, ticker: str, **kwargs) -> AnalysisResult:
    result = AnalysisResult(ticker=ticker.upper(), **kwargs)
    db.add(result)
    await db.commit()
    await db.refresh(result)
    return result


async def get_latest_analysis(db: AsyncSession, ticker: str) -> AnalysisResult | None:
    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.ticker == ticker.upper())
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_analysis_history(db: AsyncSession, ticker: str, limit: int = 10) -> list[AnalysisResult]:
    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.ticker == ticker.upper())
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(limit)
    )
    return result.scalars().all()


# --- Price Cache ---

async def get_cached_prices(db: AsyncSession, ticker: str, start_date: str, end_date: str) -> list[PriceCache]:
    result = await db.execute(
        select(PriceCache)
        .where(PriceCache.ticker == ticker.upper())
        .where(PriceCache.date >= start_date)
        .where(PriceCache.date <= end_date)
        .order_by(PriceCache.date)
    )
    return result.scalars().all()


async def upsert_price(db: AsyncSession, ticker: str, date: str, open: float, high: float, low: float, close: float, volume: int):
    result = await db.execute(
        select(PriceCache)
        .where(PriceCache.ticker == ticker.upper())
        .where(PriceCache.date == date)
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.open, existing.high, existing.low, existing.close, existing.volume = open, high, low, close, volume
    else:
        db.add(PriceCache(ticker=ticker.upper(), date=date, open=open, high=high, low=low, close=close, volume=volume))
    await db.commit()


# --- News Cache ---

async def save_news(db: AsyncSession, ticker: str, title: str, url: str, source: str, published_at, sentiment_score: float | None) -> NewsCache:
    item = NewsCache(ticker=ticker.upper(), title=title, url=url, source=source, published_at=published_at, sentiment_score=sentiment_score)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def get_cached_news(db: AsyncSession, ticker: str, limit: int = 10) -> list[NewsCache]:
    result = await db.execute(
        select(NewsCache)
        .where(NewsCache.ticker == ticker.upper())
        .order_by(desc(NewsCache.fetched_at))
        .limit(limit)
    )
    return result.scalars().all()


# --- Conversations ---

async def save_message(db: AsyncSession, role: str, content: str, ticker: str | None = None) -> Conversation:
    msg = Conversation(role=role, content=content, ticker=ticker)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_conversation_history(db: AsyncSession, ticker: str | None = None, limit: int = 20) -> list[Conversation]:
    query = select(Conversation).order_by(desc(Conversation.created_at)).limit(limit)
    if ticker:
        query = query.where(Conversation.ticker == ticker.upper())
    result = await db.execute(query)
    return list(reversed(result.scalars().all()))


# --- Alerts ---

async def get_active_alerts(db: AsyncSession) -> list[Alert]:
    result = await db.execute(select(Alert).where(Alert.is_active == True))
    return result.scalars().all()


async def create_alert(db: AsyncSession, ticker: str, alert_type: str, threshold: float) -> Alert:
    alert = Alert(ticker=ticker.upper(), alert_type=alert_type, threshold=threshold)
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert
