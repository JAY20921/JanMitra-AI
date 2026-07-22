# AI Citizen Assistant - Architecture

## Milestone 1: Project Setup & Folder Structure

### 1. Monorepo Structure

We opted for a single monolithic repository (monorepo) design:
```text
citizen-ai/
├── backend/          # FastAPI API, logic, DB interactions
├── frontend/         # Next.js web application
├── ingestion/        # Standalone scripts for loading/cleaning data
├── evaluation/       # RAGAS or TruLens evaluation tools
├── docs/             # Project documentation and architectural decisions
├── scripts/          # Helper bash/powershell scripts for deployment/setup
└── data/             # Raw and processed documents (pdfs, htmls)
```

**Why this way?**
- Keeps the frontend and backend closely synced.
- Easier to manage environment setups (e.g. Docker Compose at root later).
- Eases sharing of types (e.g., if we generate TS interfaces from OpenAPI schemas).

**Trade-offs:**
- Large repositories can be slower to clone/build if they grow massively.
- Requires careful handling of CI/CD pipelines (to avoid building frontend when only backend changed).

**Improvements:**
- Later on, we might adopt a build system like Turborepo if we add more services (e.g. an admin dashboard).

---

### 2. Backend Structure (Clean Architecture)

Inside `backend/app/`:
- `api/`: Contains FastAPI routers. This separates the HTTP transport layer from the logic.
- `services/`: Business logic. e.g., calling the database, validating logic.
- `rag/`: Core RAG components using LangChain (Vector stores, Document Loaders, Text Splitters, Retrievers). Separated so they can be tested independently of HTTP APIs.
- `llm/`: LangChain LLM Chat Models (ChatOpenAI, ChatGoogleGenerativeAI, ChatOllama) and LCEL Chains.
- `ingestion/`: Logic specific to processing PDFs/HTMLs into LangChain Documents.
- `database/`: Qdrant client initialization and `QdrantVectorStore` instances.
- `core/`: Configurations (`config.py`), security, exceptions.
- `models/`: Pydantic schemas.

**Why this way?**
- **SOLID Principles**: Single Responsibility is maintained. The API just handles HTTP. The services handle business logic. The `llm` folder handles talking to providers.
- **Maintainability**: If we swap Qdrant for PostgreSQL + pgvector later, we only change the `database/` module.
- **Dependency Injection**: We will pass services into the API routes, making them easily mockable during testing.

**Trade-offs:**
- More boilerplate code. A simple endpoint requires changing `api`, `services`, and `models`. But for a production application, this structure prevents spaghetti code.

---

### 3. Environment Variables (Pydantic Settings)

We use `pydantic-settings` to validate `.env` files.

**Why this way?**
- **Fail-Fast**: If `OPENAI_API_KEY` is required but missing, the app crashes immediately on startup, not halfway through a user request.
- **Type Safety**: IDEs provide autocompletion for `settings.ENVIRONMENT`.

**Improvements:**
- We could fetch secrets securely from AWS Secrets Manager or HashiCorp Vault in production instead of relying solely on `.env` files.
