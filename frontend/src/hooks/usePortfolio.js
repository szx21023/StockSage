import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'

export function usePortfolio({ pollMs = 60000 } = {}) {
  const [summary, setSummary] = useState(null)
  const [positions, setPositions] = useState([])
  const [asOf, setAsOf] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)
  // 多個 refresh() 並發時用單調遞增 ID 確保只有最新一次的回應寫入 state
  const requestIdRef = useRef(0)
  const hasLoadedRef = useRef(false)

  const refresh = useCallback(async () => {
    const myId = ++requestIdRef.current
    if (!hasLoadedRef.current) setLoading(true)  // 首次載入才顯示骨架，後續 poll 不閃
    setError(null)
    try {
      const [s, p] = await Promise.all([
        api.getPortfolioSummary(),
        api.getPortfolioPositions(),
      ])
      if (!mountedRef.current || myId !== requestIdRef.current) return
      setSummary(s)
      setPositions(p.data || [])
      setAsOf(p.as_of || s.as_of)
    } catch (e) {
      if (!mountedRef.current || myId !== requestIdRef.current) return
      setError(e.message)
      setAsOf(null)  // 失敗時清掉時間戳，避免 stale 數字配新時間戳誤導使用者
    } finally {
      if (mountedRef.current && myId === requestIdRef.current) {
        // 嘗試過就算（成敗皆然），避免後端持續錯誤時每 poll 重閃骨架
        hasLoadedRef.current = true
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    if (!pollMs) return () => { mountedRef.current = false }
    const id = setInterval(refresh, pollMs)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [refresh, pollMs])

  return { summary, positions, asOf, loading, error, refresh }
}
