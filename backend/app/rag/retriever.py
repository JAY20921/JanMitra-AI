import logging
from typing import Optional, List, Tuple
from langchain_core.documents import Document

from app.rag.vector_store import get_qdrant_store
from app.rag.metadata_filter import MetadataFilter
from app.models.user import UserProfile
from app.services.tavily_client import TavilySearchService
from app.rag.temp_store import TempSessionStore

logger = logging.getLogger(__name__)

class Retriever:
    """
    Takes a user's query, embeds it, and performs a similarity search across three tiers:
    1. User-uploaded document (TempSessionStore)
    2. Local Knowledge Base (Qdrant)
    3. Live Web (Tavily Fallback)
    """
    def __init__(self):
        self.metadata_filter = MetadataFilter()
        self.tavily_service = TavilySearchService()
        self.temp_store_manager = TempSessionStore()
        
    async def _retrieve_temp_docs(self, query: str, session_id: str) -> List[Document]:
        if not self.temp_store_manager.collection_exists(session_id):
            return []
            
        logger.info("Querying temporary user documents for session %s...", session_id)
        temp_retriever = self.temp_store_manager.get_vector_store(session_id).as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )
        
        try:
            results = await temp_retriever.ainvoke(query)
            for doc in results:
                doc.metadata["source_type"] = "User Uploaded Document"
            return results
        except Exception as e:
            logger.error("Failed to retrieve from TempSessionStore: %s", e, exc_info=True)
            return []

    async def _retrieve_qdrant_docs(self, query: str, user_profile: Optional[UserProfile], top_k: int) -> Tuple[List[Document], bool]:
        search_kwargs = {"k": top_k}
        if user_profile:
            qdrant_filter = self.metadata_filter.build_qdrant_filter(user_profile)
            if qdrant_filter:
                search_kwargs["filter"] = qdrant_filter
                logger.info("Applying Qdrant filters: %s", qdrant_filter)
            
        try:
            store = get_qdrant_store()
            base_retriever = store.get_vector_store().as_retriever(
                search_type="similarity",
                search_kwargs=search_kwargs
            )
            results = await base_retriever.ainvoke(query)
            for doc in results:
                doc.metadata["source_type"] = "Local Knowledge Base"
            return results, False
        except Exception as e:
            logger.error(
                "Qdrant retrieval FAILED — this may indicate the database is offline or misconfigured. "
                "Error: %s", e, exc_info=True
            )
            return [], True

    async def _retrieve_tavily_docs(self, query: str) -> List[Document]:
        logger.info("Insufficient global documents found locally. Falling back to Tavily Live Search...")
        try:
            results = await self.tavily_service.perform_search(query)
            for doc in results:
                doc.metadata["source_type"] = "Live Web Search"
            return results
        except Exception as e:
            logger.error("Tavily search failed: %s", e, exc_info=True)
            return []

    async def retrieve_documents(self, query: str, user_profile: Optional[UserProfile] = None, session_id: Optional[str] = None, top_k: int = 5) -> List[Document]:
        """
        Uses Langchain Retrievers to get relevant documents from available tiers.
        """
        logger.info("Retrieving context for query: '%s'", query)
        all_results = []
        
        # --- Tier 1: User Uploaded Document (Highest Priority) ---
        if session_id:
            temp_results = await self._retrieve_temp_docs(query, session_id)
            all_results.extend(temp_results)

        # --- Tier 2: Qdrant Official Local Knowledge Base ---
        qdrant_results, qdrant_failed = await self._retrieve_qdrant_docs(query, user_profile, top_k)
        all_results.extend(qdrant_results)
            
        # --- Tier 3: Intelligent Fallback (Tavily Search) ---
        if not qdrant_failed and len(qdrant_results) < 2:
            tavily_results = await self._retrieve_tavily_docs(query)
            all_results.extend(tavily_results)
                
        # Return merged list. Prioritization implicitly handled by the order they were appended 
        # (Tier 1 -> Tier 2 -> Tier 3), so LLM reads highest priority first.
        return all_results

    async def retrieve_context(self, query: str, user_profile: Optional[UserProfile] = None, session_id: Optional[str] = None, top_k: int = 5) -> str:
        """
        Retrieves documents and returns a formatted string of the context.
        """
        results = await self.retrieve_documents(query, user_profile, session_id, top_k)
        
        if not results:
            logger.info("No relevant context found.")
            return ""
            
        # Format context for the LLM with transparent source tagging
        context_parts = []
        for idx, doc in enumerate(results, 1):
            source = doc.metadata.get('source', doc.metadata.get('title', 'Unknown Source'))
            source_type = doc.metadata.get('source_type', 'Unknown Context')
            text = doc.page_content
            source_id = f"doc_{idx}"
            
            # Use strict XML-style tags to force the LLM to acknowledge the source
            context_parts.append(
                f"<document source_id=\"{source_id}\">\n"
                f"<source_type>{source_type}</source_type>\n"
                f"<source_url>{source}</source_url>\n"
                f"<content>\n{text}\n</content>\n"
                f"</document>"
            )
            
        return "\n\n".join(context_parts)
