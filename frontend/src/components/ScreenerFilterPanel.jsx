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
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">篩選條件</div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-slate-500 hover:text-slate-300"
        >
          重設
        </button>
      </div>

      <Section label="股票池">
        <div className="grid grid-cols-2 gap-2">
          <SourceBtn
            active={tickerSource === 'watchlist'}
            onClick={() => onSetTickerSource('watchlist')}
          >
            自選股 ・ {watchlistCount}
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
            className="w-full mt-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-400/40 resize-none"
            rows={3}
            placeholder="AAPL, TSLA, NVDA"
            value={manualInput}
            onChange={(e) => onSetManualInput(e.target.value)}
          />
        )}
      </Section>

      <Section label="條件邏輯">
        <div className="bg-white/5 rounded-lg p-1 grid grid-cols-2 gap-1">
          <LogicBtn active={logic === 'AND'} onClick={() => onSetLogic('AND')}>
            AND
          </LogicBtn>
          <LogicBtn active={logic === 'OR'} onClick={() => onSetLogic('OR')}>
            OR
          </LogicBtn>
        </div>
      </Section>

      <Section label="趨勢方向">
        <div className="grid grid-cols-3 gap-1.5">
          <TrendBtn
            active={filters.trend === 'bullish'}
            kind="bullish"
            onClick={() => onUpdateFilter('trend', filters.trend === 'bullish' ? null : 'bullish')}
          >
            ↑ 多頭
          </TrendBtn>
          <TrendBtn
            active={filters.trend === null}
            kind="neutral"
            onClick={() => onUpdateFilter('trend', null)}
          >
            → 不限
          </TrendBtn>
          <TrendBtn
            active={filters.trend === 'bearish'}
            kind="bearish"
            onClick={() => onUpdateFilter('trend', filters.trend === 'bearish' ? null : 'bearish')}
          >
            ↓ 空頭
          </TrendBtn>
        </div>
      </Section>

      <Section label="RSI 區間">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <NumberInput
            placeholder="最小"
            value={filters.rsi_min}
            onChange={(v) => onUpdateFilter('rsi_min', v)}
          />
          <span>～</span>
          <NumberInput
            placeholder="最大"
            value={filters.rsi_max}
            onChange={(v) => onUpdateFilter('rsi_max', v)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Quick
            active={filters.rsi_max === 30 && filters.rsi_min === null}
            onClick={() => {
              onUpdateFilter('rsi_min', null)
              onUpdateFilter('rsi_max', 30)
            }}
          >
            超賣 &lt;30
          </Quick>
          <Quick
            active={filters.rsi_min === 70 && filters.rsi_max === null}
            onClick={() => {
              onUpdateFilter('rsi_min', 70)
              onUpdateFilter('rsi_max', null)
            }}
          >
            超買 &gt;70
          </Quick>
        </div>
      </Section>

      <Section label="MACD">
        <Checkbox
          checked={filters.macd_cross === 'golden'}
          onChange={(v) => onUpdateFilter('macd_cross', v ? 'golden' : null)}
        >
          MACD 金叉
        </Checkbox>
        <Checkbox
          checked={filters.macd_hist_positive === true}
          onChange={(v) => onUpdateFilter('macd_hist_positive', v ? true : null)}
        >
          MACD 柱為正
        </Checkbox>
        <Checkbox
          checked={filters.macd_cross === 'dead'}
          onChange={(v) => onUpdateFilter('macd_cross', v ? 'dead' : null)}
        >
          MACD 死叉
        </Checkbox>
      </Section>

      <Section label="均線">
        <Checkbox
          checked={filters.price_above_ma20 === true}
          onChange={(v) => onUpdateFilter('price_above_ma20', v ? true : null)}
        >
          價格 &gt; MA20
        </Checkbox>
        <Checkbox
          checked={filters.ma20_above_ma60 === true}
          onChange={(v) => onUpdateFilter('ma20_above_ma60', v ? true : null)}
        >
          MA20 &gt; MA60（多頭排列）
        </Checkbox>
        <Checkbox
          checked={filters.price_above_ma60 === true}
          onChange={(v) => onUpdateFilter('price_above_ma60', v ? true : null)}
        >
          價格 &gt; MA60
        </Checkbox>
      </Section>

      <Section label="布林通道">
        <Checkbox
          checked={filters.bb_breakout_upper === true}
          onChange={(v) => onUpdateFilter('bb_breakout_upper', v ? true : null)}
        >
          價格突破上軌
        </Checkbox>
        <Checkbox
          checked={filters.bb_near_lower === true}
          onChange={(v) => onUpdateFilter('bb_near_lower', v ? true : null)}
        >
          價格靠近下軌
        </Checkbox>
      </Section>

      <button
        type="button"
        onClick={onScan}
        disabled={scanning}
        className="w-full py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
      >
        {scanning ? '掃描中…' : `開始掃描 ・ ${watchlistCount} 支`}
      </button>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function SourceBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-lg text-xs ${
        active
          ? 'bg-blue-500/15 border border-blue-400/30 text-blue-300'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function LogicBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1.5 rounded-md text-xs ${
        active ? 'bg-blue-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function TrendBtn({ active, kind, onClick, children }) {
  const colors = {
    bullish: active
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      : 'bg-white/5 text-slate-400 border-white/10',
    bearish: active
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : 'bg-white/5 text-slate-400 border-white/10',
    neutral: active
      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      : 'bg-white/5 text-slate-400 border-white/10',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-lg border text-xs ${colors[kind]}`}
    >
      {children}
    </button>
  )
}

function Quick({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-[10px] border ${
        active
          ? 'bg-blue-500/15 text-blue-300 border-blue-400/30'
          : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer text-slate-300 hover:text-slate-100">
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
          checked ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-transparent'
        }`}
      >
        {checked && <span className="text-white text-[9px]">✓</span>}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  )
}

function NumberInput({ placeholder, value, onChange }) {
  return (
    <input
      type="number"
      className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-400/40 num"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : parseFloat(v))
      }}
    />
  )
}
