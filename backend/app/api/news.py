from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db import crud
from app.agent.tools import news as news_tool

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/{ticker}")
async def get_news(ticker: str, company_name: str = "", limit: int = 10, db: AsyncSession = Depends(get_db)):
    query = company_name or ticker
    result = news_tool.run(ticker, query)
    articles = result.get("articles", [])

    for article in articles:
        try:
            await crud.save_news(
                db,
                ticker=ticker,
                title=article["title"],
                url=article.get("url", ""),
                source=article.get("source", ""),
                published_at=_parse_dt(article.get("published_at")),
                sentiment_score=None,
            )
        except Exception:
            pass

    return {"ticker": ticker.upper(), "articles": articles[:limit]}


def _parse_dt(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None
