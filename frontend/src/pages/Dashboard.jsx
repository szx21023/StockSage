import { useState, useCallback } from 'react'
import HomePage from './HomePage'
import StockDetail from './StockDetail'
import ScreenerPage from './ScreenerPage'
import SimulatedOrdersPage from './SimulatedOrdersPage'
import PortfolioPage from './PortfolioPage'
import ChatPage from './ChatPage'
import OrderFormModal from '../components/OrderFormModal'
import Toast from '../components/Toast'
import Sidebar from '../components/Sidebar'
import { useWatchlist } from '../hooks/useWatchlist'
import { api } from '../lib/api'

export default function Dashboard() {
  const watchlist = useWatchlist()
  const [view, setView] = useState('home')
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [orderModalSymbol, setOrderModalSymbol] = useState(null)
  const [toast, setToast] = useState(null)

  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker)
    setView('stock')
  }

  const handleOpenOrder = (symbol) => setOrderModalSymbol(symbol)
  const handleCloseOrder = () => setOrderModalSymbol(null)
  const handleSubmitOrder = async (order) => {
    await api.createOrder(order)
    setToast({
      message: order.direction === 'buy' ? '模擬買單已記錄' : '模擬賣單已記錄',
      kind: 'success',
    })
  }

  // Stable callback so child components don't re-trigger Toast's auto-dismiss
  // timer on every Dashboard render.
  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind })
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0b1220' }}>
      <Sidebar
        view={view}
        setView={setView}
        watchlist={watchlist}
        selectedTicker={selectedTicker}
        onSelectTicker={handleSelectTicker}
        onToast={showToast}
      />

      {view === 'home' && (
        <HomePage
          watchlist={watchlist}
          onSelectTicker={handleSelectTicker}
          setView={setView}
        />
      )}
      {view === 'stock' && (
        <StockDetail
          ticker={selectedTicker}
          onSelectTicker={handleSelectTicker}
          onOpenOrder={handleOpenOrder}
        />
      )}
      {view === 'screener' && (
        <ScreenerPage
          watchlistItems={watchlist.items}
          onSelectTicker={handleSelectTicker}
          onOpenOrder={handleOpenOrder}
        />
      )}
      {view === 'portfolio' && (
        <PortfolioPage onSelectTicker={handleSelectTicker} setView={setView} />
      )}
      {view === 'orders' && <SimulatedOrdersPage onToast={showToast} />}
      {view === 'chat' && <ChatPage selectedTicker={selectedTicker} />}

      <OrderFormModal
        open={orderModalSymbol !== null}
        symbol={orderModalSymbol}
        onClose={handleCloseOrder}
        onSubmit={handleSubmitOrder}
      />

      <Toast
        message={toast?.message}
        kind={toast?.kind}
        onDismiss={() => setToast(null)}
      />
    </div>
  )
}
