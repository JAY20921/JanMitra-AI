from fastapi import APIRouter
from app.api.v1.endpoints import chat, ingest, schemes, health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
