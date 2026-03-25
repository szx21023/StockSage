import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'

const PERIODS = ['1mo', '3mo', '6mo', '1y', '2y']

export default function Chart({ data, period, onPeriodChange, loading }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      width: el.offsetWidth || 800,
      height: 340,
      layout: {
        background: { type: ColorType.Solid, color: '#1a1d27' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e2235' },
        horzLines: { color: '#1e2235' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#2d3148' },
      timeScale: { borderColor: '#2d3148', timeVisible: true },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    seriesRef.current = candleSeries

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.offsetWidth })
      }
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !data?.length) return
    seriesRef.current.setData(data.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })))
    chartRef.current?.timeScale().fitContent()
  }, [data])

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-[#2d3148]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3148]">
        <span className="text-sm font-medium text-slate-300">K 線圖</span>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="relative" style={{ height: '340px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d27]/80 z-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '340px' }} />
      </div>
    </div>
  )
}
