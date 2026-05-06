import { fmtMoney, fmtPct, pnlColor } from '../lib/format'
import { BCard } from './ui'

export default function PortfolioSummaryCard({ summary, loading }) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <BCard className="col-span-12 md:col-span-5 p-5 h-[180px] animate-pulse" />
        {[0, 1, 2].map((i) => (
          <BCard key={i} className="col-span-12 md:col-span-3 p-5 h-[180px] animate-pulse" />
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
    <div className="grid grid-cols-12 gap-4">
      <BCard className="col-span-12 md:col-span-5 p-5 relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(closest-side,#60a5fa,transparent)' }}
        />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            總市值
          </div>
          <div className="num text-4xl font-semibold text-white mt-2">
            {fmtMoney(total_market_value, { fractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`num font-medium ${pnlColor(unrealized_pnl)}`}>
              {fmtMoney(unrealized_pnl, { signed: true, fractionDigits: 0 })} (
              {fmtPct(unrealized_pct)})
            </span>
            <span className="text-xs text-slate-500">未實現</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3">
            成本 {fmtMoney(total_cost, { fractionDigits: 0 })} ・ {position_count} 檔
            {stale_count > 0 ? ` ・ ${stale_count} 檔無價` : ''}
          </div>
        </div>
      </BCard>

      <KpiTile
        label="未實現損益"
        value={fmtMoney(unrealized_pnl, { signed: true, fractionDigits: 0 })}
        sub={fmtPct(unrealized_pct)}
        pnlClass={pnlColor(unrealized_pnl)}
      />
      <KpiTile
        label="已實現損益"
        value={fmtMoney(realized_pnl, { signed: true, fractionDigits: 0 })}
        sub="累計"
        pnlClass={pnlColor(realized_pnl)}
      />
      <KpiTile
        label="總損益"
        value={fmtMoney(total_pnl, { signed: true, fractionDigits: 0 })}
        sub="未實現 + 已實現"
        pnlClass={pnlColor(total_pnl)}
      />
    </div>
  )
}

function KpiTile({ label, value, sub, pnlClass }) {
  return (
    <BCard className="col-span-12 md:col-span-3 sm:col-span-6 p-5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`num text-2xl font-semibold mt-2 ${pnlClass}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </BCard>
  )
}
