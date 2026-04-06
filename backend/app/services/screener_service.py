from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.api.screener import FilterCondition


def evaluate_conditions(ind: dict, filters: "FilterCondition") -> list[str]:
    """檢查指標是否符合各篩選條件，回傳符合的條件標籤清單。"""
    matched: list[str] = []

    def get(key):
        return ind.get(key)

    # 趨勢
    if filters.trend is not None:
        if get("trend") == filters.trend:
            matched.append(f"trend_{filters.trend}")

    # RSI
    rsi = get("rsi")
    if rsi is not None:
        if filters.rsi_min is not None and filters.rsi_max is not None:
            if filters.rsi_min <= rsi <= filters.rsi_max:
                matched.append("rsi_in_range")
        elif filters.rsi_max is not None:
            if rsi <= filters.rsi_max:
                label = "rsi_oversold" if filters.rsi_max <= 30 else "rsi_in_range"
                matched.append(label)
        elif filters.rsi_min is not None:
            if rsi >= filters.rsi_min:
                label = "rsi_overbought" if filters.rsi_min >= 70 else "rsi_in_range"
                matched.append(label)

    # MACD
    macd = get("macd")
    macd_signal = get("macd_signal")
    macd_hist = get("macd_hist")

    if filters.macd_cross is not None and macd is not None and macd_signal is not None:
        if filters.macd_cross == "golden" and macd > macd_signal:
            matched.append("macd_golden_cross")
        elif filters.macd_cross == "dead" and macd < macd_signal:
            matched.append("macd_dead_cross")

    if filters.macd_hist_rising is True and macd_hist is not None:
        if macd_hist > 0:
            matched.append("macd_hist_positive")

    # 均線
    close = get("close")
    ma20 = get("ma20")
    ma60 = get("ma60")

    if filters.price_above_ma20 is True and close is not None and ma20 is not None:
        if close > ma20:
            matched.append("above_ma20")

    if filters.price_above_ma60 is True and close is not None and ma60 is not None:
        if close > ma60:
            matched.append("above_ma60")

    if filters.ma20_above_ma60 is True and ma20 is not None and ma60 is not None:
        if ma20 > ma60:
            matched.append("ma20_above_ma60")

    # 布林通道
    bb_upper = get("bb_upper")
    bb_lower = get("bb_lower")

    if filters.bb_breakout_upper is True and close is not None and bb_upper is not None:
        if close > bb_upper:
            matched.append("bb_breakout_upper")

    if filters.bb_near_lower is True and close is not None and bb_lower is not None:
        if close <= bb_lower * 1.02:
            matched.append("bb_near_lower")

    return matched


def count_active_filters(filters: "FilterCondition") -> int:
    """計算有設定的篩選條件數量。"""
    count = 0
    if filters.trend is not None:
        count += 1
    if filters.rsi_min is not None or filters.rsi_max is not None:
        count += 1
    if filters.macd_cross is not None:
        count += 1
    if filters.macd_hist_rising is True:
        count += 1
    if filters.price_above_ma20 is True:
        count += 1
    if filters.price_above_ma60 is True:
        count += 1
    if filters.ma20_above_ma60 is True:
        count += 1
    if filters.bb_breakout_upper is True:
        count += 1
    if filters.bb_near_lower is True:
        count += 1
    return count


def apply_logic(matched_conditions: list[str], active_filter_count: int, logic: str) -> bool:
    """根據 AND/OR 邏輯判斷是否整體符合。"""
    if active_filter_count == 0:
        return True
    if logic == "OR":
        return len(matched_conditions) > 0
    # AND：每個啟用的篩選條件都要有對應的符合標籤
    return len(matched_conditions) >= active_filter_count
