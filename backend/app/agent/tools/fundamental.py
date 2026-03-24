from app.services.market_data import get_fundamentals

TOOL_SCHEMA = {
    "name": "get_fundamental_analysis",
    "description": (
        "取得股票的基本面數據，包含 P/E、P/B、EPS、毛利率、負債比等財務指標。"
        "用於評估公司估值是否合理、財務健康程度與成長性。"
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "股票代碼，例如 AAPL、TSLA",
            },
        },
        "required": ["ticker"],
    },
}


def run(ticker: str) -> dict:
    """取得基本面數據並加入簡單解讀。"""
    data = get_fundamentals(ticker)
    return {
        "ticker": ticker.upper(),
        "fundamentals": data,
        "valuation_note": _interpret_valuation(data),
    }


def _interpret_valuation(data: dict) -> str:
    notes = []
    pe = data.get("pe_ratio")
    if pe:
        if pe < 15:
            notes.append(f"P/E {pe:.1f}，估值偏低")
        elif pe > 30:
            notes.append(f"P/E {pe:.1f}，估值偏高")
        else:
            notes.append(f"P/E {pe:.1f}，估值合理")

    pb = data.get("pb_ratio")
    if pb:
        if pb < 1:
            notes.append(f"P/B {pb:.2f}，低於淨值")
        else:
            notes.append(f"P/B {pb:.2f}")

    gm = data.get("gross_margins")
    if gm:
        notes.append(f"毛利率 {gm*100:.1f}%")

    de = data.get("debt_to_equity")
    if de:
        if de > 100:
            notes.append(f"負債比 {de:.0f}%，財務槓桿較高")
        else:
            notes.append(f"負債比 {de:.0f}%，財務穩健")

    return "；".join(notes) if notes else "基本面數據不足"
