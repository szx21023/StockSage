from app.services.market_data import get_price_history, get_technical_indicators

# Claude Tool Calling schema
TOOL_SCHEMA = {
    "name": "get_technical_analysis",
    "description": (
        "取得股票的技術指標分析，包含均線（MA20/MA60）、RSI、MACD、布林通道。"
        "用於判斷目前股價趨勢、超買超賣狀態、動能方向。"
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "股票代碼，例如 AAPL、TSLA、2330.TW",
            },
            "period": {
                "type": "string",
                "description": "歷史資料期間，預設 6mo，可選 1mo / 3mo / 6mo / 1y / 2y",
                "default": "6mo",
            },
        },
        "required": ["ticker"],
    },
}


def run(ticker: str, period: str = "6mo") -> dict:
    """執行技術分析，回傳最新技術指標。"""
    df = get_price_history(ticker, period)
    indicators = get_technical_indicators(df)
    return {
        "ticker": ticker.upper(),
        "indicators": indicators,
        "price_trend": _interpret_trend(indicators),
    }


def _interpret_trend(ind: dict) -> str:
    """簡單解讀技術指標趨勢，供 Agent 參考。"""
    notes = []
    if ind.get("rsi"):
        if ind["rsi"] > 70:
            notes.append("RSI 超買（>70）")
        elif ind["rsi"] < 30:
            notes.append("RSI 超賣（<30）")
        else:
            notes.append(f"RSI 中性（{ind['rsi']}）")

    if ind.get("macd") and ind.get("macd_signal"):
        if ind["macd"] > ind["macd_signal"]:
            notes.append("MACD 金叉（多頭訊號）")
        else:
            notes.append("MACD 死叉（空頭訊號）")

    if ind.get("ma20") and ind.get("ma60"):
        if ind["close"] > ind["ma20"] > ind["ma60"]:
            notes.append("股價站上 MA20 與 MA60（多頭排列）")
        elif ind["close"] < ind["ma20"] < ind["ma60"]:
            notes.append("股價跌破 MA20 與 MA60（空頭排列）")

    return "；".join(notes) if notes else "技術指標中性"
