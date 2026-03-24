from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.db.database import AsyncSessionLocal
from app.db import crud
from app.agent import orchestrator

scheduler = AsyncIOScheduler()


async def _daily_analysis():
    """每日盤後自動分析所有自選股。"""
    async with AsyncSessionLocal() as db:
        watchlist = await crud.get_watchlist(db)
        for item in watchlist:
            try:
                result = await orchestrator.analyze(item.ticker, item.name or "")
                await crud.save_analysis(
                    db,
                    ticker=item.ticker,
                    technical_summary=result["technical_summary"],
                    news_summary=result["news_summary"],
                    fundamental_summary=result["fundamental_summary"],
                    overall_summary=result["overall_summary"],
                    sentiment=result["sentiment"],
                    raw_data=result,
                )
                print(f"[Scheduler] {item.ticker} 分析完成：{result['sentiment']}")
            except Exception as e:
                print(f"[Scheduler] {item.ticker} 分析失敗：{e}")


def start():
    # 美股：週一至週五 22:00 台灣時間（盤後）
    scheduler.add_job(
        _daily_analysis,
        CronTrigger(day_of_week="mon-fri", hour=22, minute=0, timezone="Asia/Taipei"),
        id="daily_analysis",
        replace_existing=True,
    )
    scheduler.start()


def stop():
    scheduler.shutdown()
