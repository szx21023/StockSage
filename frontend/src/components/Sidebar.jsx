import { useState } from 'react'
import { Mono } from './ui'

const NAV_ITEMS = [
  ['home', '◇', '總覽'],
  ['stock', '↗', '個股分析'],
  ['screener', '⚙', '技術篩選'],
  ['portfolio', '◧', '持倉損益'],
  ['orders', '❑', '下單紀錄'],
  ['chat', '◐', 'AI 對話'],
]

export default function Sidebar({ view, setView, watchlist, selectedTicker, onSelectTicker, onToast }) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    const ticker = search.trim().toUpperCase()
    if (ticker) {
      onSelectTicker(ticker)
      setSearch('')
    }
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0a1120] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#60a5fa,#22d3ee)' }}
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">StockSage</div>
            <div className="text-[10px] text-slate-500">AI Stock Intelligence</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="p-3 border-b border-white/5">
        <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:ring-1 focus-within:ring-blue-400/40">
          <span className="text-slate-500">⌕</span>
          <input
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder-slate-500 min-w-0"
            placeholder="搜尋 Ticker…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 bg-white/5 rounded">↵</span>
        </div>
      </form>

      {/* Nav */}
      <nav className="p-3 space-y-0.5">
        {NAV_ITEMS.map(([k, icon, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setView(k)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              view === k
                ? 'bg-blue-500/15 text-blue-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span className="w-4 text-center text-xs opacity-70">{icon}</span>
            <span>{label}</span>
            {view === k && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
          </button>
        ))}
      </nav>

      {/* Watchlist */}
      <div className="px-3 mt-2 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-3 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">自選股</div>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="text-blue-400 text-sm leading-none hover:text-blue-300"
            aria-label="新增自選股"
          >
            {showAdd ? '×' : '＋'}
          </button>
        </div>

        {showAdd && (
          <AddWatchlistForm
            onAdd={async (item) => {
              await watchlist.add(item)
              setShowAdd(false)
            }}
          />
        )}

        <div className="space-y-0.5 overflow-y-auto flex-1">
          {watchlist.loading && (
            <div className="text-slate-500 text-xs text-center py-4">載入中…</div>
          )}
          {!watchlist.loading && watchlist.items.length === 0 && (
            <div className="text-slate-600 text-xs text-center py-4">尚無自選股</div>
          )}
          {watchlist.items.map((t) => (
            <div
              key={t.id ?? t.ticker}
              onClick={() => onSelectTicker(t.ticker)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer group ${
                selectedTicker === t.ticker ? 'bg-blue-500/10' : 'hover:bg-white/5'
              }`}
            >
              <Mono char={(t.ticker || '?')[0]} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-200 font-medium truncate">{t.ticker}</div>
                <div className="text-[10px] text-slate-500 truncate">{t.name || t.market || ''}</div>
              </div>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    await watchlist.remove(t.ticker)
                  } catch (err) {
                    onToast?.(`移除自選股失敗：${err.message}`, 'error')
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-300 text-xs"
                aria-label="移除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI usage */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-lg p-3 border border-blue-500/10">
          <div className="text-[10px] uppercase tracking-wider text-blue-300/80 mb-1">本日 AI 用量</div>
          <div className="text-sm text-slate-200 num">14 / 50 次</div>
          <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
              style={{ width: '28%' }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

function AddWatchlistForm({ onAdd }) {
  const [ticker, setTicker] = useState('')
  const [name, setName] = useState('')
  const [market, setMarket] = useState('US')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!ticker.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await onAdd({ ticker: ticker.trim().toUpperCase(), name: name.trim(), market })
      setTicker('')
      setName('')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-lg p-2.5 mb-2 space-y-1.5">
      <input
        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-400/40"
        placeholder="Ticker (AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <input
        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-400/40"
        placeholder="名稱（選填）"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-400/40"
        value={market}
        onChange={(e) => setMarket(e.target.value)}
      >
        <option value="US">美股 (US)</option>
        <option value="TW">台股 (TW)</option>
      </select>
      {err && <div className="text-[10px] text-rose-300">{err}</div>}
      <button
        type="submit"
        disabled={busy}
        className="w-full py-1 text-[11px] text-blue-100 rounded disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
      >
        {busy ? '新增中…' : '新增'}
      </button>
    </form>
  )
}
