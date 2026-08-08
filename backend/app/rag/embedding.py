from langchain_community.embeddings import JinaEmbeddings
from app.core.config import settings

from functools import lru_cache

@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Returns a Langchain JinaEmbeddings instance backed by the Jina AI cloud API.

    Uses jina-embeddings-v3: a multilingual (94 languages), open-source model
    served via the Jina API.  This eliminates the need to download / load a
    large model locally, drastically reducing RAM usage on hosting platforms
    like Render while providing superior retrieval quality.

    Key specs:
        - 1024-dimensional vectors (vs 384 from the old MiniLM model)
        - 8 192-token context window
        - Task-specific LoRA adapters (retrieval, classification, etc.)
        - Matryoshka embeddings (dimensions can be truncated if needed)
    """
    model_name = settings.EMBEDDING_MODEL_NAME or "jina-embeddings-v3"
    print(f"Initialising Jina cloud embedding model: {model_name}...")
    return JinaEmbeddings(
        jina_api_key=settings.JINA_API_KEY,
        model_name=model_name,
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

