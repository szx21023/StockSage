from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db import crud
from app.agent import orchestrator

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    ticker: str | None = None


@router.post("/")
async def chat(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    history = await crud.get_conversation_history(db, ticker=body.ticker)
    history_msgs = [{"role": h.role, "content": h.content} for h in history]

    reply = await orchestrator.chat(body.message, ticker=body.ticker, history=history_msgs)

    await crud.save_message(db, role="user", content=body.message, ticker=body.ticker)
    await crud.save_message(db, role="assistant", content=reply, ticker=body.ticker)

    return {"reply": reply}


@router.get("/history")
async def get_history(ticker: str | None = None, limit: int = 20, db: AsyncSession = Depends(get_db)):
    history = await crud.get_conversation_history(db, ticker=ticker, limit=limit)
    return {"messages": [
        {"role": h.role, "content": h.content, "created_at": h.created_at}
        for h in history
    ]}
