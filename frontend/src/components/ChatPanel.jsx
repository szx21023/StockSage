import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

export default function ChatPanel({ ticker }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api
      .chatHistory(ticker)
      .then((data) => setMessages(data.messages || []))
      .catch(() => {})
  }, [ticker])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e?.preventDefault()
    if (!input.trim() || sending) return
    const msg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setSending(true)
    try {
      const data = await api.chat(msg, ticker ?? null)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `錯誤：${e.message}` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
            AI 對話
          </span>
          {ticker && <span className="text-[10px] text-slate-500 font-mono">焦點：{ticker}</span>}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">claude-sonnet-4.6</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-slate-500 text-sm text-center mt-8">
            {ticker ? `問我關於 ${ticker} 的任何問題` : '問我任何股票問題'}
          </div>
        )}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {sending && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-medium text-blue-100"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
            >
              AI
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4">
        <form
          onSubmit={send}
          className="bg-white/5 border border-white/10 rounded-xl flex items-end gap-2 px-4 py-3 focus-within:border-blue-400/40"
        >
          <span className="text-blue-400">✨</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder-slate-500 min-w-0"
            placeholder={ticker ? `問我關於 ${ticker} 的任何問題…` : '輸入問題…'}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-3 py-1 text-xs text-blue-100 rounded-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
          >
            送出 ↵
          </button>
        </form>
      </div>
    </div>
  )
}

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-medium ${
          isUser ? 'bg-white/10 text-slate-300' : 'text-blue-100'
        }`}
        style={!isUser ? { background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' } : {}}
      >
        {isUser ? '你' : 'AI'}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-500/15 text-blue-50 border border-blue-400/20 rounded-br-sm'
              : 'bg-white/5 text-slate-200 border border-white/5 rounded-bl-sm'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
