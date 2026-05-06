export function fmtMoney(value, { signed = false, fractionDigits = 2 } = {}) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 && signed ? '+' : value < 0 ? '-' : ''
  const abs = Math.abs(value)
  return `${sign}$${abs.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`
}

export function fmtPct(value) {
  if (value === null || value === undefined) return ''
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function pnlColor(value) {
  if (value === null || value === undefined || value === 0) return 'text-slate-300'
  return value > 0 ? 'text-emerald-400' : 'text-rose-400'
}
