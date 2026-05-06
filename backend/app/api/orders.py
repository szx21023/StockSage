from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import crud
from app.db.database import get_db
from app.db.models import SimulatedOrder
from app.services.market_data import get_current_price

router = APIRouter(prefix="/orders", tags=["orders"])


class CreateOrderRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    direction: Literal["buy", "sell"]
    quantity: int = Field(..., gt=0)
    note: str | None = None


def _serialize(order: SimulatedOrder) -> dict:
    return {
        "id": order.id,
        "symbol": order.symbol,
        "direction": order.direction,
        "quantity": order.quantity,
        "price": order.price,
        "note": order.note,
        "created_at": order.created_at,
    }


@router.get("/")
async def list_orders(
    symbol: str | None = Query(None),
    direction: Literal["buy", "sell"] | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    orders = await crud.list_simulated_orders(db, symbol=symbol, direction=direction, limit=limit)
    return {"data": [_serialize(o) for o in orders], "total": len(orders)}


@router.post("/", status_code=201)
async def create_order(body: CreateOrderRequest, db: AsyncSession = Depends(get_db)):
    # 價格由後端即時抓取，忽略前端傳入，防止竄改
    price = get_current_price(body.symbol)
    if price is None:
        raise HTTPException(
            status_code=422,
            detail=f"無法取得 {body.symbol.upper()} 的即時價格（可能非交易時段或代號錯誤）",
        )
    order = await crud.create_simulated_order(
        db,
        symbol=body.symbol,
        direction=body.direction,
        quantity=body.quantity,
        price=price,
        note=body.note,
    )
    return _serialize(order)


@router.delete("/{order_id}")
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    removed = await crud.delete_simulated_order(db, order_id)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return {"success": True}


@router.get("/price/{symbol}")
async def get_price(symbol: str):
    price = get_current_price(symbol)
    if price is None:
        raise HTTPException(
            status_code=422,
            detail=f"無法取得 {symbol.upper()} 的即時價格",
        )
    return {"symbol": symbol.upper(), "price": price}
