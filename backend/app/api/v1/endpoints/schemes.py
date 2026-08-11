from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import logging
import uuid
import re
import asyncio

from app.rag.vector_store import get_qdrant_store
from app.rag.metadata_filter import MetadataFilter
from app.models.user import UserProfile
from app.services.tavily_client import TavilySearchService
from app.services.scheme_extractor import SchemeExtractor
from app.services.scheme_cache import SchemeCache

logger = logging.getLogger(__name__)
router = APIRouter()

# Lazy-initialized singletons — avoids creating LLM clients at import time
_scheme_extractor: Optional[SchemeExtractor] = None
_scheme_cache: Optional[SchemeCache] = None


def _get_scheme_extractor() -> SchemeExtractor:
    global _scheme_extractor
    if _scheme_extractor is None:
        _scheme_extractor = SchemeExtractor(provider_name="gemini", model_name="gemini-3.5-flash")
    return _scheme_extractor


def _get_scheme_cache() -> SchemeCache:
    global _scheme_cache
    if _scheme_cache is None:
        _scheme_cache = SchemeCache()
    return _scheme_cache


class SchemeResponse(BaseModel):
    id: str
    title: str
    ministry: str
    match_percentage: int
    eligibility_summary: str
    benefits: List[str]
    source_url: Optional[str] = None
    source_type: str = "Local Knowledge Base"
    eligibility_status: str = "supported"


def _pre_process_text(text: str) -> str:
    """
    Lightweight pre-processor to strip obvious mojibake and control characters
    before sending to the LLM, reducing token waste.
    """
    if not text:
        return ""
    # Strip control characters
    text = re.sub(r"[\x00-\x08\x0e-\x1f]", "", text)
    text = re.sub(r"\ufffd", "", text)
    # Strip sequences of ? mixed with non-ASCII that indicate mojibake
    text = re.sub(r"(?:[\u0080-\u00ff]\??){3,}", "", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()


@router.get("/", response_model=List[SchemeResponse])
async def get_schemes(
    state: Optional[str] = Query(None, description="Filter by state"),
    category: Optional[str] = Query(
        None, description="Filter by category (e.g., Agriculture, Health)"
    ),
    age: Optional[int] = Query(None, description="Filter by age"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    income: Optional[float] = Query(None, description="Filter by income"),
    eligible_only: bool = Query(True, description="Show only eligible schemes"),
):
    """
    Dynamically retrieves government schemes using Qdrant (local) and Tavily (live web).
    Uses AI extraction to parse raw web text into structured SchemeResponse objects,
    and caches the LLM outputs in SQLite to prevent redundant API calls.
    """
    # Ensure cache DB is initialized
    scheme_cache = _get_scheme_cache()
    scheme_extractor = _get_scheme_extractor()
    await scheme_cache.init_db()

    user_profile = UserProfile(
        state=state,
        category=category,
        age=age,
        gender=gender,
        income=income,
    )

    # We need a stable hash of the user profile for caching individual extractions
    profile_hash = str(hash(user_profile.model_dump_json()))
    
    # We also need a stable hash for the entire API response based on the filters
    api_query_hash = str(hash(f"{profile_hash}_{eligible_only}"))

    # ---------------------------------------------------------
    # 0. Check API Response Cache (Early Exit)
    # ---------------------------------------------------------
    cached_api_response = await scheme_cache.get_api_response(api_query_hash)
    if cached_api_response:
        logger.info("Cache hit for schemes API response. Bypassing search & LLM.")
        return [SchemeResponse(**s) for s in cached_api_response]

    schemes: List[SchemeResponse] = []
    seen_urls = set()

    # ---------------------------------------------------------
    # 1. Local Knowledge Base (Qdrant)
    # ---------------------------------------------------------
    try:
        qdrant_store = get_qdrant_store()
        vector_store = qdrant_store.get_vector_store()

        search_kwargs = {"k": 8}
        metadata_filter = MetadataFilter()
        qdrant_filter = metadata_filter.build_qdrant_filter(user_profile)
        if qdrant_filter:
            search_kwargs["filter"] = qdrant_filter

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs,
        )

        query_parts = ["government welfare schemes eligibility benefits"]
        if category:
            query_parts.append(f"for {category}")
        if state:
            query_parts.append(f"in {state}")
        if age:
            query_parts.append(f"for {age} years old")
        if gender:
            query_parts.append(f"for {gender}")
        if income:
            query_parts.append(f"income {income}")
        query = " ".join(query_parts)

        results = await retriever.ainvoke(query)

        # Helper to process a single document concurrently
        async def _process_document(idx: int, source_url: str, raw_content: str, source_type: str) -> Optional[SchemeResponse]:
            if len(raw_content) < 50:
                return None

            # Check cache first
            cache_key = f"{source_url}_{profile_hash}"
            cached_data = await scheme_cache.get(cache_key)

            if cached_data:
                if not cached_data.get("is_valid_scheme", False):
                    return None
                extracted = cached_data
            else:
                # LLM Extraction
                ai_result = await scheme_extractor.extract(raw_content, user_profile)
                if not ai_result:
                    return None
                extracted = ai_result.model_dump()
                await scheme_cache.set(cache_key, extracted)

                if not extracted.get("is_valid_scheme", False):
                    return None

            status = extracted.get("eligibility_status", "insufficient_evidence")
            if eligible_only and status not in ["supported", "partially_supported"]:
                return None

            match_pct = extracted.get("match_score", 85)

            return SchemeResponse(
                id=str(uuid.uuid4()) if source_type == "Local Knowledge Base" else f"tavily-{idx}",
                title=extracted.get("title", "Government Scheme"),
                ministry=extracted.get("ministry", "Government of India"),
                match_percentage=min(match_pct, 99),
                eligibility_summary=extracted.get("eligibility_summary", ""),
                benefits=extracted.get("benefits", []),
                source_url=source_url,
                source_type=source_type,
                eligibility_status=status,
            )

        tasks = []
        for idx, doc in enumerate(results):
            source_url = doc.metadata.get(
                "source", doc.metadata.get("source_url", f"local-{idx}")
            )

            if source_url in seen_urls:
                continue
            seen_urls.add(source_url)

            raw_content = _pre_process_text(doc.page_content)
            tasks.append(_process_document(idx, source_url, raw_content, "Local Knowledge Base"))
            
        processed_schemes = await asyncio.gather(*tasks)
        for s in processed_schemes:
            if s:
                schemes.append(s)

    except Exception as e:
        logger.error("Error querying Qdrant for schemes: %s", e, exc_info=True)

    # ---------------------------------------------------------
    # 2. Live Web Fallback (Tavily)
    # ---------------------------------------------------------
    if len(schemes) < 5:
        try:
            tavily = TavilySearchService()
            query_parts = [
                "Indian government welfare schemes eligibility benefits 2026"
            ]
            if category:
                query_parts.append(f"for {category}")
            if state:
                query_parts.append(f"in {state}")
            if age:
                query_parts.append(f"for {age} years old")
            if gender:
                query_parts.append(f"for {gender}")
            if income:
                query_parts.append(f"income {income}")
            query = " ".join(query_parts)

            tavily_docs = await tavily.perform_search(query)
            
            tasks = []
            for idx, doc in enumerate(tavily_docs[:10]):
                source_url = doc.metadata.get("source", "")
                if not source_url or source_url in seen_urls:
                    continue
                seen_urls.add(source_url)

                raw_content = _pre_process_text(doc.page_content)
                tasks.append(_process_document(idx, source_url, raw_content, "Live Web"))

            processed_schemes = await asyncio.gather(*tasks)
            for s in processed_schemes:
                if s:
                    schemes.append(s)

        except Exception as e:
            logger.error("Error in Tavily fallback for schemes: %s", e, exc_info=True)

    schemes.sort(key=lambda s: s.match_percentage, reverse=True)
    
    # Store the final result in the API response cache
    if schemes:
        await scheme_cache.set_api_response(api_query_hash, [s.model_dump() for s in schemes])
        
    return schemes
