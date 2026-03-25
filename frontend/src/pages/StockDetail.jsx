import { useEffect, useState } from 'react'
import Chart from '../components/Chart'
import AnalysisReport from '../components/AnalysisReport'
import ChatPanel from '../components/ChatPanel'
import { useAnalysis } from '../hooks/useAnalysis'

export default function StockDetail({ ticker, onBack }) {
  const { report, chartData, analyzing, loadingChart, error, analyze, loadLatestReport, loadChart } = useAnalysis()
  const [period, setPeriod] = useState('6mo')

  useEffect(() => {
    if (!ticker) return
    loadLatestReport(ticker)
    loadChart(ticker, period)
  }, [ticker])

  useEffect(() => {
    if (!ticker) return
    loadChart(ticker, period)
  }, [period])

  if (!ticker) return null

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Ticker header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-slate-100">{ticker}</h1>
        {error && (
          <span className="text-red-400 text-sm">{error}</span>
        )}
      </div>

      {/* Chart */}
      <Chart
        data={chartData}
        period={period}
        onPeriodChange={setPeriod}
        loading={loadingChart}
      />

      {/* Analysis + Chat side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '400px' }}>
        <div className="lg:col-span-3">
          <AnalysisReport
            report={report}
            analyzing={analyzing}
            onAnalyze={analyze}
            ticker={ticker}
          />
        </div>
        <div className="lg:col-span-2">
          <ChatPanel ticker={ticker} />
        </div>
      </div>
    </div>
  )
}
