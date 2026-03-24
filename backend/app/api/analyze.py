from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db import crud
from app.agent import orchestrator
from app.services.market_data import get_ohlcv_for_chart

router = APIRouter(prefix="/analyze", tags=["analyze"])


class AnalyzeRequest(BaseModel):
    company_name: str = ""


@router.post("/{ticker}")
async def analyze_stock(ticker: str, body: AnalyzeRequest = AnalyzeRequest(), db: AsyncSession = Depends(get_db)):
    ticker = ticker.upper()
    try:
        result = await orchestrator.analyze(ticker, body.company_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    saved = await crud.save_analysis(
        db,
        ticker=ticker,
        technical_summary=result["technical_summary"],
        news_summary=result["news_summary"],
        fundamental_summary=result["fundamental_summary"],
        overall_summary=result["overall_summary"],
        sentiment=result["sentiment"],
        raw_data=result,
    )

    return {**result, "id": saved.id, "analyzed_at": saved.analyzed_at}


@router.get("/{ticker}/chart")
async def get_chart_data(ticker: str, period: str = "6mo"):
    try:
        data = get_ohlcv_for_chart(ticker.upper(), period)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"ticker": ticker.upper(), "period": period, "data": data}
