import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import crud
from app.db.database import get_db
from app.services.market_data import get_current_price
from app.services.portfolio import PositionState, compute_all_positions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def _pct(numerator: float, denominator: float) -> float:
    return round(numerator / denominator * 100, 2)


async def _fetch_prices(symbols: list[str]) -> dict[str, float | None]:
    if not symbols:
        return {}
    tasks = [asyncio.to_thread(get_current_price, s) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    out: dict[str, float | None] = {}
    for sym, val in zip(symbols, results):
        if isinstance(val, Exception):
            # get_current_price 內部已捕獲常見例外回 None；走到這裡通常是 bug 或基建錯誤
            logger.error("fetch price failed for %s", sym, exc_info=val)
            out[sym] = None
        else:
            out[sym] = val
    return out


def _build_position_row(state: PositionState, current_price: float | None) -> dict:
    has_price = current_price is not None
    market_value = round(current_price * state.quantity, 4) if has_price else None
    unrealized = round((current_price - state.avg_cost) * state.quantity, 4) if has_price else None
    unrealized_pct = _pct(unrealized, state.total_cost) if has_price and state.total_cost > 0 else None

    return {
        "symbol": state.symbol,
        "quantity": state.quantity,
        "avg_cost": state.avg_cost,
        "total_cost": state.total_cost,
        "current_price": current_price,
        "market_value": market_value,
        "unrealized_pnl": unrealized,
        "unrealized_pct": unrealized_pct,
        "realized_pnl": state.realized_pnl,
        "price_error": None if has_price else "無法取得即時價格（可能非交易時段或代號錯誤）",
    }


@router.get("/positions")
async def get_positions(db: AsyncSession = Depends(get_db)):
    orders = await crud.list_all_orders(db)
    all_states = compute_all_positions(orders)
    open_states = [s for s in all_states.values() if s.quantity > 0]

    prices = await _fetch_prices([s.symbol for s in open_states])
    rows = [_build_position_row(s, prices.get(s.symbol)) for s in open_states]
    rows.sort(key=lambda r: r["symbol"])

    return {
        "data": rows,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    orders = await crud.list_all_orders(db)
    all_states = compute_all_positions(orders)

    # realized_pnl 涵蓋曾持有但已清倉的 symbol，所以走 all_states；總市值/未實現只算 open_states
    realized_total = sum(s.realized_pnl for s in all_states.values())
    open_states = [s for s in all_states.values() if s.quantity > 0]

    prices = await _fetch_prices([s.symbol for s in open_states])

    total_cost = 0.0
    total_market_value = 0.0
    priced_position_count = 0
    stale_count = 0

    for s in open_states:
        price = prices.get(s.symbol)
        if price is None:
            stale_count += 1
            continue
        total_cost += s.total_cost
        total_market_value += price * s.quantity
        priced_position_count += 1

    unrealized = total_market_value - total_cost
    unrealized_pct = _pct(unrealized, total_cost) if total_cost > 0 else None
    total_pnl = unrealized + realized_total

    return {
        "total_cost": round(total_cost, 4),
        "total_market_value": round(total_market_value, 4),
        "unrealized_pnl": round(unrealized, 4),
        "unrealized_pct": unrealized_pct,
        "realized_pnl": round(realized_total, 4),
        "total_pnl": round(total_pnl, 4),
        "position_count": len(open_states),
        "priced_position_count": priced_position_count,
        "stale_count": stale_count,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }
