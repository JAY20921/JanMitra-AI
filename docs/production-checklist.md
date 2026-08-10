# Production Readiness Checklist

## Implemented & Verified
- [x] **File Uploads**: Strict size limits (5MB), MIME type checks (PDF/TXT), and filename sanitization.
- [x] **Admin Security**: `/api/v1/ingest/document` is protected by an `ADMIN_API_KEY`.
- [x] **API Rate Limiting & Blocking**: Not strictly rate-limited, but file size and collection caps are implemented.
- [x] **Session Isolation**: `session_id` logic sanitized and locked down in `TempSessionStore`.
- [x] **Startup Latency**: Eager loading in `lifespan` moved to an async thread, avoiding Gunicorn WORKER TIMEOUTs.
- [x] **RAG Correctness**: Prompt logic updated for prompt injection defense and time-awareness. Deterministic citation IDs implemented.
- [x] **Structured Eligibility**: The `scheme_extractor` uses a robust 4-state eligibility status model.
- [x] **Document Versioning**: Ingestion pipeline calculates deterministic `document_id` and `content_hash`.

## Not Verified (Requires Infrastructure/Ops)
- [ ] **Database Persistence**: Qdrant is currently running either in-memory or on a local instance. Production requires connecting to a managed Qdrant Cloud cluster.
- [ ] **Horizontal Scaling**: `TempSessionStore` is in-memory. If deploying multiple instances (e.g. Render/AWS), sessions will not sync across nodes. This must be migrated to a shared Redis or Qdrant collection if multi-node scaling is activated.
- [ ] **Logging & Monitoring**: Application logs to stdout. Production should pipe this to a structured log aggregator (e.g., Datadog, CloudWatch).
- [ ] **Caching Backend**: `scheme_cache` uses SQLite. Production should ideally use Redis for shared cache.

## Known Limitations
- The system handles Indian languages via LLM translation. Very large PDFs in native scripts may exceed chunking boundaries abruptly, resulting in minor context loss.
- Fallback live search (Tavily) introduces unpredictable latency compared to the local vector DB.
