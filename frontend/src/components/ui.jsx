export function BCard({ children, className = '' }) {
  return (
    <div className={`bg-[#0f1729] border border-white/5 rounded-xl ${className}`}>
      {children}
    </div>
  )
}

export function BTopBar({ title, subtitle, right }) {
  return (
    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 bg-[#0b1220]/60 backdrop-blur sticky top-0 z-10">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">{right}</div>
    </div>
  )
}

export function StatusPill({ children }) {
  return (
    <span className="px-2 py-1 text-[10px] rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full live-dot"></span>
      {children}
    </span>
  )
}

export function Mono({ char }) {
  return (
    <div
      className="flex items-center justify-center font-bold bg-white/10 text-white/80 flex-shrink-0"
      style={{ width: 32, height: 32, borderRadius: 4, fontSize: 14, letterSpacing: '-0.02em' }}
    >
      {char}
    </div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`px-3 py-1.5 text-xs text-blue-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`px-3 py-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Spark({ data, color = '#f87171', width = 80, height = 22, fill = false }) {
  if (!data || !data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = width / (data.length - 1 || 1)
  const pts = data
    .map((v, i) => `${(i * stepX).toFixed(2)},${(height - ((v - min) / span) * height).toFixed(2)}`)
    .join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && (
        <polyline points={`0,${height} ${pts} ${width},${height}`} fill={color} fillOpacity="0.12" stroke="none" />
      )}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

