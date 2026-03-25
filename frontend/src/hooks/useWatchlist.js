import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useWatchlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWatchlist = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getWatchlist()
      setItems(data.items)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const add = useCallback(async (item) => {
    await api.addToWatchlist(item)
    await fetchWatchlist()
  }, [fetchWatchlist])

  const remove = useCallback(async (ticker) => {
    await api.removeFromWatchlist(ticker)
    setItems((prev) => prev.filter((i) => i.ticker !== ticker))
  }, [])

  return { items, loading, error, add, remove, refresh: fetchWatchlist }
}
