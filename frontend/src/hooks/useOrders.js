import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useOrders({ symbol, direction } = {}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listOrders({ symbol, direction })
      setOrders(data.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [symbol, direction])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(async (id) => {
    await api.deleteOrder(id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }, [])

  return { orders, loading, error, remove }
}
