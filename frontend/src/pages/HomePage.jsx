import { BCard, BTopBar, StatusPill, PrimaryButton, SecondaryButton, Mono, Spark } from '../components/ui'
import { fmtMoney, fmtPct, pnlColor } from '../lib/format'
import { sparkSeed } from '../lib/spark'
import { usePortfolio } from '../hooks/usePortfolio'

const INDEX_STRIPS = [
  ['加權', '22,418.12', '+1.23%', 'up'],
  ['SOX', '5,184.7', '+0.68%', 'up'],
  ['NASDAQ', '17,940', '-0.32%', 'dn'],
  ['USD/TWD', '31.92', '-0.04', 'dn'],
]

function nowParts() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return {
    date: `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
    weekday: `星期${weekday}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export default function HomePage({ watchlist, onSelectTicker, setView }) {
  const { date, weekday, time } = nowParts()
  const { summary } = usePortfolio()

  const items = watchlist.items || []

  return (
    <main className="flex-1 overflow-y-auto">
      <BTopBar
        title="總覽"
        subtitle="今日市場、自選股快照、AI 觀點"
        right={
          <>
            <StatusPill>LIVE ・ {time}</StatusPill>
            <PrimaryButton onClick={() => setView('stock')}>✨ 開啟個股分析</PrimaryButton>
          </>
        }
      />
      <div className="px-6 py-5 grid grid-cols-12 gap-4">
        {/* Hero greeting + index strip */}
        <BCard className="col-span-12 p-6 relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(closest-side,rgba(96,165,250,0.5),transparent)' }}
          />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-blue-300/80">
                {date} ・ {weekday} ・ {time}
              </div>
              <div className="text-2xl font-semibold text-white mt-1">
                您好，自選股共 {items.length} 檔
              </div>
              <div className="text-sm text-slate-400 mt-1">
                AI 已就緒 ・ 可分析技術面、新聞、基本面 ・{' '}
                <span
                  className="text-blue-300 cursor-pointer hover:text-blue-200"
                  onClick={() => setView('chat')}
                >
                  打開 AI 對話 →
                </span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6 flex-wrap">
              {INDEX_STRIPS.map(([k, v, p, c]) => (
                <div key={k} className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                  <div className="num text-base text-white">{v}</div>
                  <div className={`num text-xs ${c}`}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </BCard>

        {/* Watchlist snapshot */}
        <BCard className="col-span-12 lg:col-span-8 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-white">自選股快照</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              {items.length} 檔
            </div>
          </div>
          {items.length === 0 ? (
            <div className="text-sm text-slate-500 py-12 text-center">
              尚無自選股，從左側「＋」加入
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((t, i) => {
                const dir = i % 3 === 2 ? -1 : 1
                const sd = sparkSeed(i + 1, 24, dir)
                return (
                  <div
                    key={t.id ?? t.ticker}
                    onClick={() => onSelectTicker(t.ticker)}
                    className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg p-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Mono char={(t.ticker || '?')[0]} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{t.ticker}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {t.name || t.market || ''}
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {t.market}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div className="num text-xs text-slate-500">點擊查看分析</div>
                      <Spark
                        data={sd}
                        color={dir >= 0 ? '#f87171' : '#34d399'}
                        width={60}
                        height={20}
                        fill
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </BCard>

        {/* AI today digest */}
        <BCard className="col-span-12 lg:col-span-4 p-5 relative overflow-hidden">
          <div
            className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(closest-side,#22d3ee,transparent)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
                AI 每日摘要
              </span>
              <span className="text-[10px] text-slate-500 font-mono">claude-sonnet-4.6</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              選擇任一個股可開啟完整 AI 報告，整合<span className="text-rose-300">技術面</span>、
              <span className="text-blue-300">新聞情緒</span>、
              <span className="text-cyan-300">基本面</span>三維度判斷，並提供綜合操作建議。
            </p>
            <div className="mt-4 space-y-2">
              {[
                ['技術面', '指標含 RSI / MACD / MA / BB', 'rose'],
                ['新聞面', '近期新聞與情緒分析', 'blue'],
                ['基本面', 'P/E、EPS、財報摘要', 'cyan'],
              ].map(([k, v, c], i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${c}-400`} />
                  <span className="text-slate-500 w-16">{k}</span>
                  <span className="text-slate-200 flex-1">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </BCard>

        {/* Recent watchlist analyses */}
        <BCard className="col-span-12 lg:col-span-7 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-white">快速進入個股分析</div>
            <span
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              onClick={() => setView('screener')}
            >
              前往技術篩選 →
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {items.slice(0, 5).map((t) => (
              <div
                key={t.id ?? t.ticker}
                onClick={() => onSelectTicker(t.ticker)}
                className="flex items-center gap-3 py-2.5 hover:bg-white/[0.02] -mx-2 px-2 rounded cursor-pointer"
              >
                <Mono char={(t.ticker || '?')[0]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{t.ticker}</span>
                    <span className="text-[10px] text-slate-500 truncate">{t.name || ''}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    點擊開啟 AI 分析報告
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {t.market || ''}
                </span>
                <span className="text-slate-500">→</span>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">尚無自選股</div>
            )}
          </div>
        </BCard>

        {/* Portfolio quick KPI */}
        <BCard className="col-span-12 lg:col-span-5 p-5">
          <div className="text-sm font-medium text-white mb-3">投資組合速覽</div>
          {summary ? (
            <PortfolioMini summary={summary} setView={setView} />
          ) : (
            <div className="text-sm text-slate-500 py-8 text-center">無持倉資料</div>
          )}
        </BCard>
      </div>
    </main>
  )
}

function PortfolioMini({ summary, setView }) {
  const {
    total_market_value = 0,
    unrealized_pnl = 0,
    unrealized_pct = 0,
    realized_pnl = 0,
    position_count = 0,
  } = summary

  return (
    <>
      <div className="num text-3xl font-semibold text-white">{fmtMoney(total_market_value)}</div>
      <div className="flex items-center gap-3 mt-1">
        <span className={`num text-sm font-medium ${pnlColor(unrealized_pnl)}`}>
          {fmtMoney(unrealized_pnl, { signed: true })} ({fmtPct(unrealized_pct)})
        </span>
        <span className="text-xs text-slate-500">未實現</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">持倉</div>
          <div className="num text-base text-white">{position_count} 檔</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">已實現</div>
          <div className={`num text-base ${pnlColor(realized_pnl)}`}>
            {fmtMoney(realized_pnl, { signed: true })}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">總損益</div>
          <div className={`num text-base ${pnlColor(unrealized_pnl + realized_pnl)}`}>
            {fmtMoney(unrealized_pnl + realized_pnl, { signed: true })}
          </div>
        </div>
      </div>
      <SecondaryButton
        onClick={() => setView('portfolio')}
        className="w-full mt-4 py-2 text-xs"
      >
        查看完整組合 →
      </SecondaryButton>
    </>
  )
}
