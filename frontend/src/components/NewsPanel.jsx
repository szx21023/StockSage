import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { BCard } from './ui'

const SENTIMENT_LABEL = { positive: '正面', negative: '負面', neutral: '中性' }

function sentimentClass(s) {
  if (s === 'positive') return 'up-bg'
  if (s === 'negative') return 'dn-bg'
  return 'bg-white/5 text-slate-400'
}

function sentimentBar(s) {
  if (s === 'positive') return 'bg-rose-400'
  if (s === 'negative') return 'bg-emerald-400'
  return 'bg-slate-500'
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export default function NewsPanel({ ticker }) {
  // Initial loading=true when ticker is set so the skeleton shows on first paint
  // without a synchronous setState in the effect. Caller can pass key={ticker}
  // to force remount on ticker change; the cancelled flag also guards against
  // an in-flight response landing on a stale ticker.
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(!!ticker)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticker) return
    let cancelled = false
    api
      .getNews(ticker)
      .then((data) => {
        if (!cancelled) setArticles(data.articles || [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ticker])

  return (
    <BCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white">近期新聞</div>
        <span className="text-[10px] text-slate-500 font-mono">
          {articles.length} 則
        </span>
      </div>

      {loading && <div className="text-slate-400 text-sm py-6 text-center">載入中…</div>}
      {error && <div className="text-rose-300 text-sm py-3">{error}</div>}
      {!loading && !error && articles.length === 0 && (
        <div className="text-slate-500 text-sm py-6 text-center">暫無新聞資料</div>
      )}

      <div className="space-y-2.5">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2.5 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`w-1 rounded-full flex-shrink-0 ${sentimentBar(article.sentiment)}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-200 leading-snug">{article.title}</div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                {article.source && <span>{article.source}</span>}
                {article.published_at && (
                  <>
                    <span>•</span>
                    <span>{formatDate(article.published_at)}</span>
                  </>
                )}
                {article.sentiment && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[9px] ${sentimentClass(
                      article.sentiment
                    )}`}
                  >
                    {SENTIMENT_LABEL[article.sentiment]}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </BCard>
  )
}
