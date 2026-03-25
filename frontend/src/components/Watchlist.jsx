import { useState } from 'react'

export default function Watchlist({ items, loading, onAdd, onRemove, onSelect, selectedTicker }) {
  const [form, setForm] = useState({ ticker: '', name: '', market: 'US' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [err, setErr] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.ticker.trim()) return
    setAdding(true)
    setErr(null)
    try {
      await onAdd({ ...form, ticker: form.ticker.trim().toUpperCase() })
      setForm({ ticker: '', name: '', market: 'US' })
      setShowForm(false)
    } catch (e) {
      setErr(e.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">自選股</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-6 h-6 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm leading-none transition-colors"
        >
          {showForm ? '−' : '+'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-3 space-y-2 bg-[#1e2235] rounded-lg p-3">
          <input
            className="w-full bg-[#0f1117] border border-[#2d3148] rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600"
            placeholder="Ticker (e.g. AAPL)"
            value={form.ticker}
            onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
          />
          <input
            className="w-full bg-[#0f1117] border border-[#2d3148] rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600"
            placeholder="公司名稱（選填）"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="w-full bg-[#0f1117] border border-[#2d3148] rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
            value={form.market}
            onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))}
          >
            <option value="US">美股 (US)</option>
            <option value="TW">台股 (TW)</option>
          </select>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button
            type="submit"
            disabled={adding}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
          >
            {adding ? '新增中...' : '新增'}
          </button>
        </form>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {loading && (
          <p className="text-slate-500 text-xs text-center py-4">載入中...</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-4">尚無自選股</p>
        )}
        {items.map((item) => (
          <WatchlistItem
            key={item.id}
            item={item}
            selected={item.ticker === selectedTicker}
            onSelect={() => onSelect(item.ticker)}
            onRemove={() => onRemove(item.ticker)}
          />
        ))}
      </div>
    </div>
  )
}

function WatchlistItem({ item, selected, onSelect, onRemove }) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group transition-colors ${
        selected ? 'bg-indigo-900/40 border border-indigo-700/50' : 'hover:bg-[#1e2235]'
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? 'text-indigo-300' : 'text-slate-200'}`}>
          {item.ticker}
        </p>
        {item.name && (
          <p className="text-xs text-slate-500 truncate">{item.name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
        <span className="text-xs text-slate-600">{item.market}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs transition-all"
          title="移除"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
