import PortfolioSummaryCard from '../components/PortfolioSummaryCard'
import PositionTable from '../components/PositionTable'
import { usePortfolio } from '../hooks/usePortfolio'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function PortfolioPage({ onSelectTicker, onGoScreener }) {
  const { summary, positions, asOf, loading, error, refresh } = usePortfolio()

  const isEmpty = !loading && !error && positions.length === 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">持倉損益</h1>
          <p className="text-xs text-slate-500 mt-1">
            從模擬下單聚合的持倉狀態，現價來自 yfinance 即時報價（每 60 秒自動更新）
          </p>
        </div>
        <div className="flex items-center gap-3">
          {asOf && (
            <span className="text-xs text-slate-500">
              更新於 {formatTime(asOf)}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-[#1a1d27] hover:bg-[#1e2235] border border-[#2d3148] hover:border-indigo-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '更新中…' : '刷新'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950 border border-rose-800 rounded-xl px-5 py-4 text-rose-300 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-rose-900 hover:bg-rose-800 border border-rose-700 text-rose-200 rounded-lg transition-colors disabled:opacity-50"
          >
            重試
          </button>
        </div>
      )}

      <PortfolioSummaryCard summary={summary} loading={loading} />

      {isEmpty ? (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-3">目前無持倉</p>
          <p className="text-xs text-slate-600 mb-6">
            下單後會即時聚合到此處顯示
          </p>
          {onGoScreener && (
            <button
              onClick={onGoScreener}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
            >
              前往技術篩選器
            </button>
          )}
        </div>
      ) : (
        <PositionTable
          positions={positions}
          loading={loading}
          onSelectTicker={onSelectTicker}
        />
      )}
    </div>
  )
}
