import { useState } from 'react'
import Watchlist from '../components/Watchlist'
import StockDetail from './StockDetail'
import ChatPanel from '../components/ChatPanel'
import { useWatchlist } from '../hooks/useWatchlist'

export default function Dashboard() {
  const { items, loading, add, remove } = useWatchlist()
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const ticker = searchInput.trim().toUpperCase()
    if (ticker) {
      setSelectedTicker(ticker)
      setSearchInput('')
    }
  }

  return (
    <div className="flex h-screen bg-[#0f1117] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-[#2d3148] bg-[#13151f] p-4">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-indigo-400">StockSage</h1>
          <p className="text-xs text-slate-600">AI 股票分析</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <input
            className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-colors"
            placeholder="搜尋 Ticker..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        {/* Watchlist */}
        <div className="flex-1 min-h-0">
          <Watchlist
            items={items}
            loading={loading}
            onAdd={add}
            onRemove={remove}
            onSelect={setSelectedTicker}
            selectedTicker={selectedTicker}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {selectedTicker ? (
          <StockDetail
            ticker={selectedTicker}
            onBack={() => setSelectedTicker(null)}
          />
        ) : (
          <Welcome onSearch={(t) => setSelectedTicker(t)} />
        )}
      </main>
    </div>
  )
}

function Welcome({ onSearch }) {
  const [input, setInput] = useState('')

  const handle = (e) => {
    e.preventDefault()
    const t = input.trim().toUpperCase()
    if (t) onSearch(t)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-100 mb-2">StockSage</h2>
        <p className="text-slate-400">AI 驅動的股票分析平台，整合技術面、新聞面、基本面</p>
      </div>

      <form onSubmit={handle} className="flex gap-2 w-full max-w-md">
        <input
          className="flex-1 bg-[#1a1d27] border border-[#2d3148] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 text-lg transition-colors"
          placeholder="輸入股票代號（如 AAPL）"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          分析
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'].map((t) => (
          <button
            key={t}
            onClick={() => onSearch(t)}
            className="py-2 px-4 bg-[#1a1d27] hover:bg-[#1e2235] border border-[#2d3148] hover:border-indigo-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="w-full max-w-lg h-80">
        <ChatPanel ticker={null} />
      </div>
    </div>
  )
}
