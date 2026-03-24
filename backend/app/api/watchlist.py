from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db import crud

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


class WatchlistItem(BaseModel):
    ticker: str
    name: str | None = None
    market: str | None = "US"
    notes: str | None = None


@router.get("/")
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    items = await crud.get_watchlist(db)
    return {"items": [
        {"id": i.id, "ticker": i.ticker, "name": i.name, "market": i.market, "notes": i.notes, "added_at": i.added_at}
        for i in items
    ]}


@router.post("/")
async def add_to_watchlist(item: WatchlistItem, db: AsyncSession = Depends(get_db)):
    saved = await crud.add_to_watchlist(db, item.ticker, item.name, item.market, item.notes)
    return {"id": saved.id, "ticker": saved.ticker, "added_at": saved.added_at}


@router.delete("/{ticker}")
async def remove_from_watchlist(ticker: str, db: AsyncSession = Depends(get_db)):
    removed = await crud.remove_from_watchlist(db, ticker)
    if not removed:
        raise HTTPException(status_code=404, detail=f"{ticker} not found in watchlist")
    return {"message": f"{ticker.upper()} removed"}
