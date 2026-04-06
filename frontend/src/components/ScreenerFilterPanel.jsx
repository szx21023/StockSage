export default function ScreenerFilterPanel({
  filters,
  logic,
  tickerSource,
  manualInput,
  watchlistCount,
  onUpdateFilter,
  onSetLogic,
  onSetTickerSource,
  onSetManualInput,
  onReset,
  onScan,
  scanning,
}) {
  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-5 space-y-5">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <h2 className="text-slate-100 font-semibold text-sm">篩選條件</h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          重設
        </button>
      </div>

      {/* Ticker 來源 */}
      <Section label="股票池">
        <div className="flex gap-2 mb-2">
          <SourceBtn
            active={tickerSource === 'watchlist'}
            onClick={() => onSetTickerSource('watchlist')}
          >
            自選股（{watchlistCount} 支）
          </SourceBtn>
          <SourceBtn
            active={tickerSource === 'manual'}
            onClick={() => onSetTickerSource('manual')}
          >
            手動輸入
          </SourceBtn>
        </div>
        {tickerSource === 'manual' && (
          <textarea
            className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 resize-none transition-colors"
            rows={3}
            placeholder="AAPL, TSLA, NVDA（逗號或換行分隔）"
            value={manualInput}
            onChange={(e) => onSetManualInput(e.target.value)}
          />
        )}
      </Section>

      {/* AND / OR */}
      <Section label="條件組合">
        <div className="flex gap-2">
          {['AND', 'OR'].map((l) => (
            <button
              key={l}
              onClick={() => onSetLogic(l)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                logic === l
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#0f1117] text-slate-400 border border-[#2d3148] hover:border-indigo-700'
              }`}
            >
              {l === 'AND' ? 'AND（全部符合）' : 'OR（任一符合）'}
            </button>
          ))}
        </div>
      </Section>

      {/* 趨勢 */}
      <Section label="趨勢方向">
        <div className="flex gap-2">
          {[
            { value: null, label: '不限' },
            { value: 'bullish', label: '往上（多頭）' },
            { value: 'bearish', label: '往下（空頭）' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => onUpdateFilter('trend', value)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filters.trend === value
                  ? value === 'bullish'
                    ? 'bg-emerald-700 text-emerald-100'
                    : value === 'bearish'
                    ? 'bg-rose-700 text-rose-100'
                    : 'bg-indigo-600 text-white'
                  : 'bg-[#0f1117] text-slate-400 border border-[#2d3148] hover:border-indigo-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* RSI */}
      <Section label="RSI">
        <div className="flex flex-wrap gap-2 mb-2">
          <QuickBtn
            active={filters.rsi_max === 30 && filters.rsi_min === null}
            onClick={() => {
              onUpdateFilter('rsi_min', null)
              onUpdateFilter('rsi_max', 30)
            }}
          >
            超賣（&lt;30）
          </QuickBtn>
          <QuickBtn
            active={filters.rsi_min === 70 && filters.rsi_max === null}
            onClick={() => {
              onUpdateFilter('rsi_min', 70)
              onUpdateFilter('rsi_max', null)
            }}
          >
            超買（&gt;70）
          </QuickBtn>
          <QuickBtn
            active={filters.rsi_min === null && filters.rsi_max === null}
            onClick={() => {
              onUpdateFilter('rsi_min', null)
              onUpdateFilter('rsi_max', null)
            }}
          >
            不限
          </QuickBtn>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>自訂</span>
          <NumberInput
            placeholder="最小"
            value={filters.rsi_min}
            onChange={(v) => onUpdateFilter('rsi_min', v)}
          />
          <span>~</span>
          <NumberInput
            placeholder="最大"
            value={filters.rsi_max}
            onChange={(v) => onUpdateFilter('rsi_max', v)}
          />
        </div>
      </Section>

      {/* MACD */}
      <Section label="MACD">
        <div className="flex flex-wrap gap-2 mb-2">
          {[
            { value: null, label: '不限' },
            { value: 'golden', label: '金叉（MACD > Signal）' },
            { value: 'dead', label: '死叉（MACD < Signal）' },
          ].map(({ value, label }) => (
            <QuickBtn
              key={String(value)}
              active={filters.macd_cross === value}
              onClick={() => onUpdateFilter('macd_cross', value)}
            >
              {label}
            </QuickBtn>
          ))}
        </div>
        <CheckboxRow
          checked={filters.macd_hist_positive === true}
          onChange={(v) => onUpdateFilter('macd_hist_positive', v ? true : null)}
          label="MACD 柱為正（動能向上）"
        />
      </Section>

      {/* 均線 */}
      <Section label="均線">
        <div className="space-y-1.5">
          <CheckboxRow
            checked={filters.price_above_ma20 === true}
            onChange={(v) => onUpdateFilter('price_above_ma20', v ? true : null)}
            label="價格 > MA20"
          />
          <CheckboxRow
            checked={filters.price_above_ma60 === true}
            onChange={(v) => onUpdateFilter('price_above_ma60', v ? true : null)}
            label="價格 > MA60"
          />
          <CheckboxRow
            checked={filters.ma20_above_ma60 === true}
            onChange={(v) => onUpdateFilter('ma20_above_ma60', v ? true : null)}
            label="MA20 > MA60（多頭排列）"
          />
        </div>
      </Section>

      {/* 布林通道 */}
      <Section label="布林通道">
        <div className="space-y-1.5">
          <CheckboxRow
            checked={filters.bb_breakout_upper === true}
            onChange={(v) => onUpdateFilter('bb_breakout_upper', v ? true : null)}
            label="價格突破上軌"
          />
          <CheckboxRow
            checked={filters.bb_near_lower === true}
            onChange={(v) => onUpdateFilter('bb_near_lower', v ? true : null)}
            label="價格靠近下軌（±2%）"
          />
        </div>
      </Section>

      {/* 掃描按鈕 */}
      <button
        onClick={onScan}
        disabled={scanning}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
      >
        {scanning ? '掃描中...' : '開始掃描'}
      </button>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

function SourceBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-[#0f1117] text-slate-400 border border-[#2d3148] hover:border-indigo-700'
      }`}
    >
      {children}
    </button>
  )
}

function QuickBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-[#0f1117] text-slate-400 border border-[#2d3148] hover:border-indigo-700'
      }`}
    >
      {children}
    </button>
  )
}

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-slate-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-indigo-600"
      />
      {label}
    </label>
  )
}

function NumberInput({ placeholder, value, onChange }) {
  return (
    <input
      type="number"
      className="w-20 bg-[#0f1117] border border-[#2d3148] rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-colors"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : parseFloat(v))
      }}
    />
  )
}
