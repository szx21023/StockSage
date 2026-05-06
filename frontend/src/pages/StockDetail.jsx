import { useEffect, useState } from 'react'
import { BCard, BTopBar, StatusPill, PrimaryButton, SecondaryButton, Mono } from '../components/ui'
import Chart from '../components/Chart'
import AnalysisReport from '../components/AnalysisReport'
import ChatPanel from '../components/ChatPanel'
import NewsPanel from '../components/NewsPanel'
import { useAnalysis } from '../hooks/useAnalysis'

const TABS = [
  ['ai', 'AI 分析報告'],
  ['chart', '技術圖表'],
  ['news', '新聞情緒'],
  ['chat', 'AI 對話'],
]

function SentimentRing({ sentiment, size = 120 }) {
  const score = sentiment === 'bullish' ? 0.7 : sentiment === 'bearish' ? -0.7 : 0
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - (score + 1) / 2)
  const color =
    sentiment === 'bullish' ? '#f87171' : sentiment === 'bearish' ? '#34d399' : '#94a3b8'
  const label =
    sentiment === 'bullish' ? '看多' : sentiment === 'bearish' ? '看空' : '中性'

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#sgrad)"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="sgrad" x1="0" x2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="0.5" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#f87171" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Sentiment</div>
        <div className="num text-2xl font-semibold" style={{ color }}>
          {sentiment === 'bullish' ? '+0.70' : sentiment === 'bearish' ? '-0.70' : '0.00'}
        </div>
        <div className="text-[10px]" style={{ color }}>{label}</div>
      </div>
    </div>
  )
}

export default function StockDetail({ ticker, onSelectTicker, onOpenOrder }) {
  const [tab, setTab] = useState('ai')
  const [period, setPeriod] = useState('6mo')
  const [searchInput, setSearchInput] = useState('')
  const { report, chartData, analyzing, loadingChart, error, analyze, loadLatestReport, loadChart } = useAnalysis()

  useEffect(() => {
    if (!ticker) return
    loadLatestReport(ticker)
    loadChart(ticker, period)
  }, [ticker])

  useEffect(() => {
    if (!ticker) return
    loadChart(ticker, period)
  }, [period])

  if (!ticker) {
    return (
      <main className="flex-1 overflow-y-auto">
        <BTopBar title="個股分析" subtitle="輸入股票代號開啟 AI 分析" />
        <div className="p-6 max-w-xl mx-auto">
          <BCard className="p-8 text-center">
            <div className="text-slate-300 mb-4">請輸入股票代號或從自選股選擇</div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const t = searchInput.trim().toUpperCase()
                if (t) onSelectTicker(t)
              }}
              className="flex gap-2"
            >
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="AAPL / 2330.TW"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-400/40"
              />
              <PrimaryButton type="submit">分析</PrimaryButton>
            </form>
          </BCard>
        </div>
      </main>
    )
  }

  const sentiment = report?.sentiment || 'neutral'

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center gap-4 bg-[#0b1220]/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Mono char={ticker[0]} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold text-white">{ticker}</span>
              <span className="text-xs font-mono text-slate-500">
                {ticker.endsWith('.TW') ? 'TWSE' : 'NASDAQ / NYSE'}
              </span>
            </div>
            {report?.company_name && (
              <div className="text-xs text-slate-400">{report.company_name}</div>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <StatusPill>LIVE</StatusPill>
          {onOpenOrder && (
            <SecondaryButton onClick={() => onOpenOrder(ticker)}>＋ 模擬下單</SecondaryButton>
          )}
          <PrimaryButton onClick={() => analyze(ticker)} disabled={analyzing}>
            {analyzing ? '分析中…' : '✨ 重新分析'}
          </PrimaryButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === k
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {tab === 'ai' && (
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* AI hero */}
          <BCard className="col-span-12 p-6 relative overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(closest-side,rgba(96,165,250,0.5),transparent)' }}
            />
            <div className="relative flex flex-wrap items-start gap-6">
              <SentimentRing sentiment={sentiment} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md bg-blue-500/15 text-blue-300 border border-blue-400/30">
                    AI 綜合判斷
                  </span>
                  {report?.analyzed_at && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      claude-sonnet-4.6 ・ {new Date(report.analyzed_at).toLocaleString('zh-TW')}
                    </span>
                  )}
                </div>
                {analyzing ? (
                  <div className="flex items-center gap-3 py-6">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <div className="text-slate-400 text-sm">AI 分析中，正在整合技術面、新聞、基本面…</div>
                  </div>
                ) : report ? (
                  <>
                    <h2 className="text-xl font-semibold text-white leading-snug mb-2">
                      {sentiment === 'bullish'
                        ? '三維度同向偏多'
                        : sentiment === 'bearish'
                        ? '三維度同向偏空'
                        : '三維度訊號中性'}
                    </h2>
                    {report.overall_summary && (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {report.overall_summary}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-6">
                    <div className="text-slate-400 text-sm mb-3">尚無分析報告</div>
                    <PrimaryButton onClick={() => analyze(ticker)}>開始 AI 分析</PrimaryButton>
                  </div>
                )}
              </div>
            </div>
          </BCard>

          {/* Three dimensions */}
          {report && (
            <BCard className="col-span-12 p-5">
              <AnalysisReport report={report} />
            </BCard>
          )}
        </div>
      )}

      {tab === 'chart' && (
        <div className="p-6 space-y-4">
          <BCard className="p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="text-sm font-medium text-white">價格走勢</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  日 K ・ {period} ・ MA20 / MA60
                </div>
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {['1mo', '3mo', '6mo', '1y', '2y'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
                      period === p ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <Chart data={chartData} loading={loadingChart} />
          </BCard>
        </div>
      )}

      {tab === 'news' && (
        <div className="p-6">
          <NewsPanel key={ticker} ticker={ticker} />
        </div>
      )}

      {tab === 'chat' && (
        <div className="p-6">
          <BCard className="h-[600px] overflow-hidden">
            <ChatPanel ticker={ticker} />
          </BCard>
        </div>
      )}
    </main>
  )
}
