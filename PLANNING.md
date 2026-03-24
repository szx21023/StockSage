# StockSage - 專案規劃

_最後更新：2026-03-24（進度更新）_

---

## 專案目標

股票分析 AI Agent，結合三個維度自動分析股票，輸出綜合判斷報告：

1. **技術面**：均線、RSI、MACD、K 線圖、成交量
2. **新聞面**：近期相關新聞 + 情緒分析
3. **基本面**：P/E、P/B、EPS 成長、毛利率、負債比

---

## 技術棧

### 後端
- **FastAPI** - API 框架
- **PostgreSQL** - 主資料庫
- **SQLAlchemy** - ORM
- **APScheduler** - 定時任務（每日盤後自動分析自選股）

### AI Agent
- **Claude API** (`claude-sonnet-4-6`) + Tool Calling
- Agent 自動決定呼叫哪些工具、以什麼順序

### 資料來源
- **yfinance** - 股價歷史資料 + 基本面數據
- **ta** - 技術指標計算（RSI、MACD、布林通道等）※ pandas-ta 已從 PyPI 下架，改用 ta
- **NewsAPI / RSS (feedparser)** - 新聞抓取
- **Financial Modeling Prep (FMP) API** - 財報細節（有免費額度）

### 前端
- **React + Vite + TailwindCSS**
- **TradingView Lightweight Charts** - K 線圖

### 通知
- **Telegram Bot** - 手機隨時查詢 + 異常警報推送

---

## 專案結構

```
StockSage/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── config.py                # 環境變數設定
│   │   ├── api/
│   │   │   ├── analyze.py           # POST /analyze/{ticker}
│   │   │   ├── watchlist.py         # CRUD /watchlist
│   │   │   ├── chat.py              # POST /chat
│   │   │   └── report.py            # GET /report/{ticker}
│   │   ├── agent/
│   │   │   ├── orchestrator.py      # Claude Tool Calling 主控
│   │   │   └── tools/
│   │   │       ├── technical.py     # get_price, get_ta
│   │   │       ├── news.py          # get_news, get_sentiment
│   │   │       └── fundamental.py   # get_financials
│   │   ├── services/
│   │   │   ├── market_data.py       # yfinance 封裝
│   │   │   └── scheduler.py         # APScheduler 每日任務
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy engine/session
│   │   │   ├── models.py            # ORM models
│   │   │   └── crud.py              # DB 操作
│   │   └── bot/
│   │       └── telegram.py          # Telegram Bot
│   ├── tests/
│   ├── .env.example
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chart.jsx            # TradingView K 線圖
│   │   │   ├── AnalysisReport.jsx   # AI 分析報告
│   │   │   ├── Watchlist.jsx        # 自選股管理
│   │   │   └── ChatPanel.jsx        # 對話介面
│   │   ├── hooks/
│   │   │   ├── useAnalysis.js
│   │   │   └── useWatchlist.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── StockDetail.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   └── architecture.md
├── docker-compose.yml
├── PLANNING.md
└── README.md
```

---

## 資料庫 Schema

### `watchlist` - 自選股清單
```sql
CREATE TABLE watchlist (
    id       SERIAL PRIMARY KEY,
    ticker   VARCHAR(20) NOT NULL,
    name     VARCHAR(100),
    market   VARCHAR(10),   -- "TW", "US"
    notes    TEXT,
    added_at TIMESTAMP DEFAULT NOW()
);
```

### `analysis_results` - AI 分析歷史
```sql
CREATE TABLE analysis_results (
    id                  SERIAL PRIMARY KEY,
    ticker              VARCHAR(20) NOT NULL,
    analyzed_at         TIMESTAMP DEFAULT NOW(),
    technical_summary   TEXT,
    news_summary        TEXT,
    fundamental_summary TEXT,
    overall_summary     TEXT,
    sentiment           VARCHAR(10),  -- "bullish", "bearish", "neutral"
    raw_data            JSONB
);
```

### `alerts` - 警報設定
```sql
CREATE TABLE alerts (
    id           SERIAL PRIMARY KEY,
    ticker       VARCHAR(20) NOT NULL,
    alert_type   VARCHAR(30),  -- "price_above", "price_below", "rsi_above", "rsi_below"
    threshold    NUMERIC,
    is_active    BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);
```

### `news_cache` - 新聞快取
```sql
CREATE TABLE news_cache (
    id              SERIAL PRIMARY KEY,
    ticker          VARCHAR(20) NOT NULL,
    title           TEXT NOT NULL,
    url             TEXT,
    source          VARCHAR(100),
    published_at    TIMESTAMP,
    sentiment_score NUMERIC,  -- -1.0 ~ 1.0
    fetched_at      TIMESTAMP DEFAULT NOW()
);
```

### `price_cache` - 價格快取
```sql
CREATE TABLE price_cache (
    id       SERIAL PRIMARY KEY,
    ticker   VARCHAR(20) NOT NULL,
    date     DATE NOT NULL,
    open     NUMERIC,
    high     NUMERIC,
    low      NUMERIC,
    close    NUMERIC,
    volume   BIGINT,
    UNIQUE (ticker, date)
);
```

### `conversations` - 對話記錄
```sql
CREATE TABLE conversations (
    id         SERIAL PRIMARY KEY,
    ticker     VARCHAR(20),  -- NULL = 一般問答
    role       VARCHAR(20),  -- "user", "assistant"
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 開發順序

### Phase 1 - 核心 MVP（後端先行）
- [x] FastAPI 基本架構 + 專案初始化（pyproject.toml、config、main.py）
- [x] PostgreSQL + SQLAlchemy DB 連線 + models 建立（6 張 table）
- [x] yfinance 資料抓取封裝（market_data.py）
- [x] ta 技術指標計算（RSI、MACD、MA、布林通道）
- [x] Claude Agent orchestrator + 三個工具（technical.py、news.py、fundamental.py）
- [x] `/analyze/{ticker}`、`/watchlist`、`/chat`、`/report` API 端點實作
- [x] Docker Compose 啟動（db + backend），`/health` 驗證通過
- [ ] 實際打 `/analyze/{ticker}` 測試 Claude Agent 完整流程（需填入真實 ANTHROPIC_API_KEY）

### Phase 2 - 前端 + 視覺化
- [ ] React + Vite + TailwindCSS 初始化
- [ ] TradingView Lightweight Charts K 線圖元件
- [ ] AI 分析報告呈現（AnalysisReport.jsx）
- [ ] 自選股管理介面（Watchlist.jsx）

### Phase 3 - 新聞 + 基本面
- [ ] NewsAPI / RSS 整合 + 情緒分析（news.py）
- [ ] FMP API 財報數據整合（fundamental.py）
- [ ] 三維綜合報告（orchestrator 整合三個工具）
- [ ] ChatPanel 對話介面

### Phase 4 - 日常使用功能
- [ ] Telegram Bot（bot/telegram.py）
- [ ] APScheduler 每日定時分析（scheduler.py）
- [ ] 異常警報推送

---

## 環境設定紀錄

### Python 環境
- 系統 Python 3.8 太舊，改用 **Miniconda** 建立 `stocksage` 環境（Python 3.11）
- 啟動指令：`~/miniconda3/envs/stocksage/bin/uvicorn app.main:app --reload`

### Docker
- 統一用 `docker-compose.yml` 管理 db + backend
- PostgreSQL port 改為 `5433:5432`（本機 5432 已被佔用）
- 啟動指令：`docker compose up db backend`
- backend 內部連線：`postgresql+asyncpg://postgres:password@db:5432/stocksage`

### 套件替換
- `pandas-ta` 已無法從 PyPI 安裝，改用 `ta>=0.11.0`
- `market_data.py` 改用 `ta.trend`、`ta.momentum`、`ta.volatility` API

---

## MVP 定義（面試可展示標準）

Phase 1 + Phase 2 完成即達到 MVP：

- 輸入任意美股 ticker，取得 AI 綜合分析報告（技術面）
- 前端可看 K 線圖 + 分析報告
- 自選股清單可新增/刪除
- 資料存入 DB，可查歷史分析記錄

---

## 面試亮點

| 亮點 | 說明 |
|------|------|
| Multi-tool Agent | 技術面、新聞、基本面各是獨立工具，Claude 自動編排 |
| 真實資料 pipeline | 非 mock data，真實 API + 資料清洗 |
| 有意見的 AI | 不只呈現數據，給出判斷理由 |
| 自己在用 | 面試可說「這是我每天看盤前用的工具」 |
| 完整全端 | FastAPI 後端 + React 前端 + Telegram Bot |
