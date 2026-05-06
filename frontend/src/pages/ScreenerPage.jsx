import { BCard, BTopBar, PrimaryButton } from '../components/ui'
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

  const matched = results?.results?.filter((r) => r.matched) ?? []
  const total = results?.results?.length ?? 0
  const stockCount = watchlistItems.length

  return (
    <main className="flex-1 overflow-y-auto">
      <BTopBar
        title="技術面篩選"
        subtitle="設定指標條件，批次掃描股票池"
        right={
          <PrimaryButton onClick={() => scan(watchlistItems)} disabled={scanning}>
            {scanning ? '掃描中…' : `開始掃描 ・ ${stockCount} 支`}
          </PrimaryButton>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        {/* Filter panel */}
        <BCard className="col-span-12 xl:col-span-3 p-5 self-start">
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
        </BCard>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          {/* KPI strip */}
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <KpiCard label="掃描" value={total} unit="支" color="#60a5fa" />
              <KpiCard
                label="符合"
                value={matched.length}
                unit={`支 ・ ${total ? ((matched.length / total) * 100).toFixed(1) : 0}%`}
                color="#f87171"
              />
              <KpiCard
                label="不符合"
                value={total - matched.length}
                unit="支"
                color="#22d3ee"
              />
            </div>
          )}

          {/* Body */}
          {scanning && (
            <BCard className="p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">正在掃描，請稍候…</p>
              <p className="text-xs mt-1 text-slate-600">每支股票約需 1–3 秒</p>
            </BCard>
          )}

          {error && !scanning && (
            <BCard className="px-5 py-4 text-rose-300 text-sm border-rose-500/30">
              <div style={{ borderColor: 'rgba(244,63,94,0.3)' }}>{error}</div>
            </BCard>
          )}

          {!scanning && !error && results === null && (
            <BCard className="p-16 flex flex-col items-center justify-center text-slate-600">
              <div className="text-4xl mb-3 opacity-60">⌕</div>
              <p className="text-sm">設定條件後點擊「開始掃描」</p>
            </BCard>
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
    </main>
  )
}

function KpiCard({ label, value, unit, color }) {
  return (
    <BCard className="p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22` }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-slate-500 tracking-wider">{label}</div>
        <div className="text-xl text-white font-semibold num">
          {value} <span className="text-xs text-slate-500 font-normal">{unit}</span>
        </div>
      </div>
    </BCard>
  )
}
