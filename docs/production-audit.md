# Production Audit Report

## Overview
This document outlines the findings of the production-readiness audit for the AI Citizen Assistant, focusing on scalability, correctness, and deployment readiness.

## Findings & Resolutions

### 1. In-Memory Session Scaling
- **Issue**: The temporary session store used `location=":memory:"` inside a singleton `__new__` pattern. This is not horizontally scalable across multiple Gunicorn workers.
- **Resolution**: Refactored `TempSessionStore` to include lifecycle management, TTL (2 hours), max capacity (100 sessions), and thread-locking. This prevents memory leaks on a single node, though full multi-node horizontal scaling requires migrating this to a shared Redis/Qdrant cluster.

### 2. Eager Loading Blockers
- **Issue**: The application's `lifespan` eagerly initialized the LLM and Embedding models synchronously, causing >120s blocking during startup, violating serverless timeout rules (e.g., Render free tier).
- **Resolution**: Wrapped the eager initialization in `asyncio.to_thread` to ensure the ASGI event loop remains unblocked during startup.

### 3. File Processing & Versioning
- **Issue**: The ingestion pipeline lacked deterministic IDs, causing duplicate chunks and uncontrolled data scaling when re-ingesting the same files.
- **Resolution**: Added deterministic `document_id` (SHA256 of file path), `chunk_id`, `content_hash`, and `retrieved_at` metadata to ensure idempotent behavior during vector store upserts.

### 4. Eligibility Logic Tightening
- **Issue**: Eligibility extraction previously relied on a binary `is_user_eligible` boolean, leading to false positives when data was insufficient.
- **Resolution**: Upgraded to a structured `eligibility_status` enum (`supported`, `partially_supported`, `insufficient_evidence`, `conflicting_evidence`) to provide nuanced responses.
