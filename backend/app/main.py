import os
import logging
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Suppress Langchain deprecation warnings to keep startup logs clean
try:
    from langchain_core._api.deprecation import LangChainDeprecationWarning
    warnings.filterwarnings("ignore", category=LangChainDeprecationWarning)
except ImportError:
    pass

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle handler."""
    # Ensure the data directory exists for SQLite chat history
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # Eagerly initialize the Generator singleton at startup.
    # This loads the embedding model (~200MB), connects to Qdrant, and
    # builds the LCEL chain BEFORE any user request arrives.
    # Without this, the first chat request triggers all of this at once,
    # which takes >120s on Render free tier and causes a Gunicorn
    # WORKER TIMEOUT crash.
    try:
        logger.info("Pre-loading Generator singleton at startup...")
        from app.llm.generator import get_generator
        get_generator()
        logger.info("Generator singleton ready.")
    except Exception as e:
        logger.warning("Generator pre-load failed (will retry on first request): %s", e)
    
    yield

def create_app() -> FastAPI:
    """
    Application factory to create and configure the FastAPI application.
    This modular design allows for easier testing and configuration updates.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="Backend API for AI Citizen Assistant RAG Application",
        lifespan=lifespan,
    )

    # Configure CORS - Set for development, restrict in production
    cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")] if settings.CORS_ORIGINS != "*" else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    @app.get("/health", tags=["Health"])
    async def health_check():
        """
        Simple health check endpoint to verify the API is running.
        """
        return {
            "status": "ok",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION
        }

    # Include API routers here as we build them out
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    # This is primarily for local debugging
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=settings.ENVIRONMENT == "development"
    )
