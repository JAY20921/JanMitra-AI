from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings and environment variables.
    Using Pydantic BaseSettings ensures type validation and fast-failure 
    on application startup if required configurations are missing.
    """
    
    # Project info
    PROJECT_NAME: str = "AI Citizen Assistant"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Qdrant Database
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    
    # LLM Providers
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Live Search
    TAVILY_API_KEY: Optional[str] = None
    
    # RAG / Embeddings
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

# Instantiate the settings object to be used across the app
settings = Settings()
