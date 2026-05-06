import { fmtMoney, fmtPct, pnlColor } from '../lib/format'

function Th({ children, align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  return <th className={`px-4 py-2.5 font-medium ${alignClass}`}>{children}</th>
}

function Td({ children, align = 'left', className = '' }) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  return <td className={`px-4 py-3 ${alignClass} ${className}`}>{children}</td>
}

export default function PositionTable({ positions, loading, onSelectTicker }) {
  if (loading && !positions.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!positions.length) {
    return null
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-[#2d3148]">
              <Th>股票代號</Th>
              <Th align="right">持有股數</Th>
              <Th align="right">平均成本</Th>
              <Th align="right">現價</Th>
              <Th align="right">市值</Th>
              <Th align="right">未實現損益</Th>
              <Th align="right">已實現損益</Th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const stale = p.price_error !== null && p.price_error !== undefined
              return (
                <tr
                  key={p.symbol}
                  className="border-b border-[#2d3148] last:border-b-0 hover:bg-[#1e2235] transition-colors cursor-pointer"
                  onClick={() => onSelectTicker?.(p.symbol)}
                >
                  <Td className="font-mono font-semibold text-slate-200">{p.symbol}</Td>
                  <Td align="right" className="text-slate-300">
                    {p.quantity.toLocaleString()}
                  </Td>
                  <Td align="right" className="text-slate-300">
                    {fmtMoney(p.avg_cost)}
                  </Td>
                  <Td align="right" className={stale ? 'text-slate-500' : 'text-slate-300'}>
                    {stale ? (
                      <span title={p.price_error}>—</span>
                    ) : (
                      fmtMoney(p.current_price)
                    )}
                  </Td>
                  <Td align="right" className="text-slate-300">
                    {fmtMoney(p.market_value)}
                  </Td>
                  <Td align="right" className={pnlColor(p.unrealized_pnl)}>
                    <div>{fmtMoney(p.unrealized_pnl, { signed: true })}</div>
                    {p.unrealized_pct !== null && p.unrealized_pct !== undefined && (
                      <div className="text-xs">{fmtPct(p.unrealized_pct)}</div>
                    )}
                  </Td>
                  <Td align="right" className={pnlColor(p.realized_pnl)}>
                    {fmtMoney(p.realized_pnl, { signed: true })}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
