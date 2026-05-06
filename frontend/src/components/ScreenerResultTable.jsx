const CONDITION_LABELS = {
  trend_bullish: { text: '多頭趨勢', color: 'bg-emerald-900 text-emerald-300' },
  trend_bearish: { text: '空頭趨勢', color: 'bg-rose-900 text-rose-300' },
  rsi_oversold: { text: 'RSI 超賣', color: 'bg-blue-900 text-blue-300' },
  rsi_overbought: { text: 'RSI 超買', color: 'bg-orange-900 text-orange-300' },
  rsi_in_range: { text: 'RSI 在範圍', color: 'bg-slate-700 text-slate-300' },
  macd_golden_cross: { text: 'MACD 金叉', color: 'bg-emerald-900 text-emerald-300' },
  macd_dead_cross: { text: 'MACD 死叉', color: 'bg-rose-900 text-rose-300' },
  macd_hist_positive: { text: 'MACD 柱正', color: 'bg-teal-900 text-teal-300' },
  above_ma20: { text: '>MA20', color: 'bg-indigo-900 text-indigo-300' },
  above_ma60: { text: '>MA60', color: 'bg-indigo-900 text-indigo-300' },
  ma20_above_ma60: { text: '多頭排列', color: 'bg-emerald-900 text-emerald-300' },
  bb_breakout_upper: { text: '突破上軌', color: 'bg-orange-900 text-orange-300' },
  bb_near_lower: { text: '靠近下軌', color: 'bg-blue-900 text-blue-300' },
}

function fmt(val, digits = 2) {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(digits)
}

function TrendBadge({ trend }) {
  if (!trend) return <span className="text-slate-600">—</span>
  const styles = {
    bullish: 'text-emerald-400',
    bearish: 'text-rose-400',
    neutral: 'text-slate-400',
  }
  const labels = { bullish: '↑ 多頭', bearish: '↓ 空頭', neutral: '→ 中性' }
  return <span className={styles[trend] ?? 'text-slate-400'}>{labels[trend] ?? trend}</span>
}

function ConditionBadges({ conditions }) {
  if (!conditions.length) return <span className="text-slate-600 text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {conditions.map((c) => {
        const meta = CONDITION_LABELS[c] ?? { text: c, color: 'bg-slate-700 text-slate-300' }
        return (
          <span key={c} className={`text-xs px-1.5 py-0.5 rounded font-medium ${meta.color}`}>
            {meta.text}
          </span>
        )
      })}
    </div>
  )
}

export default function ScreenerResultTable({ results, onSelectTicker, onOpenOrder }) {
  const matched = results.filter((r) => r.matched)
  const unmatched = results.filter((r) => !r.matched)
  const sorted = [...matched, ...unmatched]

  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
      {/* 摘要列 */}
      <div className="px-5 py-3 border-b border-[#2d3148] flex items-center gap-4">
        <span className="text-sm text-slate-400">
          掃描 <span className="text-slate-200 font-medium">{results.length}</span> 支
        </span>
        <span className="text-sm text-slate-400">
          符合{' '}
          <span className="text-emerald-400 font-medium">{matched.length}</span> 支
        </span>
        <span className="text-sm text-slate-400">
          不符合{' '}
          <span className="text-slate-500 font-medium">{unmatched.length}</span> 支
        </span>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-[#2d3148]">
              <Th>Ticker</Th>
              <Th>收盤價</Th>
              <Th>RSI</Th>
              <Th>MACD</Th>
              <Th>MA20</Th>
              <Th>MA60</Th>
              <Th>趨勢</Th>
              <Th>符合條件</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <ResultRow
                key={row.ticker}
                row={row}
                onSelectTicker={onSelectTicker}
                onOpenOrder={onOpenOrder}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }) {
  return <th className="px-4 py-2.5 text-left font-medium">{children}</th>
}

function ResultRow({ row, onSelectTicker, onOpenOrder }) {
  const { ticker, matched, matched_conditions, indicators, error } = row
  const dim = !matched ? 'opacity-40' : ''

  if (error) {
    return (
      <tr className="border-b border-[#2d3148] opacity-40">
        <td className="px-4 py-3 font-mono font-medium text-slate-300">{ticker}</td>
        <td className="px-4 py-3 text-rose-400 text-xs" colSpan={7}>
          {error}
        </td>
        <td />
      </tr>
    )
  }

  const handleOpenOrder = () => onOpenOrder?.(ticker)

  const ind = indicators ?? {}

  return (
    <tr
      className={`border-b border-[#2d3148] hover:bg-[#1e2235] transition-colors ${dim}`}
    >
      <td className="px-4 py-3 font-mono font-semibold text-slate-200">{ticker}</td>
      <td className="px-4 py-3 text-slate-300">{fmt(ind.close)}</td>
      <td className="px-4 py-3 text-slate-300">
        <RsiCell rsi={ind.rsi} />
      </td>
      <td className="px-4 py-3 text-slate-300">{fmt(ind.macd)}</td>
      <td className="px-4 py-3 text-slate-300">{fmt(ind.ma20)}</td>
      <td className="px-4 py-3 text-slate-300">{fmt(ind.ma60)}</td>
      <td className="px-4 py-3">
        <TrendBadge trend={ind.trend} />
      </td>
      <td className="px-4 py-3">
        <ConditionBadges conditions={matched_conditions} />
      </td>
      <td className="px-4 py-3">
        {matched && (
          <div className="flex items-center gap-3 justify-end whitespace-nowrap">
            {onOpenOrder && (
              <button
                onClick={handleOpenOrder}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                模擬下單
              </button>
            )}
            <button
              onClick={() => onSelectTicker(ticker)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              查看詳情 →
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

function RsiCell({ rsi }) {
  if (rsi === null || rsi === undefined) return <span className="text-slate-600">—</span>
  const color =
    rsi < 30 ? 'text-blue-400' : rsi > 70 ? 'text-orange-400' : 'text-slate-300'
  return <span className={color}>{fmt(rsi)}</span>
}
