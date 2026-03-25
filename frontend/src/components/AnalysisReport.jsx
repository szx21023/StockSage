const SENTIMENT_STYLES = {
  bullish: { label: '看漲', cls: 'bg-green-900/50 text-green-400 border border-green-800' },
  bearish: { label: '看跌', cls: 'bg-red-900/50 text-red-400 border border-red-800' },
  neutral: { label: '中性', cls: 'bg-slate-700/50 text-slate-300 border border-slate-600' },
}

export default function AnalysisReport({ report, analyzing, onAnalyze, ticker }) {
  if (analyzing) {
    return (
      <div className="bg-[#1a1d27] rounded-xl border border-[#2d3148] p-8 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">AI 分析中，請稍候...</p>
        <p className="text-slate-500 text-xs">Claude 正在分析技術面、新聞面、基本面</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-[#1a1d27] rounded-xl border border-[#2d3148] p-8 flex flex-col items-center gap-4">
        <p className="text-slate-400 text-sm">尚無分析報告</p>
        <button
          onClick={() => onAnalyze(ticker)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          開始 AI 分析
        </button>
      </div>
    )
  }

  const sentiment = SENTIMENT_STYLES[report.sentiment] ?? SENTIMENT_STYLES.neutral
  const date = report.analyzed_at
    ? new Date(report.analyzed_at).toLocaleString('zh-TW')
    : null

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-[#2d3148] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3148]">
        <span className="text-sm font-medium text-slate-300">AI 分析報告</span>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sentiment.cls}`}>
            {sentiment.label}
          </span>
          <button
            onClick={() => onAnalyze(ticker)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
          >
            重新分析
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall */}
        {report.overall_summary && (
          <Section title="綜合判斷" accent="indigo">
            {report.overall_summary}
          </Section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {report.technical_summary && (
            <Section title="技術面" accent="blue">
              {report.technical_summary}
            </Section>
          )}
          {report.news_summary && (
            <Section title="新聞面" accent="purple">
              {report.news_summary}
            </Section>
          )}
          {report.fundamental_summary && (
            <Section title="基本面" accent="cyan">
              {report.fundamental_summary}
            </Section>
          )}
        </div>

        {date && (
          <p className="text-xs text-slate-600 text-right">分析時間：{date}</p>
        )}
      </div>
    </div>
  )
}

function Section({ title, accent, children }) {
  const accentMap = {
    indigo: 'border-indigo-700 bg-indigo-950/30',
    blue: 'border-blue-800 bg-blue-950/30',
    purple: 'border-purple-800 bg-purple-950/30',
    cyan: 'border-cyan-800 bg-cyan-950/30',
  }
  return (
    <div className={`rounded-lg border p-3 ${accentMap[accent]}`}>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  )
}
