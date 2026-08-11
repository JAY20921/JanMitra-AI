import logging
import re
import os
from typing import List, Optional
from urllib.parse import urlparse

from langchain_core.documents import Document
from langchain_tavily import TavilySearch
from app.rag.source_validator import SourceValidator
from app.core.config import settings

logger = logging.getLogger(__name__)


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
            self.search_tool = TavilySearch(
                max_results=10,
                include_raw_content=True,
                # Only pass exact domain strings; Tavily does NOT support
                # wildcard suffixes like ".gov.in".  The post-retrieval
                # SourceValidator still catches any remaining non-gov URLs.
                include_domains=self.validator.allowed_domains,
            )

    async def perform_search(self, query: str) -> List[Document]:
        """
        Executes a live search and returns formatted LangChain Documents.
        Only trusted sources are included.
        """
        if not settings.TAVILY_API_KEY or not self.search_tool:
            logger.warning("TAVILY_API_KEY is not set. Skipping live search.")
            return []

        try:
            logger.info("Executing Tavily fallback search for: '%s'", query)
            # ainvoke runs the search asynchronously
            raw_results = await self.search_tool.ainvoke({"query": query})

            # The tool might return a dict with a 'results' key or a list directly.
            if isinstance(raw_results, dict) and "results" in raw_results:
                raw_results = raw_results["results"]

            if not isinstance(raw_results, list):
                return []

            valid_results = self.validator.filter_valid_results(raw_results)

            documents = []
            for res in valid_results:
                url = res.get("url", "")

                # --- Improved title extraction ---
                title = self._extract_title(res.get("title", ""), url)

                doc = Document(
                    page_content=res.get("content", ""),
                    metadata={"source": url, "title": title, "source_type": "Live Web"},
                )
                documents.append(doc)

            return documents

        except Exception as e:
            logger.error("Tavily Search Error: %s", e, exc_info=True)
            return []

    @staticmethod
    def _extract_title(raw_title: str, url: str) -> str:
        """
        Derive the best possible title from the raw title or URL slug.
        Falls back to a URL-derived title instead of the generic 'Govt Scheme'.
        """
        if raw_title:
            cleaned = raw_title.strip()
            title_lower = cleaned.lower()
            # Reject common junk titles
            if any(
                junk in title_lower
                for junk in (
                    ".aspx",
                    "pressrelease",
                    "iframe",
                    "404",
                    "error",
                    "access denied",
                    "something went wrong",
                )
            ):
                cleaned = ""
            else:
                # Remove trailing file extensions and URL fragments
                cleaned = re.sub(
                    r"\.(aspx|html|php|pdf|jsp).*", "", cleaned, flags=re.I
                )
                cleaned = re.sub(r"https?://\S+", "", cleaned)
                cleaned = cleaned.strip(" -|/")

            if len(cleaned) > 5:
                return cleaned[:80]

        # Fallback: derive a human-readable title from the URL path
        if url:
            try:
                parsed = urlparse(url)
                path_parts = [p for p in parsed.path.strip("/").split("/") if p]
                if path_parts:
                    slug = path_parts[-1]
                    slug = re.sub(r"\.(aspx|html|php|pdf|jsp)$", "", slug, flags=re.I)
                    # Skip pure IDs / hashes
                    if not (re.match(r"^[0-9a-f\-]+$", slug, re.I) and len(slug) > 10):
                        title = slug.replace("-", " ").replace("_", " ")
                        title = re.sub(r"\s+", " ", title).strip()
                        if len(title) > 4 and title.lower() not in (
                            "index",
                            "home",
                            "default",
                            "en",
                            "scheme",
                            "schemes",
                            "pressreleasepage",
                            "pressrelease",
                        ):
                            return title.title()[:80]
            except Exception:
                pass

        return "Government Scheme"
