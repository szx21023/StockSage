import { BCard, Mono } from './ui'

const CONDITION_LABELS = {
  trend_bullish: '多頭排列',
  trend_bearish: '空頭排列',
  rsi_oversold: 'RSI 超賣',
  rsi_overbought: 'RSI 超買',
  rsi_in_range: 'RSI 在範圍',
  macd_golden_cross: 'MACD 金叉',
  macd_dead_cross: 'MACD 死叉',
  macd_hist_positive: 'MACD 柱正',
  above_ma20: '>MA20',
  above_ma60: '>MA60',
  ma20_above_ma60: '多頭排列',
  bb_breakout_upper: '突破上軌',
  bb_near_lower: '靠近下軌',
}

function fmt(val, digits = 2) {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(digits)
}

export default function ScreenerResultTable({ results, onSelectTicker, onOpenOrder }) {
  const matched = results.filter((r) => r.matched)
  const unmatched = results.filter((r) => !r.matched)
  const sorted = [...matched, ...unmatched]

  return (
    <BCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/5">
            <tr>
              <th className="text-left px-4 py-3">標的</th>
              <th className="text-right px-4 py-3">收盤</th>
              <th className="text-right px-4 py-3">RSI</th>
              <th className="text-right px-4 py-3">MACD</th>
              <th className="text-right px-4 py-3">MA20</th>
              <th className="text-left px-4 py-3">趨勢</th>
              <th className="text-left px-4 py-3">符合條件</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <Row
                key={row.ticker}
                row={row}
                onSelectTicker={onSelectTicker}
                onOpenOrder={onOpenOrder}
              />
            ))}
          </tbody>
        </table>
      </div>
    </BCard>
  )
}

function Row({ row, onSelectTicker, onOpenOrder }) {
  const { ticker, matched, matched_conditions = [], indicators, error } = row
  const dim = !matched ? 'opacity-40' : ''

  if (error) {
    return (
      <tr className="border-b border-white/5 opacity-40">
        <td className="px-4 py-3 font-mono text-slate-300">{ticker}</td>
        <td className="px-4 py-3 text-rose-300 text-xs" colSpan={6}>
          {error}
        </td>
        <td />
      </tr>
    )
  }

  const ind = indicators ?? {}
  const trend = ind.trend

  return (
    <tr className={`border-b border-white/5 hover:bg-white/[0.02] ${dim}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Mono char={ticker[0]} />
          <div>
            <div className="text-sm text-white font-medium">{ticker}</div>
          </div>
        </div>
      </td>
      <td className="num text-right px-4 py-3 text-white">{fmt(ind.close)}</td>
      <td
        className={`num text-right px-4 py-3 ${
          ind.rsi > 70 ? 'up' : ind.rsi < 30 ? 'text-cyan-300' : 'text-slate-300'
        }`}
      >
        {fmt(ind.rsi, 1)}
      </td>
      <td className={`num text-right px-4 py-3 ${ind.macd >= 0 ? 'up' : 'dn'}`}>
        {ind.macd >= 0 ? '+' : ''}
        {fmt(ind.macd)}
      </td>
      <td className="num text-right px-4 py-3 text-slate-300">{fmt(ind.ma20)}</td>
      <td className="px-4 py-3">
        {trend === 'bullish' && (
          <span className="text-xs px-2 py-0.5 rounded-md up-bg">↑ 多頭</span>
        )}
        {trend === 'bearish' && (
          <span className="text-xs px-2 py-0.5 rounded-md dn-bg">↓ 空頭</span>
        )}
        {trend === 'neutral' && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">→ 中性</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {matched_conditions.length === 0 && <span className="text-slate-600">—</span>}
          {matched_conditions.map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-400/20"
            >
              {CONDITION_LABELS[c] ?? c}
            </span>
          ))}
        </div>
      </td>
      <td className="text-right px-4 py-3">
        {matched && (
          <div className="flex gap-3 justify-end whitespace-nowrap">
            {onOpenOrder && (
              <button
                type="button"
                onClick={() => onOpenOrder(ticker)}
                className="text-xs text-emerald-300 hover:text-emerald-200"
              >
                下單
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectTicker(ticker)}
              className="text-xs text-blue-300 hover:text-blue-200"
            >
              詳情 →
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
