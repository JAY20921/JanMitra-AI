from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

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
