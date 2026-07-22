from typing import Optional, List
from langchain_core.documents import Document
from app.rag.vector_store import QdrantStore
from app.rag.metadata_filter import MetadataFilter
from app.models.user import UserProfile
from app.llm.providers import LLMFactory
from app.services.tavily_client import TavilySearchService

from app.rag.temp_store import TempSessionStore

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
        print(f"Retrieving context for query: '{query}'")
        
        all_results = []
        
        # --- Tier 1: User Uploaded Document (Highest Priority) ---
        if session_id and self.temp_store_manager.collection_exists(session_id):
            print(f"Querying temporary user documents for session {session_id}...")
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
                print(f"Applying filters: {qdrant_filter}")
            
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
            print(f"Warning: Failed to retrieve from Qdrant Local Knowledge Base: {e}")
            qdrant_results = []
            
        # --- Tier 3: Intelligent Fallback (Tavily Search) ---
        # If Qdrant (global knowledge) didn't return enough documents, trigger live search
        # We do not count Tier 1 (user doc) here because a user doc shouldn't block web search for general questions.
        if len(qdrant_results) < 2:
            print("Insufficient global documents found locally. Falling back to Tavily Live Search...")
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
            print("No relevant context found.")
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
