from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.tools.tavily_search import TavilySearchResults
from app.rag.source_validator import SourceValidator
from app.core.config import settings
from urllib.parse import urlparse

import os

class TavilySearchService:
    """
    Wraps the Tavily Search API to execute live web searches.
    Applies the SourceValidator to ensure only trusted domains are returned.
    """
    def __init__(self):
        self.validator = SourceValidator()
        self.search_tool = None
        
        # Only initialize LangChain's wrapper if the API key is available
        if settings.TAVILY_API_KEY:
            os.environ["TAVILY_API_KEY"] = settings.TAVILY_API_KEY
            self.search_tool = TavilySearchResults(
                max_results=10, 
                include_raw_content=True,
                include_domains=self.validator.allowed_domains + self.validator.allowed_suffixes
            )
        
    async def perform_search(self, query: str) -> List[Document]:
        """
        Executes a live search and returns formatted LangChain Documents.
        Only trusted sources are included.
        """
        if not settings.TAVILY_API_KEY or not self.search_tool:
            print("Warning: TAVILY_API_KEY is not set. Skipping live search.")
            return []

        try:
            print(f"Executing Tavily fallback search for: '{query}'")
            # ainvoke runs the search asynchronously
            raw_results = await self.search_tool.ainvoke({"query": query})
            
            # The tool returns a list of dicts: [{'url': ..., 'content': ...}]
            if not isinstance(raw_results, list):
                return []
                
            valid_results = self.validator.filter_valid_results(raw_results)
            
            documents = []
            for res in valid_results:
                url = res.get("url", "")
                
                # Ensure clean, generic titles for government links
                title = res.get("title", "")
                title_lower = title.lower()
                
                if not title or ".aspx" in title_lower or "pressrelease" in title_lower or "iframe" in title_lower:
                    title = "Govt Scheme"
                        
                # Additional fallback to ensure no aspx leaks
                if ".aspx" in title.lower():
                    title = "Govt Scheme"
                        
                doc = Document(
                    page_content=res.get("content", ""),
                    metadata={
                        "source": url,
                        "title": title,
                        "source_type": "Live Web"
                    }
                )
                documents.append(doc)
                
            return documents
            
        except Exception as e:
            print(f"Tavily Search Error: {str(e)}")
            return []
