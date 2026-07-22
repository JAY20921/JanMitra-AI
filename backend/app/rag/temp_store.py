from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from langchain_qdrant import QdrantVectorStore
from app.rag.embedding import get_embedding_model

class TempSessionStore:
    """
    Singleton wrapper for an in-memory Qdrant instance.
    Stores user-uploaded documents temporarily, separated by session_id (collection name).
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TempSessionStore, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
        
    def _initialize(self):
        # ':memory:' keeps data transient and isolated from the main Qdrant DB
        self.client = QdrantClient(location=":memory:")
        self.vector_size = 384  # Matches HuggingFace Embeddings
        self.embeddings = get_embedding_model()

    def _ensure_collection(self, session_id: str):
        """Creates a collection for the specific session if it doesn't exist."""
        # Sanitize session_id to be a valid Qdrant collection name
        collection_name = f"session_{session_id}".replace("-", "_")
        
        try:
            self.client.get_collection(collection_name=collection_name)
            exists = True
        except Exception:
            exists = False
        
        if not exists:
            print(f"Creating temporary in-memory collection: {collection_name}")
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE)
            )
        return collection_name

    def get_vector_store(self, session_id: str) -> QdrantVectorStore:
        """
        Returns a LangChain VectorStore tied to the user's specific session.
        """
        collection_name = self._ensure_collection(session_id)
        
        return QdrantVectorStore(
            client=self.client,
            collection_name=collection_name,
            embedding=self.embeddings
        )

    def collection_exists(self, session_id: str) -> bool:
        """Helper to check if a user actually uploaded documents for this session."""
        collection_name = f"session_{session_id}".replace("-", "_")
        try:
            self.client.get_collection(collection_name=collection_name)
            return True
        except Exception:
            return False

    def clear_session(self, session_id: str):
        """Deletes the temporary collection for a session."""
        collection_name = f"session_{session_id}".replace("-", "_")
        try:
            self.client.delete_collection(collection_name=collection_name)
            print(f"Cleared temporary collection: {collection_name}")
        except Exception:
            pass
