from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Float, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str | None] = mapped_column(String(100))
    market: Mapped[str | None] = mapped_column(String(10))  # "TW", "US"
    notes: Mapped[str | None] = mapped_column(Text)
    added_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    technical_summary: Mapped[str | None] = mapped_column(Text)
    news_summary: Mapped[str | None] = mapped_column(Text)
    fundamental_summary: Mapped[str | None] = mapped_column(Text)
    overall_summary: Mapped[str | None] = mapped_column(Text)
    sentiment: Mapped[str | None] = mapped_column(String(10))  # "bullish", "bearish", "neutral"
    raw_data: Mapped[dict | None] = mapped_column(JSONB)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    alert_type: Mapped[str | None] = mapped_column(String(30))  # "price_above", "price_below", "rsi_above", "rsi_below"
    threshold: Mapped[float | None] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    triggered_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class NewsCache(Base):
    __tablename__ = "news_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(100))
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    sentiment_score: Mapped[float | None] = mapped_column(Float)  # -1.0 ~ 1.0
    fetched_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class PriceCache(Base):
    __tablename__ = "price_cache"

    __table_args__ = (UniqueConstraint("ticker", "date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False)  # "YYYY-MM-DD"
    open: Mapped[float | None] = mapped_column(Float)
    high: Mapped[float | None] = mapped_column(Float)
    low: Mapped[float | None] = mapped_column(Float)
    close: Mapped[float | None] = mapped_column(Float)
    volume: Mapped[int | None] = mapped_column(BigInteger)


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker: Mapped[str | None] = mapped_column(String(20))  # NULL = 一般問答
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user", "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
