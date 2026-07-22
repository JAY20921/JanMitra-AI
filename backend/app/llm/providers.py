from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_models import ChatOllama
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from app.core.config import settings

class LLMFactory:
    """
    Factory to instantiate LangChain Chat Models based on the specified provider.
    """
    @staticmethod
    def get_provider(provider_name: str = "groq", model_name: str = None) -> BaseChatModel:
        provider_name = provider_name.lower()
        
        if provider_name == "groq":
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is not set in environment")
            return ChatGroq(
                model=model_name or "llama-3.3-70b-versatile",
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
                streaming=True
            )
            
        elif provider_name == "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is not set in environment")
            return ChatGoogleGenerativeAI(
                model=model_name or "gemini-2.5-flash",
                temperature=0.0,
                google_api_key=settings.GEMINI_API_KEY
            )
            
        elif provider_name == "ollama":
            return ChatOllama(
                model=model_name or "llama3",
                temperature=0.0,
                base_url=settings.OLLAMA_BASE_URL
            )
            
        else:
            raise ValueError(f"Unknown LLM provider: {provider_name}")
