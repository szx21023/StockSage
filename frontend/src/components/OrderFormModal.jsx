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

  // Reset + fetch price when modal opens with a symbol
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

  // ESC to close + initial focus on dialog (no Tab trap)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="模擬下單"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1d27] border border-[#2d3148] rounded-xl w-full max-w-md p-6 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">模擬下單</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl leading-none"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        {/* Symbol + Live price */}
        <div className="mb-5 bg-[#0f1117] rounded-lg border border-[#2d3148] p-4">
          <div className="text-xs text-slate-500 mb-1">股票代號</div>
          <div className="font-mono text-lg font-semibold text-slate-100 mb-3">{symbol}</div>
          <div className="text-xs text-slate-500 mb-1">即時股價</div>
          <LivePriceDisplay loading={priceLoading} error={priceError} price={price} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Direction toggle */}
          <div role="radiogroup" aria-label="方向" className="grid grid-cols-2 gap-2">
            <DirectionButton
              label="買進"
              value="buy"
              active={direction === 'buy'}
              onClick={() => setDirection('buy')}
              activeCls="bg-emerald-900/60 border-emerald-600 text-emerald-300"
            />
            <DirectionButton
              label="賣出"
              value="sell"
              active={direction === 'sell'}
              onClick={() => setDirection('sell')}
              activeCls="bg-rose-900/60 border-rose-600 text-rose-300"
            />
          </div>

          {/* Quantity */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">數量</span>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-600"
            />
            {quantity !== '' && Number(quantity) <= 0 && (
              <span className="text-xs text-rose-400">數量必須大於 0</span>
            )}
          </label>

          {/* Note */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">備注（選填）</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 resize-none"
              placeholder="例如：RSI 超賣反彈進場"
            />
          </label>

          {/* Submit error */}
          {submitError && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 rounded px-3 py-2">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#2d3148] text-slate-300 hover:bg-[#1e2235] rounded-lg text-sm transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                canSubmit
                  ? direction === 'buy'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? '送出中...' : `確認${direction === 'buy' ? '買進' : '賣出'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LivePriceDisplay({ loading, error, price }) {
  if (loading) {
    return <div className="h-7 w-24 bg-slate-700/50 rounded animate-pulse" />
  }
  if (error) {
    return <div className="text-sm text-rose-400">{error}</div>
  }
  if (price === null) {
    return <span className="text-slate-600">—</span>
  }
  return <div className="text-xl font-semibold text-slate-100">{price.toFixed(2)}</div>
}

function DirectionButton({ label, active, onClick, activeCls }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`py-2.5 border rounded-lg text-sm font-medium transition-colors ${
        active ? activeCls : 'border-[#2d3148] text-slate-400 hover:bg-[#1e2235]'
      }`}
    >
      {label}
    </button>
  )
}
