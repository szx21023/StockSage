from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db import crud

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/{ticker}/latest")
async def get_latest_report(ticker: str, db: AsyncSession = Depends(get_db)):
    result = await crud.get_latest_analysis(db, ticker)
    if not result:
        raise HTTPException(status_code=404, detail=f"No analysis found for {ticker.upper()}")
    return {
        "id": result.id,
        "ticker": result.ticker,
        "analyzed_at": result.analyzed_at,
        "technical_summary": result.technical_summary,
        "news_summary": result.news_summary,
        "fundamental_summary": result.fundamental_summary,
        "overall_summary": result.overall_summary,
        "sentiment": result.sentiment,
    }


@router.get("/{ticker}/history")
async def get_report_history(ticker: str, limit: int = 10, db: AsyncSession = Depends(get_db)):
    results = await crud.get_analysis_history(db, ticker, limit)
    return {"ticker": ticker.upper(), "reports": [
        {
            "id": r.id,
            "analyzed_at": r.analyzed_at,
            "sentiment": r.sentiment,
            "overall_summary": r.overall_summary,
        }
        for r in results
    ]}
