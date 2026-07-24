from qdrant_client import QdrantClient as QClient
from langchain_qdrant import QdrantVectorStore
from qdrant_client.models import VectorParams, Distance
from app.core.config import settings
from app.rag.embedding import get_embedding_model

class QdrantStore:
    """
    Singleton wrapper around Qdrant to manage collections and return Langchain VectorStore.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(QdrantStore, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
        
    def _initialize(self):
        self.vector_store = None
        try:
            if not settings.QDRANT_URL:
                raise ValueError("QDRANT_URL environment variable is missing!")
            self.client = QClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            self.collection_name = "schemes_collection_local"
            self.vector_size = 384
            self._ensure_collection()
            self.embeddings = get_embedding_model()
            self.vector_store = QdrantVectorStore(
                client=self.client,
                collection_name=self.collection_name,
                embedding=self.embeddings
            )
        except Exception as e:
            print(f"Warning: Failed to initialize QdrantStore: {e}")
        
    def _ensure_collection(self):
        """Creates the collection if it doesn't exist."""
        try:
            self.client.get_collection(collection_name=self.collection_name)
            exists = True
        except Exception:
            exists = False
        
        if not exists:
            print(f"Creating Qdrant collection: {self.collection_name}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE)
            )

    def get_vector_store(self) -> QdrantVectorStore:
        if self.vector_store is None:
            raise RuntimeError("QdrantStore was not successfully initialized (database may be offline).")
        return self.vector_store
