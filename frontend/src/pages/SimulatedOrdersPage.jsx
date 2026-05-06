import { useState, useMemo, useEffect } from 'react'
import OrderRecordTable from '../components/OrderRecordTable'
import { useOrders } from '../hooks/useOrders'
import { BCard, BTopBar, PrimaryButton } from '../components/ui'

function readFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const dir = params.get('direction')
  return {
    symbol: params.get('symbol') || '',
    direction: dir === 'buy' || dir === 'sell' ? dir : '',
  }
}

export default function SimulatedOrdersPage({ onToast }) {
  const initial = useMemo(() => readFromUrl(), [])
  const [symbolInput, setSymbolInput] = useState(initial.symbol)
  const [direction, setDirection] = useState(initial.direction)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const trimmed = symbolInput.trim().toUpperCase()
    if (trimmed) params.set('symbol', trimmed)
    else params.delete('symbol')
    if (direction) params.set('direction', direction)
    else params.delete('direction')
    const qs = params.toString()
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [symbolInput, direction])

  useEffect(() => {
    const onPopState = () => {
      const fromUrl = readFromUrl()
      setSymbolInput(fromUrl.symbol)
      setDirection(fromUrl.direction)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const filters = useMemo(
    () => ({
      symbol: symbolInput.trim().toUpperCase() || undefined,
      direction: direction || undefined,
    }),
    [symbolInput, direction]
  )

  const { orders, loading, error, remove } = useOrders(filters)

  const buyCount = orders.filter((o) => o.direction === 'buy').length
  const sellCount = orders.filter((o) => o.direction === 'sell').length

  return (
    <main className="flex-1 overflow-y-auto">
      <BTopBar
        title="模擬下單紀錄"
        subtitle="所有模擬下單以後端抓取的即時股價記錄，供事後驗證技術訊號"
      />
      <div className="p-6 space-y-4">
        {/* Filter bar */}
        <BCard className="p-4 flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">股票代號</span>
            <input
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="AAPL / 2330.TW"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-400/40 w-48"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">方向</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-400/40 w-32"
            >
              <option value="">全部</option>
              <option value="buy">買進</option>
              <option value="sell">賣出</option>
            </select>
          </label>
          {(symbolInput || direction) && (
            <button
              type="button"
              onClick={() => {
                setSymbolInput('')
                setDirection('')
              }}
              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-2 ml-auto"
            >
              清除條件
            </button>
          )}
        </BCard>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile label="總筆數" value={orders.length} unit="筆" />
          <KpiTile label="買進" value={buyCount} unit="筆" valueClass="up" />
          <KpiTile label="賣出" value={sellCount} unit="筆" valueClass="dn" />
          <KpiTile label="當前篩選" value={(symbolInput || direction) ? '已過濾' : '全部'} />
        </div>

        {error && (
          <BCard className="px-5 py-4 text-rose-300 text-sm border-rose-500/30">{error}</BCard>
        )}

        <OrderRecordTable
          orders={orders}
          loading={loading}
          onDelete={remove}
          onError={(msg) => onToast?.(`刪除失敗：${msg}`, 'error')}
        />
      </div>
    </main>
  )
}

function KpiTile({ label, value, unit, valueClass = 'text-white' }) {
  return (
    <BCard className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`num text-xl font-semibold mt-1 ${valueClass}`}>{value}</div>
      {unit && <div className="text-xs text-slate-400 mt-0.5">{unit}</div>}
    </BCard>
  )
}
