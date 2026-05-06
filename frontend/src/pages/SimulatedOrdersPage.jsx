import { useState, useMemo, useEffect } from 'react'
import OrderRecordTable from '../components/OrderRecordTable'
import { useOrders } from '../hooks/useOrders'

function readFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const dir = params.get('direction')
  return {
    symbol: params.get('symbol') || '',
    direction: dir === 'buy' || dir === 'sell' ? dir : '',
  }
}

export default function SimulatedOrdersPage() {
  const initial = useMemo(readFromUrl, [])
  const [symbolInput, setSymbolInput] = useState(initial.symbol)
  const [direction, setDirection] = useState(initial.direction)

  // Sync state → URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const trimmed = symbolInput.trim().toUpperCase()
    if (trimmed) params.set('symbol', trimmed)
    else params.delete('symbol')
    if (direction) params.set('direction', direction)
    else params.delete('direction')
    const qs = params.toString()
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [symbolInput, direction])

  // Sync URL → state on browser back/forward
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100">模擬下單紀錄</h1>
        <p className="text-xs text-slate-500 mt-1">
          所有模擬下單都以後端抓取的即時股價記錄，供事後驗證技術訊號
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">股票代號</span>
          <input
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            placeholder="AAPL / 2330.TW"
            className="bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 w-48"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">方向</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-600 w-32"
          >
            <option value="">全部</option>
            <option value="buy">買進</option>
            <option value="sell">賣出</option>
          </select>
        </label>
        {(symbolInput || direction) && (
          <button
            onClick={() => {
              setSymbolInput('')
              setDirection('')
            }}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-2"
          >
            清除條件
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950 border border-rose-800 rounded-xl px-5 py-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <OrderRecordTable orders={orders} loading={loading} onDelete={remove} />
    </div>
  )
}
