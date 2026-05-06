import { useState } from 'react'
import { BCard } from './ui'

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function DirectionBadge({ direction }) {
  const cls = direction === 'buy' ? 'up-bg' : 'dn-bg'
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${cls}`}>
      {direction === 'buy' ? '買進' : '賣出'}
    </span>
  )
}

export default function OrderRecordTable({ orders, loading, onDelete, onError }) {
  const [confirmingId, setConfirmingId] = useState(null)

  if (loading) {
    return (
      <BCard className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </BCard>
    )
  }

  if (!orders.length) {
    return (
      <BCard className="p-12 text-center">
        <p className="text-slate-300 mb-2">尚無模擬下單紀錄</p>
        <p className="text-xs text-slate-500">前往技術篩選器開始驗證你的訊號</p>
      </BCard>
    )
  }

  const handleDeleteClick = async (id) => {
    if (confirmingId !== id) {
      setConfirmingId(id)
      return
    }
    try {
      await onDelete(id)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <BCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/5">
            <tr>
              <th className="text-left px-5 py-3">時間</th>
              <th className="text-left px-5 py-3">標的</th>
              <th className="text-left px-5 py-3">方向</th>
              <th className="text-right px-5 py-3">股數</th>
              <th className="text-right px-5 py-3">成交價</th>
              <th className="text-left px-5 py-3">備註</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-white/5 hover:bg-white/[0.02] last:border-b-0"
              >
                <td className="px-5 py-3 num text-slate-400 text-xs">
                  {formatTime(o.created_at)}
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-white font-medium">{o.symbol}</span>
                </td>
                <td className="px-5 py-3">
                  <DirectionBadge direction={o.direction} />
                </td>
                <td className="num text-right px-5 py-3 text-slate-300">
                  {o.quantity.toLocaleString()}
                </td>
                <td className="num text-right px-5 py-3 text-white">
                  {Number(o.price).toFixed(2)}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400 max-w-[280px] truncate">
                  {o.note || '—'}
                </td>
                <td className="text-right px-5 py-3">
                  {confirmingId === o.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-slate-400">確定刪除？</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(o.id)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        確認
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(o.id)}
                      className="text-xs text-rose-400/70 hover:text-rose-300"
                    >
                      刪除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BCard>
  )
}
