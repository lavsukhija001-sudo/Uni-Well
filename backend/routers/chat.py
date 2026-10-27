from fastapi import APIRouter, Depends
from services.ai_service import chat_response
import schemas

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])


@router.post("", response_model=schemas.ChatResponse)
async def handle_chat(data: schemas.ChatMessage):
    result = await chat_response(data.message)
    return result
