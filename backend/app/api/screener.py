import asyncio
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from app.services.market_data import scan_single_ticker
from app.services.screener_service import apply_logic, count_active_filters, evaluate_conditions

router = APIRouter(prefix="/screener", tags=["screener"])

MAX_TICKERS = 30


class FilterCondition(BaseModel):
    trend: Literal["bullish", "bearish"] | None = None
    rsi_min: float | None = None
    rsi_max: float | None = None
    macd_cross: Literal["golden", "dead"] | None = None
    macd_hist_rising: bool | None = None
    price_above_ma20: bool | None = None
    price_above_ma60: bool | None = None
    ma20_above_ma60: bool | None = None
    bb_breakout_upper: bool | None = None
    bb_near_lower: bool | None = None


class ScanRequest(BaseModel):
    tickers: list[str]
    filters: FilterCondition
    logic: Literal["AND", "OR"] = "AND"

    @field_validator("tickers")
    @classmethod
    def validate_tickers(cls, v):
        if not v:
            raise ValueError("tickers 不能為空")
        if len(v) > MAX_TICKERS:
            raise ValueError(f"最多掃描 {MAX_TICKERS} 支股票")
        return [t.strip().upper() for t in v if t.strip()]


class TickerScanResult(BaseModel):
    ticker: str
    matched: bool
    matched_conditions: list[str]
    indicators: dict | None
    error: str | None


class ScanResponse(BaseModel):
    scanned: int
    matched: int
    results: list[TickerScanResult]


def _resolve_ticker(ticker: str, market: str | None = None) -> str:
    """台股自動補 .TW 後綴。"""
    if market == "TW" and not ticker.endswith(".TW"):
        return f"{ticker}.TW"
    return ticker


@router.post("/scan", response_model=ScanResponse)
async def scan_stocks(body: ScanRequest) -> ScanResponse:
    tickers = body.tickers[:MAX_TICKERS]

    # 並發掃描（yfinance 是同步 I/O，透過 to_thread 執行）
    tasks = [asyncio.to_thread(scan_single_ticker, t) for t in tickers]
    raw_results = await asyncio.gather(*tasks)

    active_filter_count = count_active_filters(body.filters)
    results: list[TickerScanResult] = []

    for item in raw_results:
        if item["error"] or item["indicators"] is None:
            results.append(TickerScanResult(
                ticker=item["ticker"],
                matched=False,
                matched_conditions=[],
                indicators=None,
                error=item["error"],
            ))
            continue

        matched_conditions = evaluate_conditions(item["indicators"], body.filters)
        matched = apply_logic(matched_conditions, active_filter_count, body.logic)

        results.append(TickerScanResult(
            ticker=item["ticker"],
            matched=matched,
            matched_conditions=matched_conditions,
            indicators=item["indicators"],
            error=None,
        ))

    matched_count = sum(1 for r in results if r.matched)

    return ScanResponse(
        scanned=len(results),
        matched=matched_count,
        results=results,
    )
