# AI Citizen Assistant: Production-Grade RAG Project Plan

## Project Vision
Build an AI-powered assistant that helps rural and underprivileged Indian citizens discover government welfare schemes using Retrieval-Augmented Generation (RAG). The system acts as a highly reliable, strict AI product (not a general chatbot) that answers questions solely based on official government documents and explicitly refuses to hallucinate information.

---

## Technical Stack
- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, Shadcn UI
- **Backend:** FastAPI, Python 3.12+, Pydantic, Langchain
- **Vector Database:** Qdrant
- **Embedding Model:** jinaai/jina-embeddings-v3 (local via sentence-transformers)
- **LLMs:** OpenAI, Gemini, Ollama
- **Evaluation:** RAGAS, TruLens
- **Deployment:** Docker, Docker Compose

---

## Development Roadmap (10 Milestones)

### Milestone 1: Foundation & Architecture (✅ Completed)
- Initialize the monorepo structure separating frontend, backend, ingestion, and evaluation.
- Set up a clean, domain-driven architecture in FastAPI (`api`, `services`, `rag`, `llm`, `database`, `core`, `models`).
- Implement strict type-safe configuration using `pydantic-settings`.
- Initialize Next.js 14 App Router for the frontend.
- Establish Python virtual environments and dependency management.

### Milestone 2: Document Ingestion & Parsing (✅ Completed)
**Goal:** Build a robust, manual data ingestion pipeline to convert official PDFs and HTMLs into clean text.
- **Components to build:**
  - `DocumentLoader`: Base classes for handling different file types.
  - `PDFParser`: Extract text accurately from dense government PDFs.
  - `HTMLParser`: Scrape and clean text from official government websites.
  - `TextCleaner`: Remove noise, fix formatting, and normalize text.
  - `MetadataExtractor`: Automatically deduce or assign metadata (Scheme Name, Ministry, State, Category, Source URL).
- **Architecture Note:** We will leverage LangChain document loaders (e.g., PyMuPDFLoader, BSHTMLLoader) to streamline parsing and ingestion.

### Milestone 3: Chunking & Vector Storage (✅ Completed)
**Goal:** Split clean text into semantically meaningful chunks and store them in Qdrant.
- **Components to build:**
  - `Chunker`: Implement semantic chunking strategies (e.g., RecursiveCharacterTextSplitter) using LangChain's text splitters. Ensure chunk boundaries don't break sentences.
  - `EmbeddingService`: Integrate `jinaai/jina-embeddings-v3` using `HuggingFaceEmbeddings` from LangChain to convert text chunks into vector embeddings.
  - `QdrantClient`: Use `QdrantVectorStore` from LangChain to manage collections, upsert vectors, and handle connection pooling.
- **Architecture Note:** Every Document inserted into Qdrant must have rich metadata to support future hard-filtering.

### Milestone 4: Retrieval & Metadata Filtering (✅ Completed)
**Goal:** Build the engine that fetches the most relevant document chunks based on a user's query.
- **Components to build:**
  - `Retriever`: Take a user's query, embed it, and perform a similarity search in Qdrant using LangChain's `VectorStoreRetriever`.
  - `MetadataFilter`: Parse the user's implicit profile (e.g., "farmer", "Maharashtra") to apply hard filters (Qdrant filter format) to the LangChain retriever search kwargs.
- **Architecture Note:** This guarantees we only retrieve schemes the user is actually eligible for, minimizing LLM hallucinations.

### Milestone 5: LLM Integration & Prompt Engineering
**Goal:** Generate the final response using the retrieved documents.
- **Components to build:**
  - `LLMProvider`: Initialize LangChain Chat models for OpenAI (`ChatOpenAI`), Gemini (`ChatGoogleGenerativeAI`), and Ollama (`ChatOllama`). This ensures we aren't vendor-locked.
  - `PromptBuilder`: Construct strict `ChatPromptTemplate` that enforce the "no hallucination" rule and demand inline citations.
  - **Multilingual Support**: Ensure prompts dynamically instruct the LLM to translate responses into the user's preferred Indian language (Hindi, Tamil, Bengali, etc.) while citing English/Hindi sources accurately.
  - `Generator`: Combine the PromptBuilder, LLM Provider, and retriever using LangChain Expression Language (LCEL) or `create_retrieval_chain` to stream the final response.
- **Architecture Note:** The prompt must explicitly instruct the LLM: "If the information is not in the context, say 'I couldn't find this information in the official documents.'"

### Milestone 6: API Layer (FastAPI)
**Goal:** Expose the RAG pipeline to the frontend via clean, RESTful APIs.
- **Endpoints to build:**
  - `POST /api/v1/chat`: Main chat endpoint accepting a user's message and profile.
  - `POST /api/v1/ingest/document`: Endpoint to manually trigger the ingestion pipeline.
  - `GET /api/v1/schemes`: Fetch available schemes.
- **Architecture Note:** API endpoints will strictly rely on Pydantic schemas for request validation.

### Milestone 7: Frontend Application (Next.js)
**Goal:** Build a beautiful, accessible, and fast user interface.
- **Pages to build:**
  - Home Page: Simple, localized introduction to the assistant.
  - Chat Interface: Real-time chat UI displaying citations clearly and showing a qualitative confidence score (High/Medium/Low).
  - Profile Setup: Quick form to set age, occupation, income, and state to improve RAG filtering.
- **Architecture Note:** We will use Shadcn UI for accessible, unstyled components that we can heavily customize with Tailwind CSS to look professional and trustworthy.

### Milestone 8: Evaluation & Monitoring
**Goal:** Prove the system works reliably.
- **Components to build:**
  - Integration with RAGAS (Retrieval Augmented Generation Assessment).
  - Metrics to track: Faithfulness (no hallucinations), Context Precision, Context Recall, and Answer Relevancy.
- **Architecture Note:** We will build a script in the `evaluation/` folder to run batch tests against a golden dataset of questions.

### Milestone 9: Dockerization & Deployment
**Goal:** Make the application production-ready and easily deployable.
- **Components to build:**
  - `Dockerfile` for FastAPI backend.
  - `Dockerfile` for Next.js frontend.
  - `docker-compose.yml` to spin up Qdrant, Backend, and Frontend seamlessly.
  - Environment variable management for production.

### Milestone 10: Advanced RAG (Future Proofing)
**Goal:** Elevate the system to state-of-the-art.
- **Components to build:**
  - **Hybrid Search**: Combine Dense (Vector) search with Sparse (BM25/Keyword) search in Qdrant for better exact-match retrieval.
  - **Reranking**: Add a Cross-Encoder model (like `bge-reranker`) to re-score the top 20 results down to the top 5 most relevant results before sending to the LLM.
  - **Agentic Workflows**: Introduce LangGraph for multi-step reasoning (e.g., if a user query is too vague, the AI first asks a clarifying question before hitting the vector DB).
