# StockSage

AI 驅動的股票分析工具，整合技術分析、新聞情緒與基本面三維度分析。

## 環境需求

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

## 快速啟動

### 1. 設定環境變數

```bash
cp backend/.env.example backend/.env
```

編輯 `backend/.env`，填入以下 API 金鑰：

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
NEWS_API_KEY=your_newsapi_key
FMP_API_KEY=your_fmp_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. 啟動所有服務

```bash
docker compose up -d
```

### 3. 確認服務狀態

```bash
docker compose ps
```

## 服務一覽

| 服務 | 網址 |
|------|------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| PostgreSQL | localhost:5433 |

## 常用指令

```bash
# 查看 logs
docker compose logs -f

# 停止所有服務
docker compose down

# 重新建置並啟動
docker compose up -d --build
```
