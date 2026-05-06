# PRD：模擬下單功能 (Paper Trading)

> 建立日期：2026-04-12
> 狀態：待開發

---

## 1. Overview

**Feature / Project Name:** 模擬下單 (Paper Trading Orders)

**Problem Statement:**
使用技術指標篩選出標的後，交易者缺乏一個低風險的方式來驗證訊號的實際效果。在沒有模擬下單機制的情況下，使用者只能憑記憶或手動紀錄來追蹤「如果我當時買進，現在獲利多少」，這樣的流程既不精確也難以持續執行。

**Proposed Solution:**
在現有的技術篩選器與個股頁面中加入「模擬下單」入口，讓使用者以即時股價記錄買進/賣出操作，並在專屬頁面查看所有歷史下單紀錄。

**AI Build Summary:**
> Build a paper trading module within the existing StockSage app (React 19 + JSX + Tailwind v4 frontend, FastAPI + PostgreSQL backend). Add a new `SimulatedOrders` page and an `OrderFormModal` component. Users place market-only buy/sell orders at the current yfinance price; orders are persisted to a new `simulated_orders` PostgreSQL table via a new `/api/orders` FastAPI router. No authentication, no portfolio P&L tracking in MVP. Entry points: ScreenerResultTable row action and StockDetail page header.

---

## 2. Goals & Success Metrics

**Primary Goal:** 讓技術指標篩選後的交易訊號可以被快速記錄，並事後查閱驗證。

**Success Metrics:**
- 使用者從篩選結果到完成一筆模擬下單的操作步驟 ≤ 3 步
- 下單紀錄頁面能在 1 秒內載入最近 100 筆訂單

**Anti-goals:**
- 不做投資組合損益追蹤（P&L dashboard、虛擬資金餘額）
- 不做限價單、停損單等複雜委託類型
- 不做多使用者帳號隔離（單機單用戶情境）

---

## 3. Scope & Constraints

**In scope:**
- 市價模擬下單（買進 / 賣出）
- 即時股價抓取（沿用現有 yfinance market_data service）
- 下單紀錄列表頁面（可依股票代號、方向篩選）
- 從 ScreenerPage 結果列與 StockDetail 頁面進入下單流程
- 刪除單筆紀錄

**Out of scope:**
- 虛擬資金餘額與損益計算
- 限價單 / 停損單
- 圖表上標注下單位置
- 匯出 CSV

**Technical constraints:**
- Platform: Web only
- Auth: 無（現有系統無帳號機制）
- Accessibility: WCAG AA 基本鍵盤導覽
- Offline: 不需要
- 沿用現有 Alembic migration 流程新增資料表

---

## 4. Jobs to Be Done (JTBD)

| Priority | Job Statement |
|----------|---------------|
| 1 | 當我在篩選器看到技術訊號符合條件的個股時，我想要立刻記錄一筆模擬買單，這樣我就能事後驗證這個訊號的準確性。 |
| 2 | 當我在個股頁面確認技術分析後，我想要快速模擬下單而不離開當前頁面，這樣我就不會因為流程繁瑣而放棄紀錄。 |
| 3 | 當我想回顧過去的模擬操作時，我想要在一個集中的列表看到所有紀錄，這樣我就能評估哪些技術訊號真的有效。 |

---

## 5. User Stories

| ID | Role | Action | Benefit | JTBD Ref |
|----|------|--------|---------|----------|
| US1 | 交易者 | 在篩選器結果列點擊「模擬下單」按鈕 | 不需跳轉頁面就能快速紀錄 | J1 |
| US2 | 交易者 | 在彈窗中確認即時股價並填寫數量後送出 | 確保下單價格與當下市場一致 | J1, J2 |
| US3 | 交易者 | 在個股頁面點擊「模擬下單」 | 看完分析後立即記錄操作意圖 | J2 |
| US4 | 交易者 | 在下單紀錄頁面查看所有歷史訂單 | 集中檢視所有模擬操作 | J3 |
| US5 | 交易者 | 刪除錯誤的下單紀錄 | 保持紀錄的準確性 | J3 |

---

## 6. Proposed Experience

**Design Direction:**
延續現有 StockSage 深色介面風格。下單流程走 **Modal 確認模式**，讓使用者不離開當前頁面，降低操作摩擦。Modal 明確顯示即時股價，強化「這是當下市場價格」的心理錨定。

**Key Screens / States:**
- **OrderFormModal**：下單確認彈窗，顯示股票代號、即時價格（loading skeleton）、方向選擇（Buy/Sell）、數量輸入、備注欄、確認按鈕
- **SimulatedOrdersPage**：全部下單紀錄列表，支援依股票代號與方向篩選
- **Empty state**：「尚無模擬下單紀錄，前往技術篩選器開始驗證你的訊號」+ 跳轉連結
- **Error state**：股價抓取失敗時，Modal 顯示「無法取得即時價格，請稍後再試」並停用確認按鈕
- **Loading state**：股價顯示 skeleton；送出後按鈕轉為 loading spinner 並 disabled

**Interaction Model — Primary flow（從篩選器）：**
1. 使用者在 ScreenerResultTable 某一列點擊「模擬下單」icon/按鈕
2. OrderFormModal 開啟，自動帶入股票代號，背景呼叫 API 取得即時股價
3. 使用者選擇 Buy / Sell，輸入數量（預設 1000 股），選填備注
4. 點擊「確認下單」→ POST 到後端 → Modal 關閉，頁面顯示 toast 通知「模擬買單已記錄」

**Accessibility Notes:**
- Modal 開啟時 focus trap，ESC 鍵關閉
- Buy/Sell 使用 radio group，具備 ARIA label
- 數量輸入欄有 min=1 驗證

---

## 7. Component Inventory

| Component | Type | Description | Linked Stories |
|-----------|------|-------------|----------------|
| `OrderFormModal` | Modal | 下單確認彈窗，含即時報價、方向、數量、備注 | US1, US2, US3 |
| `OrderDirectionToggle` | Form | Buy / Sell 切換，視覺上綠色/紅色區分 | US2 |
| `QuantityInput` | Form | 數量輸入，整數驗證，min=1 | US2 |
| `LivePriceDisplay` | Display | 顯示即時股價，含 loading skeleton 與 error fallback | US2 |
| `OrderRecordTable` | Display | 下單紀錄列表，含欄位排序 | US4 |
| `OrderFilterBar` | Form | 股票代號輸入 + 方向下拉篩選 | US4 |
| `DeleteOrderButton` | Action | 刪除單筆紀錄，含確認提示 | US5 |
| `OrdersEmptyState` | Display | 無紀錄時的引導提示 | US4 |
| `SimulatedOrderPage` | Layout | 包含 FilterBar + Table 的頁面容器 | US4 |

---

## 8. Data Models

```typescript
// 對應 PostgreSQL table: simulated_orders
interface SimulatedOrder {
  id: number;                    // SERIAL PRIMARY KEY
  symbol: string;                // 股票代號, e.g. "2330.TW"
  direction: "buy" | "sell";
  quantity: number;              // 正整數
  price: number;                 // 下單當下的即時股價 (float)
  note: string | null;           // 選填備注
  created_at: string;            // ISO8601, server-side timestamp
}

// API Request body
interface CreateOrderRequest {
  symbol: string;
  direction: "buy" | "sell";
  quantity: number;
  note?: string;
  // price 由後端即時抓取，不由前端傳入，防止竄改
}

// API Response / List
interface OrderListResponse {
  data: SimulatedOrder[];
  total: number;
}
```

---

## 9. API / Integration Surface

| Method | Path | Description | Auth Required | Response Shape |
|--------|------|-------------|---------------|----------------|
| GET | `/api/orders` | 取得所有下單紀錄，支援 `?symbol=` `?direction=` query params | No | `OrderListResponse` |
| POST | `/api/orders` | 建立新模擬下單，後端即時抓取股價寫入 | No | `SimulatedOrder` |
| DELETE | `/api/orders/{id}` | 刪除指定紀錄 | No | `{ "success": true }` |
| GET | `/api/orders/price/{symbol}` | 取得股票即時價格（供 Modal preview 用） | No | `{ "symbol": str, "price": float }` |

**External integrations:**
- **yfinance**：沿用現有 `app/services/market_data.py`，呼叫 `get_current_price(symbol)` 取得即時報價

---

## 10. State Management Map

| State | Location | Persistence | Notes |
|-------|----------|-------------|-------|
| `isOrderModalOpen` | Local UI (component state) | Session | Modal 開/關，不需跨元件共享 |
| `selectedSymbol` | Local UI (props) | Session | 從觸發點傳入 Modal |
| `livePrice` | Local UI (useOrders hook) | Session | 每次開 Modal 重新 fetch |
| `orderList` | Server (PostgreSQL) | Persistent | 唯一 source of truth |
| `filterParams` | URL query string | Session | `?symbol=&direction=`，支援分享/書籤 |

---

## 11. Tech Stack

沿用現有架構，無需新增套件。

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + JSX + Tailwind CSS v4 |
| Backend | FastAPI |
| Database | PostgreSQL 16，新增 `simulated_orders` table |
| ORM / Migration | SQLAlchemy + Alembic |
| 即時股價 | yfinance（現有 `market_data.py`） |

---

## 12. Suggested File Structure

```
frontend/src/
├── pages/
│   └── SimulatedOrdersPage.jsx       # 新增：下單紀錄頁面
├── components/
│   ├── OrderFormModal.jsx             # 新增：下單彈窗
│   ├── OrderDirectionToggle.jsx       # 新增
│   ├── LivePriceDisplay.jsx           # 新增
│   ├── OrderRecordTable.jsx           # 新增
│   ├── OrderFilterBar.jsx             # 新增
│   ├── ScreenerResultTable.jsx        # 修改：加入「模擬下單」按鈕
│   └── StockDetail.jsx                # 修改：加入「模擬下單」按鈕
├── hooks/
│   └── useOrders.js                   # 新增：封裝 orders API 呼叫
└── lib/
    └── api.js                         # 修改：加入 orders 相關 API 函式

backend/app/
├── api/
│   └── orders.py                      # 新增：orders router
├── db/
│   ├── models.py                      # 修改：加入 SimulatedOrder model
│   └── crud.py                        # 修改：加入 orders CRUD
└── alembic/versions/
    └── xxxx_add_simulated_orders.py   # 新增：migration
```

---

## 13. Acceptance Criteria

**US1 — 從篩選器觸發下單**
- [ ] ScreenerResultTable 每一列包含「模擬下單」觸發按鈕
- [ ] 點擊後 OrderFormModal 開啟，且 symbol 欄位已自動填入該列股票代號
- [ ] Modal 開啟時自動呼叫 `GET /api/orders/price/{symbol}`

**US2 — 填寫並確認下單**
- [ ] Modal 顯示即時股價，價格載入中時顯示 skeleton
- [ ] 股價 API 失敗時顯示錯誤訊息，確認按鈕 disabled
- [ ] Buy/Sell 方向預設為 Buy，可切換，視覺上綠/紅色區分
- [ ] 數量欄位預設 1000，僅接受正整數，送出時若為空或 ≤ 0 顯示 inline validation error
- [ ] 點擊確認後按鈕轉為 loading，`POST /api/orders` 成功後 Modal 關閉並顯示 toast
- [ ] 後端以 server-side 即時抓取的價格寫入，忽略前端傳入的 price 欄位

**US3 — 從個股頁面觸發下單**
- [ ] StockDetail 頁面 header 區域有「模擬下單」按鈕
- [ ] 行為與 US1/US2 相同，symbol 自動帶入當前個股代號

**US4 — 查看下單紀錄**
- [ ] `/orders` 路由對應 SimulatedOrdersPage
- [ ] 頁面載入時呼叫 `GET /api/orders`，渲染 OrderRecordTable
- [ ] Table 欄位包含：股票代號、方向（Buy/Sell 標籤）、數量、成交價、下單時間、備注
- [ ] 可依股票代號（文字輸入）篩選，filter params 反映在 URL query string
- [ ] 可依方向（Buy / Sell / All）篩選
- [ ] 無資料時顯示 empty state，含連結至 ScreenerPage
- [ ] 100 筆資料內頁面渲染 ≤ 1 秒

**US5 — 刪除紀錄**
- [ ] 每列有刪除按鈕，點擊後顯示 inline 確認（「確定刪除？確認 / 取消」）
- [ ] 確認後呼叫 `DELETE /api/orders/{id}`，成功後該列從 table 移除
- [ ] 刪除失敗時顯示 toast error，列保留不消失

---

## 14. Open Questions & Risks

- **Q:** 即時股價是否需要顯示最後更新時間？yfinance 在非交易時段返回的是延遲價格 — *Owner: PM*
- **Risk:** yfinance 在台股收盤後或假日返回 `None`，需在後端處理此邊界情況並回傳明確錯誤碼 — *Mitigation: market_data.py 加入 price 為 None 時的 HTTP 422 回應*
- **Tradeoff:** price 由後端抓取（非前端傳入）增加了一次額外 yfinance 呼叫，但確保價格資料不可被前端竄改

---

## 15. Rollout & Next Steps

**MVP scope:**
- 包含：US1–US5 全部，市價單，即時報價，基本 CRUD
- 不含：P&L 計算、圖表標注、CSV 匯出

**Phase 2+ ideas:**
- 顯示每筆訂單的未實現損益（需定期更新現價）
- 在 K 線圖上標注下單位置
- 依時間範圍篩選紀錄
- 匯出 CSV 供外部分析

**開發順序建議：**
1. 建立 Alembic migration `add_simulated_orders`
2. 實作 `backend/app/db/models.py` — 加入 SimulatedOrder model
3. 實作 `backend/app/db/crud.py` — 加入 orders CRUD
4. 實作 `backend/app/api/orders.py` — FastAPI router
5. 實作 `frontend/src/lib/api.js` — 加入 orders API 函式
6. 實作 `frontend/src/hooks/useOrders.js`
7. 實作 `OrderFormModal` 及子元件
8. 實作 `SimulatedOrdersPage` + `OrderRecordTable`
9. 整合 ScreenerResultTable 與 StockDetail 的入口按鈕
10. 加入 `/orders` 路由至 App.jsx
