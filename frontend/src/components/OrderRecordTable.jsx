import { useState } from 'react'

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function DirectionBadge({ direction }) {
  if (direction === 'buy') {
    return (
      <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-900/60 text-emerald-300">
        買進
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded font-medium bg-rose-900/60 text-rose-300">
      賣出
    </span>
  )
}

export default function OrderRecordTable({ orders, loading, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null)

  if (loading) {
    return (
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-12 text-center">
        <p className="text-slate-400 mb-2">尚無模擬下單紀錄</p>
        <p className="text-xs text-slate-600">前往技術篩選器開始驗證你的訊號</p>
      </div>
    )
  }

  const handleDeleteClick = async (id) => {
    if (confirmingId !== id) {
      setConfirmingId(id)
      return
    }
    try {
      await onDelete(id)
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-[#2d3148]">
              <Th>股票代號</Th>
              <Th>方向</Th>
              <Th>數量</Th>
              <Th>成交價</Th>
              <Th>下單時間</Th>
              <Th>備注</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-[#2d3148] hover:bg-[#1e2235] transition-colors"
              >
                <td className="px-4 py-3 font-mono font-semibold text-slate-200">{o.symbol}</td>
                <td className="px-4 py-3">
                  <DirectionBadge direction={o.direction} />
                </td>
                <td className="px-4 py-3 text-slate-300">{o.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-300">{Number(o.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{formatTime(o.created_at)}</td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-[240px] truncate">
                  {o.note || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {confirmingId === o.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-slate-400">確定刪除？</span>
                      <button
                        onClick={() => handleDeleteClick(o.id)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        確認
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(o.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
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
    </div>
  )
}

function Th({ children }) {
  return <th className="px-4 py-2.5 text-left font-medium">{children}</th>
}
