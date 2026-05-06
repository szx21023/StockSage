import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'

export default function Chart({ data, loading }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      width: el.offsetWidth || 800,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: '#0f1729' },
        textColor: '#5b6478',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true },
    })

    // TW convention: red up, green down
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#f87171',
      downColor: '#34d399',
      borderUpColor: '#f87171',
      borderDownColor: '#34d399',
      wickUpColor: '#f87171',
      wickDownColor: '#34d399',
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
    seriesRef.current.setData(
      data.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    )
    chartRef.current?.timeScale().fitContent()
  }, [data])

  return (
    <div className="relative grid-bg rounded-lg overflow-hidden" style={{ height: 380 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f1729]/80 z-10">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: 380 }} />
    </div>
  )
}
