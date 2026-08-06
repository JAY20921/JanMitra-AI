# 🔍 JanMitra AI Project Audit Report

## 📌 Executive Summary
**JanMitra AI** is a multi-tier RAG (Retrieval-Augmented Generation) application built to help Indian citizens access and understand government welfare schemes. The project employs a monorepo architecture with a FastAPI Python backend and a Next.js (TypeScript) frontend.

This audit report outlines the current state of the architecture, stack details, module organization, code quality observations, and potential areas for improvement.

## 🏗 System Architecture & Technology Stack

### Backend Stack
- **Framework**: FastAPI (Python 3.12+), utilizing Pydantic for validation and settings management.
- **RAG Implementation**: Langchain (LangChain Expression Language - LCEL) integrating multi-provider LLM support (OpenAI, Google GenAI, Groq, HuggingFace).
- **Vector Database**: Qdrant (using `qdrant-client`), suitable for in-memory and persistent vector storage.
- **Embeddings & NLP**: `sentence-transformers`, `HuggingFaceEmbeddings`.
- **Search & Validation**: Tavily Search API (`tavily-python`), `beautifulsoup4` for web scraping/parsing.
- **Data parsing**: `PyMuPDF` for PDF extraction.
- **Database**: SQLite (via `aiosqlite`) for chat history storage.

### Frontend Stack
- **Framework**: Next.js 14.2.35 (App Router mode).
- **Language**: TypeScript (`@types/node`, `@types/react`, `@types/react-dom`).
- **Styling**: Tailwind CSS (with forms and container-queries plugins).
- **Markdown Rendering**: `react-markdown` and `remark-gfm` for rendering rich chat responses.

## 📂 Codebase Organization

The monorepo is well-structured into distinct operational domains:

1. **/backend**:
   - `app/api/`: REST API routing (v1).
   - `app/core/`: Security and configuration management.
   - `app/database/`: Qdrant client interactions.
   - `app/ingestion/`: Document parsers and metadata extractors.
   - `app/llm/`: Factory patterns for multiple LLM providers.
   - `app/models/`: Pydantic schema definitions.
   - `app/rag/`: The core 3-tier RAG logic (Tier 1: User doc, Tier 2: Qdrant, Tier 3: Tavily).
   - `app/services/`: External integrations (Tavily).
   - `app/utilities/`: Helper functions.
   - `test_*.py`: Various test files indicate an ongoing effort for automated testing.

2. **/frontend**:
   - `src/app/`: Next.js 14 App router directory (pages, layouts).
   - `src/lib/`: Frontend utilities, types, and constants.

3. **/data**: Stores raw government docs and processed knowledge bases.
4. **/docs**: Contains essential architectural decisions and plans.
5. **/docker-compose.yml**: Ready for containerized deployment, ensuring a reproducible environment.

## 🛡 Security & Best Practices

**Observations:**
- **Environment Management**: Environment variables are managed properly using `.env` files (with `.env.example` provided), which is parsed by `pydantic-settings`.
- **CORS Handling**: `CORSMiddleware` is implemented in `main.py` referencing the environment configuration (`CORS_ORIGINS`).
- **Dependency Tracking**: Dependencies are well-pinned in `requirements.txt` and `package.json`, minimizing supply-chain issues.
- **Vector Isolation**: Short-lived sessions and ephemeral user uploads prevent knowledge base poisoning.
- **Live Web Filtering**: The RAG pipeline relies on domain whitelisting (`*.gov.in`, `*.nic.in`), securing the system from hallucination triggers.

## 📈 Areas for Improvement & Recommendations

### 1. Backend Enhancements
- **Logging**: Ensure structured logging (e.g., using `loguru` or Python's `logging` with JSON formatting) is implemented across the RAG pipelines to trace user intent and retrieval effectiveness.
- **Testing**: While there are test files (`test_rag_pipeline.py`, `test_retrieval.py`), consider structuring tests under a dedicated `tests/` directory using `pytest`, segregating unit tests and integration tests.
- **Error Handling**: Standardize HTTP exceptions globally using FastAPI exception handlers to ensure frontend clients receive consistent error payloads.

### 2. Frontend Enhancements
- **State Management**: Ensure complex states (like multi-turn chats or document uploads) are well-managed (e.g., using Zustand or React Context if standard hooks become too cluttered).
- **Component Reusability**: Extract UI components (buttons, badges, modals) into a dedicated `components/ui/` folder if not already done, utilizing tools like Shadcn UI (as mentioned in the README).

### 3. CI/CD & DevOps
- **GitHub Actions/GitLab CI**: Add CI pipelines to automatically run `flake8`/`black`/`ruff` for Python, `eslint` for Next.js, and execute unit tests on every Pull Request.
- **Docker Multi-Stage Builds**: Ensure the `Dockerfile` for frontend and backend use multi-stage builds to minimize image sizes for production deployment.

### 4. Identified Bugs & Logical Errors in RAG Pipeline
During the audit, the following specific bugs and logical errors were identified in the RAG pipeline (`app/rag/`):

- **Metadata Filter Over-strictness (`metadata_filter.py`)**: The `build_qdrant_filter` method creates `must` conditions for demographic filters like `state`. This is a logical error because it will filter out all Central Government schemes (which might have `state` set to "All" or `None`) if a user provides a specific state (e.g., "Maharashtra"). It should use `should` conditions or include an `OR` clause to always include central schemes.
- **Tavily `include_domains` Misconfiguration (`tavily_client.py`)**: The `TavilySearchResults` tool is initialized with `include_domains=self.validator.allowed_domains + self.validator.allowed_suffixes`. Tavily's API expects exact domain strings (e.g., `"myscheme.gov.in"`), not wildcard suffixes like `".gov.in"`. Passing suffixes may lead to API errors or the parameter being ignored (though the post-retrieval `SourceValidator` acts as a safety net).
- **Hardcoded Vector Dimensions (`temp_store.py` & `vector_store.py`)**: Both vector stores hardcode `self.vector_size = 384`. While this matches the default `BAAI/bge-small-en-v1.5` model, the `README.md` suggests using `jinaai/jina-embeddings-v3` (which outputs 1024 dimensions). If a user configures a different model via the `.env` file, Qdrant will throw dimension mismatch errors during ingestion and retrieval. The dimension should be inferred dynamically from the embedding model.
- **Silent Database Failure Fallback (`retriever.py`)**: In `retrieve_documents`, if `base_retriever = self.qdrant_store...` throws an exception, `qdrant_results = []` is executed. While this prevents a crash, if the error is due to a missing Qdrant instance, it silently swallows the error and falls back to Tavily Search. This could unexpectedly exhaust Tavily API credits without alerting the developer to the database failure.

## 🎯 Conclusion

The **JanMitra AI** project showcases a robust, well-thought-out architecture suited for its high-trust requirements. The 3-Tier RAG system is a standout feature for mitigating hallucinations. By following the recommendations above and addressing the identified logical bugs in the RAG pipeline, the project can further improve its maintainability, scalability, and developer experience.
