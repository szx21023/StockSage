import { useEffect } from 'react'

export default function Toast({ message, kind = 'success', onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, duration, onDismiss])

  if (!message) return null

  const cls =
    kind === 'success'
      ? 'bg-blue-500/15 border-blue-400/30 text-blue-200'
      : 'bg-rose-500/15 border-rose-500/30 text-rose-200'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg border backdrop-blur-md text-sm shadow-lg ${cls}`}
    >
      {message}
    </div>
  )
}
