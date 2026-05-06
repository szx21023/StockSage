import { fmtMoney, fmtPct, pnlColor } from '../lib/format'

function StatBlock({ label, value, sub, valueClass = 'text-slate-100' }) {
  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl px-5 py-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1 tabular-nums">{sub}</div>}
    </div>
  )
}

export default function PortfolioSummaryCard({ summary, loading }) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1a1d27] border border-[#2d3148] rounded-xl px-5 py-4 h-[88px] animate-pulse" />
        ))}
      </div>
    )
  }
  if (!summary) return null

  const {
    total_market_value,
    total_cost,
    unrealized_pnl,
    unrealized_pct,
    realized_pnl,
    total_pnl,
    position_count,
    stale_count,
  } = summary

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatBlock
        label="總市值"
        value={fmtMoney(total_market_value)}
        sub={`成本 ${fmtMoney(total_cost)}・${position_count} 檔${stale_count > 0 ? `（${stale_count} 檔無價）` : ''}`}
      />
      <StatBlock
        label="未實現損益"
        value={fmtMoney(unrealized_pnl)}
        sub={fmtPct(unrealized_pct)}
        valueClass={pnlColor(unrealized_pnl)}
      />
      <StatBlock
        label="已實現損益"
        value={fmtMoney(realized_pnl)}
        valueClass={pnlColor(realized_pnl)}
      />
      <StatBlock
        label="總損益"
        value={fmtMoney(total_pnl)}
        sub="未實現 + 已實現"
        valueClass={pnlColor(total_pnl)}
      />
    </div>
  )
}
