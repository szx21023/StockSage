import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const SENTIMENT_LABEL = { positive: '正面', negative: '負面', neutral: '中性' }
const SENTIMENT_STYLE = {
  positive: 'bg-green-900/50 text-green-400',
  negative: 'bg-red-900/50 text-red-400',
  neutral: 'bg-slate-700 text-slate-400',
}

export default function NewsPanel({ ticker }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    api.getNews(ticker)
      .then(data => setArticles(data.articles || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [ticker])

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h2 className="text-slate-100 font-semibold mb-3">近期新聞</h2>

      {loading && (
        <div className="text-slate-400 text-sm">載入中...</div>
      )}

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-slate-500 text-sm">暫無新聞資料</div>
      )}

      <div className="flex flex-col gap-2">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-700 hover:bg-slate-600 rounded-lg p-3 transition-colors"
          >
            <div className="text-slate-100 text-sm font-medium leading-snug">
              {article.title}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{article.source}</span>
              {article.published_at && (
                <>
                  <span>·</span>
                  <span>{formatDate(article.published_at)}</span>
                </>
              )}
              {article.sentiment && (
                <span className={`ml-auto px-1.5 py-0.5 rounded font-medium ${SENTIMENT_STYLE[article.sentiment]}`}>
                  {SENTIMENT_LABEL[article.sentiment]}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
