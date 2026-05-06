from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest

from app.services.portfolio import compute_all_positions, compute_position_for_symbol


def _order(direction: str, qty: int, price: float, day_offset: int = 0, symbol: str = "AAPL"):
    base = datetime(2026, 1, 1)
    return SimpleNamespace(
        symbol=symbol,
        direction=direction,
        quantity=qty,
        price=price,
        created_at=base + timedelta(days=day_offset),
    )


def test_empty_orders_returns_zero_state():
    state = compute_position_for_symbol("AAPL", [])
    assert state.quantity == 0
    assert state.avg_cost == 0
    assert state.realized_pnl == 0


def test_buys_only_computes_weighted_average():
    orders = [
        _order("buy", 100, 120.0, day_offset=0),
        _order("buy", 50, 130.0, day_offset=1),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 150
    assert state.avg_cost == pytest.approx(123.3333, abs=0.001)
    assert state.realized_pnl == 0


def test_partial_sell_realizes_pnl_and_keeps_avg_cost():
    orders = [
        _order("buy", 100, 120.0, day_offset=0),
        _order("buy", 50, 130.0, day_offset=1),
        _order("sell", 80, 140.0, day_offset=2),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 70
    assert state.avg_cost == pytest.approx(123.3333, abs=0.001)
    assert state.realized_pnl == pytest.approx(1333.3333, abs=0.001)


def test_full_sell_zeros_qty_and_resets_avg_cost():
    orders = [
        _order("buy", 100, 100.0, day_offset=0),
        _order("sell", 100, 110.0, day_offset=1),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 0
    assert state.avg_cost == 0
    assert state.realized_pnl == pytest.approx(1000.0)


def test_reentry_after_full_sell_uses_clean_avg_cost():
    orders = [
        _order("buy", 100, 100.0, day_offset=0),
        _order("sell", 100, 110.0, day_offset=1),
        _order("buy", 50, 200.0, day_offset=2),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 50
    assert state.avg_cost == pytest.approx(200.0)
    assert state.realized_pnl == pytest.approx(1000.0)


def test_unsorted_orders_are_sorted_internally():
    orders = [
        _order("sell", 80, 140.0, day_offset=2),
        _order("buy", 100, 120.0, day_offset=0),
        _order("buy", 50, 130.0, day_offset=1),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 70
    assert state.realized_pnl == pytest.approx(1333.3333, abs=0.001)


def test_legacy_oversell_is_clamped():
    """歷史資料中 sell qty > held：以實際持有為準，多賣的部分忽略。"""
    orders = [
        _order("buy", 50, 100.0, day_offset=0),
        _order("sell", 100, 120.0, day_offset=1),
    ]
    state = compute_position_for_symbol("AAPL", orders)
    assert state.quantity == 0
    assert state.avg_cost == 0
    assert state.realized_pnl == pytest.approx(1000.0)


def test_compute_all_positions_groups_by_symbol():
    orders = [
        _order("buy", 100, 100.0, day_offset=0, symbol="AAPL"),
        _order("buy", 200, 50.0, day_offset=0, symbol="TSLA"),
        _order("sell", 50, 110.0, day_offset=1, symbol="AAPL"),
    ]
    result = compute_all_positions(orders)
    assert set(result.keys()) == {"AAPL", "TSLA"}
    assert result["AAPL"].quantity == 50
    assert result["AAPL"].realized_pnl == pytest.approx(500.0)
    assert result["TSLA"].quantity == 200
    assert result["TSLA"].realized_pnl == 0


def test_symbol_is_uppercased():
    orders = [_order("buy", 10, 50.0, symbol="aapl")]
    state = compute_position_for_symbol("aapl", orders)
    assert state.symbol == "AAPL"
