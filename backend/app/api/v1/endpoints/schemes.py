from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import uuid
import re

from app.rag.vector_store import QdrantStore
from app.rag.metadata_filter import MetadataFilter
from app.models.user import UserProfile
from app.services.tavily_client import TavilySearchService
from app.services.scheme_extractor import SchemeExtractor
from app.services.scheme_cache import SchemeCache

router = APIRouter()

# Global instances for the API
scheme_extractor = SchemeExtractor()
scheme_cache = SchemeCache()

class SchemeResponse(BaseModel):
    id: str
    title: str
    ministry: str
    match_percentage: int
    eligibility_summary: str
    benefits: List[str]
    source_url: Optional[str] = None
    source_type: str = "Local Knowledge Base"
    is_user_eligible: bool = True

def _pre_process_text(text: str) -> str:
    """
    Lightweight pre-processor to strip obvious mojibake and control characters 
    before sending to the LLM, reducing token waste.
    """
    if not text:
        return ""
    # Strip control characters
    text = re.sub(r'[\x00-\x08\x0e-\x1f]', '', text)
    text = re.sub(r'\ufffd', '', text)
    # Strip sequences of ? mixed with non-ASCII that indicate mojibake
    text = re.sub(r'(?:[\u0080-\u00ff]\??){3,}', '', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

@router.get("/", response_model=List[SchemeResponse])
async def get_schemes(
    state: Optional[str] = Query(None, description="Filter by state"),
    category: Optional[str] = Query(None, description="Filter by category (e.g., Agriculture, Health)"),
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
    await scheme_cache.init_db()

    user_profile = UserProfile(
        state=state,
        category=category,
        age=age,
        gender=gender,
        income=income,
    )
    
    # We need a stable hash of the user profile for caching, because
    # the LLM now evaluates eligibility specific to this exact profile.
    profile_hash = str(hash(user_profile.model_dump_json()))

    schemes: List[SchemeResponse] = []
    seen_urls = set()

    # ---------------------------------------------------------
    # 1. Local Knowledge Base (Qdrant)
    # ---------------------------------------------------------
    try:
        qdrant_store = QdrantStore()
        vector_store = qdrant_store.get_vector_store()

        search_kwargs = {"k": 20}
        metadata_filter = MetadataFilter()
        qdrant_filter = metadata_filter.build_qdrant_filter(user_profile)
        if qdrant_filter:
            search_kwargs["filter"] = qdrant_filter

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs,
        )

        query_parts = ["government welfare schemes eligibility benefits"]
        if category: query_parts.append(f"for {category}")
        if state: query_parts.append(f"in {state}")
        if age: query_parts.append(f"for {age} years old")
        if gender: query_parts.append(f"for {gender}")
        if income: query_parts.append(f"income {income}")
        query = " ".join(query_parts)

        results = await retriever.ainvoke(query)

        for idx, doc in enumerate(results):
            source_url = doc.metadata.get("source", doc.metadata.get("source_url", f"local-{idx}"))
            
            if source_url in seen_urls:
                continue

            raw_content = _pre_process_text(doc.page_content)
            if len(raw_content) < 50:
                continue

            # Check cache first
            cache_key = f"{source_url}_{profile_hash}"
            cached_data = await scheme_cache.get(cache_key)
            
            if cached_data:
                if not cached_data.get("is_valid_scheme", False) or not cached_data.get("is_user_eligible", True):
                    seen_urls.add(source_url)
                    continue
                extracted = cached_data
            else:
                # LLM Extraction
                ai_result = await scheme_extractor.extract(raw_content, user_profile)
                if not ai_result:
                    continue
                extracted = ai_result.model_dump()
                await scheme_cache.set(cache_key, extracted)
                
                if not extracted.get("is_valid_scheme", False):
                    seen_urls.add(source_url)
                    continue
                is_eligible = extracted.get("is_user_eligible", True)
                if eligible_only and not is_eligible:
                    seen_urls.add(source_url)
                    continue

            match_pct = extracted.get("match_score", 85)
            
            scheme_obj = SchemeResponse(
                id=str(uuid.uuid4()),
                title=extracted.get("title", "Government Scheme"),
                ministry=extracted.get("ministry", "Government of India"),
                match_percentage=min(match_pct, 99),
                eligibility_summary=extracted.get("eligibility_summary", ""),
                benefits=extracted.get("benefits", []),
                source_url=source_url,
                source_type="Local Knowledge Base",
                is_user_eligible=is_eligible,
            )
            
            schemes.append(scheme_obj)
            seen_urls.add(source_url)

    except Exception as e:
        print(f"Error querying Qdrant for schemes: {e}")

    # ---------------------------------------------------------
    # 2. Live Web Fallback (Tavily)
    # ---------------------------------------------------------
    if not schemes:
        try:
            tavily = TavilySearchService()
            query_parts = ["Indian government welfare schemes eligibility benefits 2026"]
            if category: query_parts.append(f"for {category}")
            if state: query_parts.append(f"in {state}")
            if age: query_parts.append(f"for {age} years old")
            if gender: query_parts.append(f"for {gender}")
            if income: query_parts.append(f"income {income}")
            query = " ".join(query_parts)

            tavily_docs = await tavily.perform_search(query)

            for idx, doc in enumerate(tavily_docs[:10]):
                if len(schemes) >= 4:
                    break

                source_url = doc.metadata.get("source", "")
                if not source_url or source_url in seen_urls:
                    continue

                raw_content = _pre_process_text(doc.page_content)
                if len(raw_content) < 50:
                    continue

                # Check cache first
                cache_key = f"{source_url}_{profile_hash}"
                cached_data = await scheme_cache.get(cache_key)
                
                if cached_data:
                    if not cached_data.get("is_valid_scheme", False) or not cached_data.get("is_user_eligible", True):
                        seen_urls.add(source_url)
                        continue
                    extracted = cached_data
                else:
                    # LLM Extraction
                    ai_result = await scheme_extractor.extract(raw_content, user_profile)
                    if not ai_result:
                        continue
                    extracted = ai_result.model_dump()
                    await scheme_cache.set(cache_key, extracted)
                    
                    if not extracted.get("is_valid_scheme", False):
                        seen_urls.add(source_url)
                        continue
                    is_eligible = extracted.get("is_user_eligible", True)
                    if eligible_only and not is_eligible:
                        seen_urls.add(source_url)
                        continue

                match_pct = extracted.get("match_score", 85)

                schemes.append(SchemeResponse(
                    id=f"tavily-{idx}",
                    title=extracted.get("title", "Government Scheme"),
                    ministry=extracted.get("ministry", "Government of India"),
                    match_percentage=match_pct,
                    eligibility_summary=extracted.get("eligibility_summary", ""),
                    benefits=extracted.get("benefits", []),
                    source_url=source_url,
                    source_type="Live Web",
                    is_user_eligible=is_eligible,
                ))
                seen_urls.add(source_url)

        except Exception as e:
            print(f"Error in Tavily fallback for schemes: {e}")

    schemes.sort(key=lambda s: s.match_percentage, reverse=True)
    return schemes

