import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

export default function ChatPanel({ ticker }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.chatHistory(ticker).then((data) => setMessages(data.messages)).catch(() => {})
  }, [ticker])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
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
    <div className="flex flex-col h-full bg-[#1a1d27] rounded-xl border border-[#2d3148] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d3148]">
        <h3 className="text-sm font-medium text-slate-300">
          AI 助理{ticker ? ` — ${ticker}` : ''}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-slate-600 text-xs text-center mt-8">
            {ticker ? `問我關於 ${ticker} 的任何問題` : '問我任何股票問題'}
          </p>
        )}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {sending && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-indigo-700 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs">AI</span>
            </div>
            <div className="bg-[#1e2235] rounded-lg px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
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
      <form onSubmit={send} className="p-3 border-t border-[#2d3148] flex gap-2">
        <input
          className="flex-1 bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-colors"
          placeholder="輸入問題..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
        >
          送出
        </button>
      </form>
    </div>
  )
}

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
          isUser ? 'bg-slate-700 text-slate-300' : 'bg-indigo-700 text-indigo-200'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-900/40 text-indigo-100'
            : 'bg-[#1e2235] text-slate-200'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
