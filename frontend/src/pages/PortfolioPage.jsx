import { BCard, BTopBar, SecondaryButton } from '../components/ui'
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

export default function PortfolioPage({ onSelectTicker, setView }) {
  const { summary, positions, asOf, loading, error, refresh } = usePortfolio()
  const isEmpty = !loading && !error && positions.length === 0

  return (
    <main className="flex-1 overflow-y-auto">
      <BTopBar
        title="持倉損益"
        subtitle="從模擬下單聚合的持倉狀態 ・ 每 60 秒刷新"
        right={
          <>
            {asOf && (
              <span className="text-xs text-slate-500 font-mono">
                {formatTime(asOf)} 更新
              </span>
            )}
            <SecondaryButton onClick={refresh} disabled={loading}>
              {loading ? '更新中…' : '刷新'}
            </SecondaryButton>
          </>
        }
      />
      <div className="p-6 space-y-4">
        {error && (
          <BCard className="px-5 py-4 flex items-center justify-between gap-4 border-rose-500/30">
            <span className="text-rose-300 text-sm">{error}</span>
            <SecondaryButton onClick={refresh} disabled={loading}>
              重試
            </SecondaryButton>
          </BCard>
        )}

        <PortfolioSummaryCard summary={summary} loading={loading} />

        {isEmpty ? (
          <BCard className="p-12 text-center">
            <p className="text-slate-300 mb-2">目前無持倉</p>
            <p className="text-xs text-slate-500 mb-6">下單後會即時聚合到此處顯示</p>
            <button
              type="button"
              onClick={() => setView('screener')}
              className="px-4 py-2 text-sm text-blue-100 rounded-lg"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
            >
              前往技術篩選器 →
            </button>
          </BCard>
        ) : (
          <PositionTable
            positions={positions}
            loading={loading}
            summary={summary}
            onSelectTicker={onSelectTicker}
          />
        )}
      </div>
    </main>
  )
}
