const SECTIONS = [
  { key: 'technical_summary', label: '技術面', color: '#f87171', tag: '技術' },
  { key: 'news_summary', label: '新聞面', color: '#60a5fa', tag: '新聞' },
  { key: 'fundamental_summary', label: '基本面', color: '#22d3ee', tag: '基本' },
]

function scoreFromSentiment(s) {
  if (s === 'bullish') return 0.65
  if (s === 'bearish') return -0.55
  return 0
}

export default function AnalysisReport({ report }) {
  if (!report) return null

  const sentiment = report.sentiment || 'neutral'
  const overallScore = scoreFromSentiment(sentiment)

  return (
    <div>
      <div className="text-sm font-medium text-white mb-4">三維度分析</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTIONS.map((s) => {
          const text = report[s.key]
          if (!text) return null
          return (
            <div key={s.key} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md border"
                  style={{
                    background: `${s.color}1A`,
                    color: s.color,
                    borderColor: `${s.color}33`,
                  }}
                >
                  {s.tag}
                </span>
                <span className="text-xs text-slate-300">{s.label}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full"
                  style={{ background: s.color, width: `${(overallScore + 1) * 50}%` }}
                />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
