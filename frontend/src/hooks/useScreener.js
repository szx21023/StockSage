import { useState } from 'react'
import { api } from '../lib/api'

const DEFAULT_FILTERS = {
  trend: null,
  rsi_min: null,
  rsi_max: null,
  macd_cross: null,
  macd_hist_rising: null,
  price_above_ma20: null,
  price_above_ma60: null,
  ma20_above_ma60: null,
  bb_breakout_upper: null,
  bb_near_lower: null,
}

export function useScreener() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [logic, setLogic] = useState('AND')
  const [tickerSource, setTickerSource] = useState('watchlist') // 'watchlist' | 'manual'
  const [manualInput, setManualInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setLogic('AND')
    setResults(null)
    setError(null)
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((v) => v !== null && v !== false).length
  }

  const scan = async (watchlistItems = []) => {
    let tickers = []

    if (tickerSource === 'watchlist') {
      tickers = watchlistItems.map((item) => {
        if (item.market === 'TW' && !item.ticker.endsWith('.TW')) {
          return `${item.ticker}.TW`
        }
        return item.ticker
      })
    } else {
      tickers = manualInput
        .split(/[,\n\s]+/)
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean)
    }

    if (tickers.length === 0) {
      setError('請選擇或輸入至少一支股票')
      return
    }

    if (getActiveFilterCount() === 0) {
      setError('請至少設定一個篩選條件')
      return
    }

    setScanning(true)
    setError(null)
    setResults(null)

    try {
      const data = await api.screenerScan(tickers, filters, logic)
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setScanning(false)
    }
  }

  return {
    filters,
    logic,
    tickerSource,
    manualInput,
    scanning,
    results,
    error,
    updateFilter,
    setLogic,
    setTickerSource,
    setManualInput,
    resetFilters,
    scan,
    getActiveFilterCount,
  }
}
