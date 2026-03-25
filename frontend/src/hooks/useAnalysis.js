import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export function useAnalysis() {
  const [report, setReport] = useState(null)
  const [chartData, setChartData] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingChart, setLoadingChart] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (ticker, companyName = '') => {
    setAnalyzing(true)
    setError(null)
    try {
      const result = await api.analyze(ticker, companyName)
      setReport(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const loadLatestReport = useCallback(async (ticker) => {
    setError(null)
    try {
      const result = await api.latestReport(ticker)
      setReport(result)
    } catch (e) {
      if (!e.message.includes('No analysis')) setError(e.message)
      setReport(null)
    }
  }, [])

  const loadChart = useCallback(async (ticker, period = '6mo') => {
    setLoadingChart(true)
    try {
      const result = await api.chartData(ticker, period)
      setChartData(result.data)
    } catch (e) {
      setChartData([])
    } finally {
      setLoadingChart(false)
    }
  }, [])

  const clearReport = useCallback(() => {
    setReport(null)
    setChartData([])
    setError(null)
  }, [])

  return {
    report, chartData, analyzing, loadingChart, error,
    analyze, loadLatestReport, loadChart, clearReport,
  }
}
