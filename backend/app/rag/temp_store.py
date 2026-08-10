import logging
import time
from typing import Dict, Optional
from threading import Lock

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from langchain_qdrant import QdrantVectorStore
from app.rag.embedding import get_embedding_model, get_embedding_dimension

logger = logging.getLogger(__name__)

class TempSessionStore:
    """
    Wrapper for an in-memory Qdrant instance.
    Stores user-uploaded documents temporarily, separated by session_id (collection name).
    Includes memory lifecycle management to prevent memory exhaustion.
    """
    # Max collections before we start refusing new ones
    MAX_COLLECTIONS = 100
    # TTL for a session in seconds (e.g., 2 hours)
    SESSION_TTL = 2 * 3600 

    def __init__(self):
        # ':memory:' keeps data transient and isolated from the main Qdrant DB
        self.client = QdrantClient(location=":memory:")
        self.embeddings = get_embedding_model()
        self.vector_size = get_embedding_dimension()
        
        # Track session lifecycles: session_id -> last_accessed_timestamp
        self._session_metadata: Dict[str, float] = {}
        self._lock = Lock()

    def _sanitize_session_id(self, session_id: str) -> str:
        # Prevent injection or overly long names
        sanitized = "".join(c for c in session_id if c.isalnum() or c in ("-", "_"))
        return f"session_{sanitized[:64]}".replace("-", "_")

    def _cleanup_expired_sessions(self):
        """Removes sessions that haven't been accessed within the TTL."""
        now = time.time()
        expired_sessions = []
        for sid, last_accessed in self._session_metadata.items():
            if now - last_accessed > self.SESSION_TTL:
                expired_sessions.append(sid)
                
        for sid in expired_sessions:
            self.clear_session(sid)

    def _ensure_collection(self, session_id: str):
        """Creates a collection for the specific session if it doesn't exist."""
        with self._lock:
            self._cleanup_expired_sessions()
            
            collection_name = self._sanitize_session_id(session_id)
            
            try:
                self.client.get_collection(collection_name=collection_name)
                exists = True
            except Exception:
                exists = False
            
            if not exists:
                if len(self._session_metadata) >= self.MAX_COLLECTIONS:
                    raise RuntimeError("Temporary storage is currently at capacity. Please try again later.")
                    
                logger.info("Creating temporary in-memory collection: %s", collection_name)
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE)
                )
            
            self._session_metadata[session_id] = time.time()
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
        with self._lock:
            if session_id not in self._session_metadata:
                return False
                
            collection_name = self._sanitize_session_id(session_id)
            try:
                self.client.get_collection(collection_name=collection_name)
                self._session_metadata[session_id] = time.time()
                return True
            except Exception:
                return False

    def clear_session(self, session_id: str):
        """Deletes the temporary collection for a session."""
        with self._lock:
            collection_name = self._sanitize_session_id(session_id)
            try:
                self.client.delete_collection(collection_name=collection_name)
                logger.info("Cleared temporary collection: %s", collection_name)
            except Exception:
                pass
            
            self._session_metadata.pop(session_id, None)

# Module-level singleton
_temp_store_instance: Optional[TempSessionStore] = None

def get_temp_store() -> TempSessionStore:
    global _temp_store_instance
    if _temp_store_instance is None:
        _temp_store_instance = TempSessionStore()
    return _temp_store_instance
