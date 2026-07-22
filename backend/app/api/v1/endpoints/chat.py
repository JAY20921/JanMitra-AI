from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.user import UserProfile
from app.llm.generator import Generator
from fastapi.responses import StreamingResponse
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    user_profile: Optional[UserProfile] = None
    session_id: Optional[str] = None
    stream: bool = False
    language: str = "English"

class ChatResponse(BaseModel):
    response: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    generator = Generator(provider_name="groq") 
    if request.stream:
        async def response_generator():
            try:
                async for chunk in generator.stream_response(request.query, request.user_profile, request.language, request.session_id):
                    yield chunk
            except Exception as e:
                error_msg = str(e).lower()
                if "429" in error_msg or "rate limit" in error_msg or "quota" in error_msg or "resourceexhausted" in error_msg:
                    yield "\n\n*Note: I apologize, but the backend AI provider has exceeded its daily free-tier quota (API Rate Limit). Please switch API keys or try again tomorrow!*"
                else:
                    yield f"\n\n*Error: An unexpected issue occurred: {str(e)}*"
                    
        return StreamingResponse(response_generator(), media_type="text/event-stream")
    else:
        try:
            response_text = await generator.generate_response(request.query, request.user_profile, request.language, request.session_id)
            return ChatResponse(response=response_text)
        except Exception as e:
            error_msg = str(e).lower()
            if "429" in error_msg or "rate limit" in error_msg or "quota" in error_msg or "resourceexhausted" in error_msg:
                return ChatResponse(response="*Note: I apologize, but the backend AI provider has exceeded its daily free-tier quota (API Rate Limit). Please switch API keys or try again tomorrow!*")
            return ChatResponse(response=f"*Error: An unexpected issue occurred: {str(e)}*")

from app.llm.generator import get_session_history

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    history = get_session_history(session_id)
    messages = []
    
    try:
        raw_msgs = await history.aget_messages()
    except Exception:
        raw_msgs = []
        
    for msg in raw_msgs:
        messages.append({
            "role": "user" if msg.type == "human" else "assistant",
            "content": msg.content
        })
    return {"messages": messages}
