import logging
from typing import Optional
from qdrant_client import QdrantClient as QClient
from langchain_qdrant import QdrantVectorStore
from qdrant_client.models import VectorParams, Distance, PayloadSchemaType

from app.core.config import settings
from app.rag.embedding import get_embedding_model, get_embedding_dimension

logger = logging.getLogger(__name__)

class QdrantStore:
    """
    Wrapper around Qdrant to manage collections and return a Langchain VectorStore.
    """
    def __init__(self):
        self.vector_store: Optional[QdrantVectorStore] = None
        self.client: Optional[QClient] = None
        self.collection_name = "schemes_collection_jina"
        self._initialize()
        
    def _initialize(self):
        try:
            if not settings.QDRANT_URL:
                raise ValueError("QDRANT_URL environment variable is missing!")
            
            self.client = QClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            
            # Dynamically detect the vector size from the loaded embedding model
            self.vector_size = get_embedding_dimension()
            self._ensure_collection()
            self.embeddings = get_embedding_model()
            
            try:
                self.vector_store = QdrantVectorStore(
                    client=self.client,
                    collection_name=self.collection_name,
                    embedding=self.embeddings
                )
            except Exception as ve:
                if "force_recreate" in str(ve):
                    logger.warning("Dimension mismatch detected. Recreating Qdrant collection...")
                    self.vector_store = QdrantVectorStore(
                        client=self.client,
                        collection_name=self.collection_name,
                        embedding=self.embeddings,
                        force_recreate=True
                    )
                else:
                    raise ve
                    
        except Exception as e:
            logger.error("Failed to initialize QdrantStore: %s", e)
        
    def _ensure_collection(self):
        """Creates the collection if it doesn't exist."""
        try:
            self.client.get_collection(collection_name=self.collection_name)
            exists = True
        except Exception:
            exists = False
        
        if not exists:
            logger.info("Creating Qdrant collection: %s", self.collection_name)
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE)
            )

        # Create payload indexes to allow filtering without 400 Bad Request errors
        for field in ["metadata.category", "metadata.state", "metadata.gender"]:
            try:
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name=field,
                    field_schema=PayloadSchemaType.KEYWORD
                )
            except Exception:
                # Typically throws if it already exists or if using a free tier that limits indexes
                pass

    def get_vector_store(self) -> QdrantVectorStore:
        if self.vector_store is None:
            logger.info("Attempting to re-initialize QdrantStore...")
            self._initialize()
        if self.vector_store is None:
            raise RuntimeError("QdrantStore was not successfully initialized (database may be offline).")
        return self.vector_store

# Module-level singleton pattern
_qdrant_store_instance: Optional[QdrantStore] = None

def get_qdrant_store() -> QdrantStore:
    """
    Returns a lazily-initialized, reusable QdrantStore singleton.
    """
    global _qdrant_store_instance
    if _qdrant_store_instance is None:
        logger.info("Initializing QdrantStore singleton...")
        _qdrant_store_instance = QdrantStore()
    return _qdrant_store_instance
