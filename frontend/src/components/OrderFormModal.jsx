import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'

export default function OrderFormModal({ open, symbol, onClose, onSubmit }) {
  const [price, setPrice] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState(null)
  const [direction, setDirection] = useState('buy')
  const [quantity, setQuantity] = useState(1000)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open || !symbol) return
    setDirection('buy')
    setQuantity(1000)
    setNote('')
    setSubmitError(null)
    setPrice(null)
    setPriceError(null)
    setPriceLoading(true)
    api
      .getOrderPrice(symbol)
      .then((data) => setPrice(data.price))
      .catch((e) => setPriceError(e.message))
      .finally(() => setPriceLoading(false))
  }, [open, symbol])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const canSubmit = !priceLoading && !priceError && price !== null && quantity > 0 && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({ symbol, direction, quantity: Number(quantity), note: note.trim() || null })
      onClose()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="模擬下單"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1729] border border-white/5 rounded-xl w-full max-w-md p-6 focus:outline-none glow"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">模擬下單</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl leading-none"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <div className="mb-5 bg-white/[0.02] rounded-lg border border-white/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">股票代號</div>
          <div className="font-mono text-lg font-semibold text-white mb-3">{symbol}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">即時股價</div>
          <LivePrice loading={priceLoading} error={priceError} price={price} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="方向" className="grid grid-cols-2 gap-2">
            <DirectionButton
              label="買進"
              active={direction === 'buy'}
              onClick={() => setDirection('buy')}
              activeCls="bg-rose-500/15 border-rose-500/50 text-rose-300"
            />
            <DirectionButton
              label="賣出"
              active={direction === 'sell'}
              onClick={() => setDirection('sell')}
              activeCls="bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">數量</span>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-400/40 num"
            />
            {quantity !== '' && Number(quantity) <= 0 && (
              <span className="text-xs text-rose-300">數量必須大於 0</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">備註（選填）</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-400/40 resize-none"
              placeholder="例如：RSI 超賣反彈進場"
            />
          </label>

          {submitError && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
              {submitError}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:bg-white/5 rounded-lg text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSubmit
                  ? direction === 'buy'
                    ? 'linear-gradient(135deg,#f43f5e,#fb7185)'
                    : 'linear-gradient(135deg,#10b981,#34d399)'
                  : '#334155',
              }}
            >
              {submitting ? '送出中…' : `確認${direction === 'buy' ? '買進' : '賣出'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LivePrice({ loading, error, price }) {
  if (loading) {
    return <div className="h-7 w-24 bg-white/5 rounded animate-pulse" />
  }
  if (error) return <div className="text-sm text-rose-300">{error}</div>
  if (price === null) return <span className="text-slate-500">—</span>
  return <div className="num text-xl font-semibold text-white">{price.toFixed(2)}</div>
}

function DirectionButton({ label, active, onClick, activeCls }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`py-2.5 border rounded-lg text-sm font-medium transition-colors ${
        active ? activeCls : 'border-white/10 text-slate-400 hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  )
}
