import unittest
import asyncio
from unittest.mock import MagicMock, patch
import time
import os

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.rag.temp_store import TempSessionStore
from app.rag.retriever import Retriever
from app.llm.prompts import PromptBuilder
from langchain_core.documents import Document

class TestTempSessionStore(unittest.TestCase):
    def setUp(self):
        self.temp_store = TempSessionStore()

    def tearDown(self):
        # Cleanup after test
        for sid in list(self.temp_store._session_metadata.keys()):
            self.temp_store.clear_session(sid)

    def test_temp_store_lifecycle(self):
        """Test creating, accessing, and clearing a temporary session."""
        session_id = "test-session-123"
        
        # Collection shouldn't exist initially
        self.assertFalse(self.temp_store.collection_exists(session_id))
        
        # Ensure collection creates it
        collection_name = self.temp_store._ensure_collection(session_id)
        self.assertTrue(collection_name.startswith("session_test_session_123"))
        self.assertTrue(self.temp_store.collection_exists(session_id))
        
        # Clear collection
        self.temp_store.clear_session(session_id)
        self.assertFalse(self.temp_store.collection_exists(session_id))

    def test_temp_store_capacity(self):
        """Test capacity limits are enforced."""
        self.temp_store.MAX_COLLECTIONS = 2
        
        self.temp_store._ensure_collection("session-1")
        self.temp_store._ensure_collection("session-2")
        
        with self.assertRaisesRegex(RuntimeError, "capacity"):
            self.temp_store._ensure_collection("session-3")

    def test_temp_store_ttl_expiration(self):
        """Test that expired sessions are automatically purged."""
        self.temp_store.SESSION_TTL = 0.1 # 100ms TTL
        
        self.temp_store._ensure_collection("session-ttl")
        self.assertTrue(self.temp_store.collection_exists("session-ttl"))
        
        # Wait for TTL to expire
        time.sleep(0.2)
        
        # Ensure collection cleans up expired sessions automatically
        try:
            self.temp_store._ensure_collection("session-new")
        except Exception:
            pass
            
        self.assertNotIn("session-ttl", self.temp_store._session_metadata)


class TestRetriever(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.patcher_temp = patch("app.rag.retriever.TempSessionStore")
        self.patcher_qdrant = patch("app.rag.retriever.get_qdrant_store")
        self.patcher_tavily = patch("app.rag.retriever.TavilySearchService")
        
        self.mock_temp = self.patcher_temp.start()
        self.mock_qdrant = self.patcher_qdrant.start()
        self.mock_tavily = self.patcher_tavily.start()

    async def asyncTearDown(self):
        self.patcher_temp.stop()
        self.patcher_qdrant.stop()
        self.patcher_tavily.stop()

    async def test_retrieve_temp_docs_success(self):
        """Test Tier 1: User uploaded documents."""
        # Mock temp store having documents
        class DummyTempRetriever:
            async def ainvoke(self, query, **kwargs):
                return [Document(page_content="Temp doc content", metadata={"source": "upload.pdf"})]
                
        class DummyVectorStore:
            def as_retriever(self, **kwargs):
                return DummyTempRetriever()
                
        mock_store_instance = MagicMock()
        mock_store_instance.collection_exists.return_value = True
        mock_store_instance.get_vector_store.return_value = DummyVectorStore()
        self.mock_temp.return_value = mock_store_instance
        
        # Instantiate Retriever AFTER setting up mock return values
        retriever = Retriever()
        
        docs = await retriever._retrieve_temp_docs("query", "test-session")
        
        self.assertEqual(len(docs), 1)
        self.assertEqual(docs[0].page_content, "Temp doc content")
        self.assertEqual(docs[0].metadata["source"], "upload.pdf")
        self.assertEqual(docs[0].metadata["source_type"], "User Uploaded Document")

    async def test_retrieve_tavily_fallback(self):
        """Test Tier 3: Tavily Live Search Fallback."""
        class DummyTavily:
            async def perform_search(self, query, **kwargs):
                return [Document(page_content="Live web content", metadata={"source": "https://example.gov.in"})]
                
        self.mock_tavily.return_value = DummyTavily()
        
        # Run full retrieval with empty Tier 1 and Tier 2
        self.mock_temp.return_value.collection_exists.return_value = False
        
        class DummyQdrantRetriever:
            async def ainvoke(self, query, **kwargs):
                return []
                
        class DummyQdrantVector:
            def as_retriever(self, **kwargs):
                return DummyQdrantRetriever()
                
        qdrant_instance = MagicMock()
        qdrant_instance.get_vector_store.return_value = DummyQdrantVector()
        self.mock_qdrant.return_value = qdrant_instance
        
        # Instantiate Retriever AFTER setting up mock return values
        retriever = Retriever()
        
        docs = await retriever.retrieve_documents("query", None, "test-session")
        
        self.assertEqual(len(docs), 1)
        self.assertEqual(docs[0].page_content, "Live web content")
        self.assertEqual(docs[0].metadata["source_type"], "Live Web Search")
        self.assertEqual(docs[0].metadata["source_id"], "doc_1")


class TestPromptBuilder(unittest.TestCase):
    def test_prompt_builder(self):
        """Test that the system prompt compiles correctly with injection defense."""
        prompt_template = PromptBuilder.SYSTEM_TEMPLATE
        
        # Should contain time variable
        self.assertIn("{current_date}", prompt_template)
        
        # Should contain injection defense
        self.assertIn("<content>", prompt_template)
        
        # Should contain citation instructions
        self.assertIn("[doc_", prompt_template)

if __name__ == "__main__":
    unittest.main()
