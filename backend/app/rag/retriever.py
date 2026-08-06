import logging
from typing import Optional, List
from langchain_core.documents import Document
from app.rag.vector_store import QdrantStore
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
        self.qdrant_store = QdrantStore()
        self.metadata_filter = MetadataFilter()
        self.tavily_service = TavilySearchService()
        self.temp_store_manager = TempSessionStore()
        
    async def retrieve_documents(self, query: str, user_profile: Optional[UserProfile] = None, session_id: Optional[str] = None, top_k: int = 5) -> List[Document]:
        """
        Uses Langchain Retrievers to get relevant documents from available tiers.
        """
        logger.info("Retrieving context for query: '%s'", query)
        
        all_results = []
        _qdrant_failed = False
        
        # --- Tier 1: User Uploaded Document (Highest Priority) ---
        if session_id and self.temp_store_manager.collection_exists(session_id):
            logger.info("Querying temporary user documents for session %s...", session_id)
            temp_retriever = self.temp_store_manager.get_vector_store(session_id).as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )
            # Standard retriever is fast enough for small documents
            temp_results = await temp_retriever.ainvoke(query)
            # Already tagged during ingestion, but ensure safety
            for doc in temp_results:
                if "source_type" not in doc.metadata:
                    doc.metadata["source_type"] = "User Uploaded Document"
            all_results.extend(temp_results)

        # --- Tier 2: Qdrant Official Local Knowledge Base ---
        search_kwargs = {"k": top_k}
        if user_profile:
            qdrant_filter = self.metadata_filter.build_qdrant_filter(user_profile)
            if qdrant_filter:
                search_kwargs["filter"] = qdrant_filter
                logger.info("Applying Qdrant filters: %s", qdrant_filter)
            
        try:
            base_retriever = self.qdrant_store.get_vector_store().as_retriever(
                search_type="similarity",
                search_kwargs=search_kwargs
            )
            
            qdrant_results = await base_retriever.ainvoke(query)
            for doc in qdrant_results:
                doc.metadata["source_type"] = "Local Knowledge Base"
            all_results.extend(qdrant_results)
        except Exception as e:
            # Log at ERROR level so monitoring tools can alert on database outages
            logger.error(
                "Qdrant retrieval FAILED — this may indicate the database is "
                "offline or misconfigured. Tavily fallback will NOT be used to "
                "prevent uncontrolled API credit consumption.  Error: %s",
                e,
                exc_info=True,
            )
            qdrant_results = []
            _qdrant_failed = True
            
        # --- Tier 3: Intelligent Fallback (Tavily Search) ---
        # Only trigger live search when Qdrant returned too few results due to
        # a genuine content gap — NOT because the database itself was down.
        # This prevents silently burning Tavily API credits on infra failures.
        if not _qdrant_failed and len(qdrant_results) < 2:
            logger.info("Insufficient global documents found locally. Falling back to Tavily Live Search...")
            tavily_results = await self.tavily_service.perform_search(query)
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
            
            # Use strict XML-style tags to force the LLM to acknowledge the source
            context_parts.append(
                f"<document index=\"{idx}\">\n"
                f"<source_type>{source_type}</source_type>\n"
                f"<source_url>{source}</source_url>\n"
                f"<content>\n{text}\n</content>\n"
                f"</document>"
            )
            
        final_context = "\n\n".join(context_parts)
        return final_context
