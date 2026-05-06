import { fmtMoney, fmtPct, pnlColor } from '../lib/format'
import { BCard, Mono } from './ui'

export default function PositionTable({ positions, loading, summary, onSelectTicker }) {
  if (loading && !positions.length) {
    return (
      <BCard className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </BCard>
    )
  }

  if (!positions.length) return null

  const total = summary?.total_market_value ?? positions.reduce((s, p) => s + (p.market_value || 0), 0)

  return (
    <BCard className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="text-sm font-medium text-white">持倉明細</div>
        <span className="text-[10px] text-slate-500 font-mono">{positions.length} 檔</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/5">
            <tr>
              <th className="text-left px-5 py-3">標的</th>
              <th className="text-right px-5 py-3">股數</th>
              <th className="text-right px-5 py-3">均價</th>
              <th className="text-right px-5 py-3">現價</th>
              <th className="text-right px-5 py-3">市值</th>
              <th className="text-right px-5 py-3">未實現損益</th>
              <th className="text-right px-5 py-3">已實現</th>
              <th className="text-left px-5 py-3 w-48">配置</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const stale = p.price_error !== null && p.price_error !== undefined
              const pct = total > 0 && p.market_value ? (p.market_value / total) * 100 : 0
              return (
                <tr
                  key={p.symbol}
                  onClick={() => onSelectTicker?.(p.symbol)}
                  className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Mono char={p.symbol[0]} />
                      <div>
                        <div className="text-sm text-white font-medium">{p.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num text-right px-5 py-3 text-slate-300">
                    {p.quantity.toLocaleString()}
                  </td>
                  <td className="num text-right px-5 py-3 text-slate-300">
                    {fmtMoney(p.avg_cost)}
                  </td>
                  <td className={`num text-right px-5 py-3 ${stale ? 'text-slate-500' : 'text-white'}`}>
                    {stale ? <span title={p.price_error}>—</span> : fmtMoney(p.current_price)}
                  </td>
                  <td className="num text-right px-5 py-3 text-white">
                    {fmtMoney(p.market_value)}
                  </td>
                  <td className={`num text-right px-5 py-3 font-medium ${pnlColor(p.unrealized_pnl)}`}>
                    <div>{fmtMoney(p.unrealized_pnl, { signed: true })}</div>
                    {p.unrealized_pct !== null && p.unrealized_pct !== undefined && (
                      <div className="text-xs">{fmtPct(p.unrealized_pct)}</div>
                    )}
                  </td>
                  <td className={`num text-right px-5 py-3 ${pnlColor(p.realized_pnl)}`}>
                    {fmtMoney(p.realized_pnl, { signed: true })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400"
                          style={{ width: `${pct.toFixed(1)}%` }}
                        />
                      </div>
                      <span className="num text-[10px] text-slate-400 w-9 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </BCard>
  )
}
