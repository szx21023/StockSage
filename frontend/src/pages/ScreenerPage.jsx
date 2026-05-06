import ScreenerFilterPanel from '../components/ScreenerFilterPanel'
import ScreenerResultTable from '../components/ScreenerResultTable'
import { useScreener } from '../hooks/useScreener'

export default function ScreenerPage({ watchlistItems, onSelectTicker, onOpenOrder }) {
  const {
    filters,
    logic,
    tickerSource,
    manualInput,
    scanning,
    results,
    error,
    updateFilter,
    setLogic,
    setTickerSource,
    setManualInput,
    resetFilters,
    scan,
  } = useScreener()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">技術面篩選</h1>
        <p className="text-slate-500 text-sm mt-1">
          設定技術指標條件，批次掃描股票池中符合的標的
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* 左欄：篩選條件 */}
        <div className="w-72 flex-shrink-0">
          <ScreenerFilterPanel
            filters={filters}
            logic={logic}
            tickerSource={tickerSource}
            manualInput={manualInput}
            watchlistCount={watchlistItems.length}
            onUpdateFilter={updateFilter}
            onSetLogic={setLogic}
            onSetTickerSource={setTickerSource}
            onSetManualInput={setManualInput}
            onReset={resetFilters}
            onScan={() => scan(watchlistItems)}
            scanning={scanning}
          />
        </div>

        {/* 右欄：結果 */}
        <div className="flex-1 min-w-0">
          {scanning && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">正在掃描，請稍候...</p>
              <p className="text-xs mt-1 text-slate-600">每支股票約需 1-3 秒</p>
            </div>
          )}

          {error && !scanning && (
            <div className="bg-rose-950 border border-rose-800 rounded-xl px-5 py-4 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {!scanning && !error && results === null && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-600">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">設定條件後點擊「開始掃描」</p>
            </div>
          )}

          {!scanning && results && (
            <ScreenerResultTable
              results={results.results}
              onSelectTicker={onSelectTicker}
              onOpenOrder={onOpenOrder}
            />
          )}
        </div>
      </div>
    </div>
  )
}
