import feedparser
import httpx
from datetime import datetime, timedelta, timezone

from app.config import settings

TOOL_SCHEMA = {
    "name": "get_news_sentiment",
    "description": (
        "取得股票近期相關新聞，並分析市場情緒。"
        "用於判斷市場對該股票的看法是正面、負面或中立。"
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "股票代碼，例如 AAPL、TSLA",
            },
            "company_name": {
                "type": "string",
                "description": "公司英文名稱，用於新聞搜尋，例如 Apple、Tesla",
            },
            "days": {
                "type": "integer",
                "description": "抓取最近幾天的新聞，預設 7 天",
                "default": 7,
            },
        },
        "required": ["ticker", "company_name"],
    },
}


def run(ticker: str, company_name: str, days: int = 7) -> dict:
    """抓取新聞並回傳摘要列表。"""
    articles = []

    # 優先使用 NewsAPI
    if settings.news_api_key:
        articles = _fetch_from_newsapi(company_name, days)

    # Fallback: Google News RSS
    if not articles:
        articles = _fetch_from_rss(company_name, days)

    return {
        "ticker": ticker.upper(),
        "articles": articles[:10],
        "total_fetched": len(articles),
    }


def _fetch_from_newsapi(query: str, days: int) -> list[dict]:
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    try:
        resp = httpx.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": query,
                "from": from_date,
                "sortBy": "publishedAt",
                "language": "en",
                "apiKey": settings.news_api_key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return [
            {
                "title": a["title"],
                "source": a["source"]["name"],
                "published_at": a["publishedAt"],
                "url": a["url"],
            }
            for a in data.get("articles", [])
        ]
    except Exception:
        return []


def _fetch_from_rss(query: str, days: int) -> list[dict]:
    url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}&hl=en-US&gl=US&ceid=US:en"
    try:
        feed = feedparser.parse(url)
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        articles = []
        for entry in feed.entries:
            published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            if published >= cutoff:
                articles.append({
                    "title": entry.title,
                    "source": entry.get("source", {}).get("title", "Google News"),
                    "published_at": published.isoformat(),
                    "url": entry.link,
                })
        return articles
    except Exception:
        return []
