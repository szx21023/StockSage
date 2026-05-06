import { BTopBar } from '../components/ui'
import ChatPanel from '../components/ChatPanel'

export default function ChatPage({ selectedTicker }) {
  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <BTopBar
        title="AI 對話"
        subtitle="claude-sonnet-4.6 ・ 自動使用技術面、新聞、基本面工具"
        right={
          selectedTicker && (
            <span className="text-[10px] text-slate-500 font-mono">當前焦點：{selectedTicker}</span>
          )
        }
      />
      <div className="flex-1 overflow-hidden">
        <ChatPanel ticker={selectedTicker} />
      </div>
    </main>
  )
}
