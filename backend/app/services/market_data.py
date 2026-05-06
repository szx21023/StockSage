import pandas as pd
import ta
import yfinance as yf


def get_price_history(ticker: str, period: str = "6mo") -> pd.DataFrame:
    """取得股價歷史資料，回傳 OHLCV DataFrame。"""
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    if df.empty:
        raise ValueError(f"No price data found for {ticker}")
    df.index = df.index.tz_localize(None)
    return df[["Open", "High", "Low", "Close", "Volume"]]


def get_technical_indicators(df: pd.DataFrame) -> dict:
    """計算技術指標，回傳最新一筆數據。"""
    close = df["Close"]

    df["MA20"] = ta.trend.sma_indicator(close, window=20)
    df["MA60"] = ta.trend.sma_indicator(close, window=60)
    df["RSI"] = ta.momentum.rsi(close, window=14)

    macd_obj = ta.trend.MACD(close)
    df["MACD"] = macd_obj.macd()
    df["MACD_signal"] = macd_obj.macd_signal()
    df["MACD_hist"] = macd_obj.macd_diff()

    bb_obj = ta.volatility.BollingerBands(close, window=20)
    df["BB_upper"] = bb_obj.bollinger_hband()
    df["BB_mid"] = bb_obj.bollinger_mavg()
    df["BB_lower"] = bb_obj.bollinger_lband()

    latest = df.iloc[-1]

    def safe(key):
        val = latest.get(key)
        return round(float(val), 4) if val is not None and pd.notna(val) else None

    return {
        "date": str(latest.name.date()),
        "close": round(float(latest["Close"]), 2),
        "volume": int(latest["Volume"]),
        "ma20": safe("MA20"),
        "ma60": safe("MA60"),
        "rsi": safe("RSI"),
        "macd": safe("MACD"),
        "macd_signal": safe("MACD_signal"),
        "macd_hist": safe("MACD_hist"),
        "bb_upper": safe("BB_upper"),
        "bb_mid": safe("BB_mid"),
        "bb_lower": safe("BB_lower"),
    }


def get_current_price(ticker: str) -> float | None:
    """取得即時股價（最後成交價）。盤後 / 假日 / 無資料回傳 None。"""
    stock = yf.Ticker(ticker)
    # 優先使用 fast_info（較輕量），退而求其次打 1 日分 K
    try:
        last = stock.fast_info.last_price
        if last is not None and not pd.isna(last):
            return round(float(last), 4)
    except Exception:
        pass
    try:
        df = stock.history(period="1d", interval="1m")
        if not df.empty:
            return round(float(df["Close"].iloc[-1]), 4)
    except Exception:
        pass
    return None


def get_fundamentals(ticker: str) -> dict:
    """透過 yfinance 取得基本面數據。"""
    info = yf.Ticker(ticker).info
    return {
        "name": info.get("longName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "market_cap": info.get("marketCap"),
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "pb_ratio": info.get("priceToBook"),
        "eps": info.get("trailingEps"),
        "revenue_growth": info.get("revenueGrowth"),
        "earnings_growth": info.get("earningsGrowth"),
        "gross_margins": info.get("grossMargins"),
        "profit_margins": info.get("profitMargins"),
        "debt_to_equity": info.get("debtToEquity"),
        "current_ratio": info.get("currentRatio"),
        "dividend_yield": info.get("dividendYield"),
        "52w_high": info.get("fiftyTwoWeekHigh"),
        "52w_low": info.get("fiftyTwoWeekLow"),
    }


def _derive_trend(ind: dict) -> str:
    """根據均線和收盤價推導趨勢方向。"""
    close = ind.get("close")
    ma20 = ind.get("ma20")
    ma60 = ind.get("ma60")
    if close is None or ma20 is None or ma60 is None:
        return "neutral"
    if close > ma20 and ma20 > ma60:
        return "bullish"
    if close < ma20 and ma20 < ma60:
        return "bearish"
    return "neutral"


def scan_single_ticker(ticker: str) -> dict:
    """同步掃描單支股票的技術指標，供 asyncio.to_thread 使用。"""
    try:
        df = get_price_history(ticker, period="6mo")
        ind = get_technical_indicators(df)
        ind["trend"] = _derive_trend(ind)
        return {"ticker": ticker, "indicators": ind, "error": None}
    except Exception as e:
        return {"ticker": ticker, "indicators": None, "error": str(e)}


def get_ohlcv_for_chart(ticker: str, period: str = "6mo") -> list[dict]:
    """回傳前端 TradingView 所需的 OHLCV 格式。"""
    df = get_price_history(ticker, period)
    return [
        {
            "time": int(ts.timestamp()),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        }
        for ts, row in df.iterrows()
    ]
