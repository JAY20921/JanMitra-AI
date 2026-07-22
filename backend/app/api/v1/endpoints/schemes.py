from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from app.rag.vector_store import QdrantStore
from app.rag.metadata_filter import MetadataFilter
from app.models.user import UserProfile
from app.services.tavily_client import TavilySearchService
import re
import uuid

router = APIRouter()

class SchemeResponse(BaseModel):
    id: str
    title: str
    ministry: str
    match_percentage: int
    eligibility_summary: str
    benefits: List[str]
    source_url: Optional[str] = None
    source_type: str = "Local Knowledge Base"

@router.get("/", response_model=List[SchemeResponse])
async def get_schemes(
    state: Optional[str] = Query(None, description="Filter by state"),
    category: Optional[str] = Query(None, description="Filter by category (e.g., Agriculture, Health)"),
    age: Optional[int] = Query(None, description="Filter by age"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    income: Optional[float] = Query(None, description="Filter by income"),
):
    """
    Dynamically retrieves government schemes from the Qdrant knowledge base.
    Uses a broad semantic query to discover all relevant schemes, then groups
    and structures the results. Falls back to Tavily if Qdrant is empty.
    """
    # Build profile from query params for metadata filtering
    user_profile = UserProfile(
        state=state,
        category=category,
        age=age,
        gender=gender,
        income=income,
    )

    schemes: List[SchemeResponse] = []

    try:
        qdrant_store = QdrantStore()
        vector_store = qdrant_store.get_vector_store()

        # Build search kwargs with optional metadata filters
        search_kwargs = {"k": 20}
        metadata_filter = MetadataFilter()
        qdrant_filter = metadata_filter.build_qdrant_filter(user_profile)
        if qdrant_filter:
            search_kwargs["filter"] = qdrant_filter

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs,
        )

        # Use a broad query to discover schemes
        query = "government welfare schemes eligibility benefits"
        if category:
            query = f"{category} government schemes eligibility benefits"
        if state:
            query = f"{state} {query}"

        results = await retriever.ainvoke(query)

        # Group documents by source URL to avoid merging all schemes into one
        seen_sources = {}
        for idx, doc in enumerate(results):
            source_url = doc.metadata.get("source", doc.metadata.get("source_url", f"unknown-{idx}"))
            clean_title = "Govt Scheme"

            if source_url in seen_sources:
                # Append content to existing scheme's benefits
                existing = seen_sources[source_url]
                snippet = doc.page_content[:120].strip()
                if snippet and snippet not in existing["_content_snippets"]:
                    existing["_content_snippets"].append(snippet)
                continue

            # Extract structured info from document content
            content = doc.page_content
            ministry = doc.metadata.get("ministry", "Government of India")

            # Extract eligibility from content
            eligibility = _extract_section(content, ["eligib", "who can apply", "criteria"])
            if not eligibility:
                eligibility = content[:150].strip() + "..."

            # Extract benefits
            benefits_text = _extract_section(content, ["benefit", "features", "advantage", "provision"])
            benefits = _parse_benefits(benefits_text) if benefits_text else []
            if not benefits:
                # Fallback: use first 2 sentences
                sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 15]
                benefits = sentences[:2] if sentences else [content[:100]]

            # Score based on position (earlier results = higher relevance from vector search)
            match_pct = max(60, 98 - idx * 5)

            scheme_obj = SchemeResponse(
                id=str(uuid.uuid4()),
                title=clean_title,
                ministry=ministry,
                match_percentage=min(match_pct, 99),
                eligibility_summary=_clean_text(eligibility[:200]),
                benefits=[_clean_text(b) for b in benefits[:4]],
                source_url=source_url,
                source_type="Local Knowledge Base",
            )
            
            seen_sources[source_url] = {
                "scheme": scheme_obj,
                "_content_snippets": [doc.page_content[:120].strip()],
            }
            schemes.append(scheme_obj)

    except Exception as e:
        print(f"Error querying Qdrant for schemes: {e}")

    # Fallback: If Qdrant returned nothing, try Tavily live search
    if not schemes:
        try:
            tavily = TavilySearchService()
            query = "Indian government welfare schemes eligibility benefits 2026"
            if category:
                query = f"{category} {query}"
            if state:
                query = f"{state} {query}"

            tavily_docs = await tavily.perform_search(query)

            for idx, doc in enumerate(tavily_docs[:6]):
                content = doc.page_content
                raw_title = doc.metadata.get("title", "")
                title = _get_best_title(raw_title, content, fallback_idx=idx+1)
                source_url = doc.metadata.get("source", "")

                sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 15]
                eligibility = sentences[0] if sentences else content[:150]
                benefits = sentences[1:3] if len(sentences) > 1 else [content[:100]]

                match_pct = max(55, 85 - idx * 5)

                schemes.append(SchemeResponse(
                    id=f"tavily-{idx}",
                    title=title[:80],
                    ministry="Government of India",
                    match_percentage=match_pct,
                    eligibility_summary=_clean_text(eligibility[:200]),
                    benefits=[_clean_text(b) for b in benefits[:3]],
                    source_url=source_url,
                    source_type="Live Web",
                ))
        except Exception as e:
            print(f"Error in Tavily fallback for schemes: {e}")

    # Sort by match percentage descending
    schemes.sort(key=lambda s: s.match_percentage, reverse=True)

    return schemes


def _extract_section(text: str, keywords: List[str]) -> str:
    """Extract a section from text that contains any of the given keywords."""
    lines = text.split('\n')
    capturing = False
    captured = []

    for line in lines:
        lower_line = line.lower()
        if any(kw in lower_line for kw in keywords):
            capturing = True
            # Don't include the header line itself if it's just a label
            if len(line.strip()) > 30:
                captured.append(line.strip())
            continue
        if capturing:
            if line.strip() == '' and captured:
                break
            if line.strip():
                captured.append(line.strip())
            if len(captured) >= 3:
                break

    return ' '.join(captured) if captured else ""


def _parse_benefits(text: str) -> List[str]:
    """Parse benefits text into a list of individual benefit strings."""
    if not text:
        return []

    # Try splitting by bullet points, numbered lists, or newlines
    parts = re.split(r'[\n•●\-]\s*|\d+\.\s*', text)
    benefits = [p.strip() for p in parts if len(p.strip()) > 10]

    if not benefits:
        # Fallback: split by sentences
        benefits = [s.strip() for s in text.split('.') if len(s.strip()) > 10]

    return benefits[:4]


def _clean_text(text: str) -> str:
    """Removes markdown characters and excessive whitespace."""
    if not text:
        return ""
    text = re.sub(r'[#\*_`]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def _extract_scheme_from_content(content: str) -> str:
    # Deprecated based on user feedback
    return ""

def _get_best_title(raw_title: str, content: str, fallback_idx: int) -> str:
    """Strictly returns a generic title as requested by the user."""
    return "Govt Scheme"
