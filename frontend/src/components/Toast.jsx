import { useEffect } from 'react'

export default function Toast({ message, kind = 'success', onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, duration, onDismiss])

  if (!message) return null

  const colorCls =
    kind === 'success'
      ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
      : 'bg-rose-900/90 border-rose-700 text-rose-200'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm text-sm ${colorCls}`}
    >
      {message}
    </div>
  )
}
