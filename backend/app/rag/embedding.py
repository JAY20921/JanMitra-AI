from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import settings

from functools import lru_cache

@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Returns a Langchain HuggingFaceEmbeddings instance.
    Runs locally to eliminate API latency and dependency errors.
    """
    model_name = settings.EMBEDDING_MODEL_NAME or "BAAI/bge-small-en-v1.5"
    print(f"Loading local embedding model: {model_name}...")
    return HuggingFaceEmbeddings(
        model_name=model_name
    )
