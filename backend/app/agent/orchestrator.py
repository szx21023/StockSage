import json
import anthropic

from app.config import settings
from app.agent.tools import technical, news, fundamental

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

TOOLS = [technical.TOOL_SCHEMA, news.TOOL_SCHEMA, fundamental.TOOL_SCHEMA]

TOOL_RUNNERS = {
    "get_technical_analysis": lambda args: technical.run(**args),
    "get_news_sentiment": lambda args: news.run(**args),
    "get_fundamental_analysis": lambda args: fundamental.run(**args),
}

SYSTEM_PROMPT = """你是 StockSage，一位專業的股票分析 AI。

你的任務是整合技術面、新聞面、基本面三個維度，對股票做出綜合判斷。

分析流程：
1. 呼叫 get_technical_analysis 取得技術指標
2. 呼叫 get_fundamental_analysis 取得基本面數據
3. 呼叫 get_news_sentiment 取得近期新聞
4. 整合三個維度，輸出結構化分析報告

報告格式：
## 技術面分析
（說明目前價格趨勢、RSI/MACD 訊號、支撐壓力位）

## 基本面分析
（說明估值、獲利能力、財務健康度）

## 新聞面分析
（說明近期重要事件與市場情緒）

## 綜合判斷
（整合三維，給出 bullish / bearish / neutral 判斷與理由）

請用繁體中文回答，語氣專業但易懂。"""


async def analyze(ticker: str, company_name: str = "") -> dict:
    """
    對指定 ticker 執行三維分析，回傳分析結果。
    """
    messages = [
        {
            "role": "user",
            "content": f"請分析 {ticker}（{company_name or ticker}）這支股票，給我完整的三維分析報告。",
        }
    ]

    technical_summary = None
    news_summary = None
    fundamental_summary = None
    overall_summary = None
    sentiment = "neutral"

    # Agentic loop
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        # 若沒有工具呼叫，代表分析完成
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    overall_summary = block.text
                    sentiment = _extract_sentiment(block.text)
            break

        # 執行所有工具呼叫
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                tool_name = block.name
                tool_input = block.input
                result = TOOL_RUNNERS[tool_name](tool_input)

                # 記錄各維度摘要
                if tool_name == "get_technical_analysis":
                    technical_summary = result.get("price_trend")
                elif tool_name == "get_news_sentiment":
                    total = result.get("total_fetched", 0)
                    pos = result.get("positive_count", 0)
                    neg = result.get("negative_count", 0)
                    neu = result.get("neutral_count", 0)
                    overall = result.get("overall_sentiment", "neutral")
                    overall_zh = {"positive": "正面", "negative": "負面", "neutral": "中性"}.get(overall, "中性")
                    news_summary = f"共 {total} 篇新聞，整體情緒{overall_zh}（正面 {pos} 篇、負面 {neg} 篇、中性 {neu} 篇）"
                elif tool_name == "get_fundamental_analysis":
                    fundamental_summary = result.get("valuation_note")

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, ensure_ascii=False),
                })

        # 更新對話紀錄，繼續 loop
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return {
        "ticker": ticker.upper(),
        "technical_summary": technical_summary,
        "news_summary": news_summary,
        "fundamental_summary": fundamental_summary,
        "overall_summary": overall_summary,
        "sentiment": sentiment,
    }


async def chat(message: str, ticker: str | None = None, history: list[dict] | None = None) -> str:
    """對話模式，根據用戶意圖決定是否呼叫工具。"""
    messages = history or []
    context = f"目前討論的股票：{ticker}\n\n" if ticker else ""
    messages.append({"role": "user", "content": context + message})

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "無法取得回應"

        # 執行工具並繼續 loop
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = TOOL_RUNNERS[block.name](block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, ensure_ascii=False),
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})


def _extract_sentiment(text: str) -> str:
    text_lower = text.lower()
    if any(w in text_lower for w in ["bullish", "看多", "買進", "上漲", "正面"]):
        return "bullish"
    if any(w in text_lower for w in ["bearish", "看空", "賣出", "下跌", "負面"]):
        return "bearish"
    return "neutral"
