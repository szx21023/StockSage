from dataclasses import dataclass
from collections import defaultdict

from app.db.models import SimulatedOrder


@dataclass(frozen=True)
class PositionState:
    symbol: str
    quantity: int
    avg_cost: float
    total_cost: float
    realized_pnl: float


def compute_position_for_symbol(symbol: str, orders: list[SimulatedOrder]) -> PositionState:
    sorted_orders = sorted(orders, key=lambda o: o.created_at)

    qty = 0
    avg_cost = 0.0
    realized = 0.0

    for o in sorted_orders:
        if o.direction == "buy":
            new_qty = qty + o.quantity
            avg_cost = (avg_cost * qty + o.price * o.quantity) / new_qty
            qty = new_qty
        elif o.direction == "sell":
            sell_qty = min(o.quantity, qty)  # legacy oversell 夾在 held
            realized += (o.price - avg_cost) * sell_qty
            qty -= sell_qty
            if qty == 0:
                avg_cost = 0.0

    return PositionState(
        symbol=symbol.upper(),
        quantity=qty,
        avg_cost=round(avg_cost, 4),
        total_cost=round(avg_cost * qty, 4),
        realized_pnl=round(realized, 4),
    )


def compute_all_positions(orders: list[SimulatedOrder]) -> dict[str, PositionState]:
    grouped: dict[str, list[SimulatedOrder]] = defaultdict(list)
    for o in orders:
        grouped[o.symbol.upper()].append(o)

    return {sym: compute_position_for_symbol(sym, group) for sym, group in grouped.items()}
