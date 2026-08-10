# RAG Evaluation & Correctness Strategy

## Overview
This document outlines the design decisions and architectural upgrades implemented to ensure the Retrieval-Augmented Generation (RAG) system is deterministic, accurate, and resistant to hallucination.

## Strategies Implemented

### 1. Deterministic Citation Mapping
- **The Problem**: LLMs often "hallucinate" URLs or cite generic domain names (e.g., `www.india.gov.in`) without knowing the actual source page.
- **The Solution**: Replaced semantic citations with a strict `source_id` mapping. The retriever now passes documents inside `<document source_id="doc_{idx}">` tags. The LLM is instructed to output exact IDs like `[doc_1]`. The backend can then deterministically map `doc_1` back to the exact URL or document name in the frontend.

### 2. Time-Awareness
- **The Problem**: Schemes have deadlines, and eligibility criteria change. An LLM operating without a concept of the current date can provide outdated or permanently incorrect advice.
- **The Solution**: The `current_date` is injected dynamically into the `SYSTEM_TEMPLATE` during every generation cycle, instructing the LLM to cross-reference scheme deadlines against today's date.

### 3. Transparent Fallback Handling
- **The Problem**: When the local knowledge base (Qdrant) and user uploads fail to yield relevant documents, the system needs a way to fail gracefully rather than guessing.
- **The Solution**: 
  - Tiered retrieval: Tier 1 (User Docs) -> Tier 2 (Local Official DB) -> Tier 3 (Tavily Live Search).
  - Explicit instruction: The LLM is commanded to state: *"I couldn't find this information on any verified official government website."* if context is completely empty.

### 4. Structured Output for Eligibility
- **The Problem**: RAG pipelines often struggle with binary "Yes/No" eligibility because human data is messy or incomplete.
- **The Solution**: Moved scheme eligibility extraction to a JSON schema requiring a nuanced `eligibility_status`:
  - `supported`: 100% matched criteria.
  - `partially_supported`: Matched some, missed some.
  - `insufficient_evidence`: User profile lacked required demographics.
  - `conflicting_evidence`: Explicitly disqualified based on profile.
