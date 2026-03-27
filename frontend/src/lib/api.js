const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

export const api = {
  // Analyze
  analyze: (ticker, companyName = '') =>
    request('POST', `/analyze/${ticker}`, { company_name: companyName }),
  chartData: (ticker, period = '6mo') =>
    request('GET', `/analyze/${ticker}/chart?period=${period}`),

  // Report
  latestReport: (ticker) => request('GET', `/report/${ticker}/latest`),
  reportHistory: (ticker, limit = 10) =>
    request('GET', `/report/${ticker}/history?limit=${limit}`),

  // Watchlist
  getWatchlist: () => request('GET', '/watchlist/'),
  addToWatchlist: (item) => request('POST', '/watchlist/', item),
  removeFromWatchlist: (ticker) => request('DELETE', `/watchlist/${ticker}`),

  // Chat
  chat: (message, ticker = null) => request('POST', '/chat/', { message, ticker }),
  chatHistory: (ticker = null, limit = 20) =>
    request('GET', `/chat/history?${ticker ? `ticker=${ticker}&` : ''}limit=${limit}`),

  // News
  getNews: (ticker, companyName = '', limit = 10) =>
    request('GET', `/news/${ticker}?company_name=${encodeURIComponent(companyName)}&limit=${limit}`),
}
