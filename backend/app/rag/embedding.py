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


@lru_cache(maxsize=1)
def get_embedding_dimension() -> int:
    """
    Dynamically determines the vector dimension by embedding a short probe
    string.  This avoids hardcoding a size that may not match the configured
    model (e.g. 384 for bge-small vs 1024 for jina-v3).
    """
    model = get_embedding_model()
    sample_vector = model.embed_query("dimension probe")
    dimension = len(sample_vector)
    print(f"Detected embedding dimension: {dimension}")
    return dimension

