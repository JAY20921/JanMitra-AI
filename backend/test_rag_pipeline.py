import asyncio
import os
import sys

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv('.env')

# Ensure config loads the .env correctly
from app.core.config import settings

from app.rag.retriever import Retriever
from app.rag.temp_store import TempSessionStore
from app.rag.vector_store import QdrantStore

async def test_pipeline():
    print("="*50)
    print("Testing RAG Pipeline Components")
    print("="*50)
    print(f"Active Embedding Model: {settings.EMBEDDING_MODEL_NAME}")
    
    print("\n1. Initializing TempStore (Memory)...")
    temp_store = TempSessionStore()
    
    print("\n2. Initializing QdrantStore (Local DB)...")
    qdrant_store = QdrantStore()
    
    print("\n3. Initializing Retriever (Tavily + Qdrant + Embeddings)...")
    try:
        retriever = Retriever()
        print("Retriever initialized successfully!")
    except Exception as e:
        print(f"Failed to initialize Retriever: {e}")
        return

    query = "What are the eligibility criteria for the PM Kisan Samman Nidhi Yojana?"
    print(f"\n4. Executing Retrieval Query: '{query}'")
    
    try:
        docs = await retriever.retrieve_documents(query=query, user_profile=None, session_id="test_session")
        print(f"\nSuccess! Retrieved {len(docs)} documents.")
        
        for i, doc in enumerate(docs[:3]):
            source = doc.metadata.get('source', 'Unknown')
            source_type = doc.metadata.get('source_type', 'Unknown')
            print(f"\n--- Document {i+1} ---")
            print(f"Source Type: {source_type}")
            print(f"Source: {source}")
            print(f"Snippet: {doc.page_content[:200]}...")
            
    except Exception as e:
        print(f"\nRetrieval failed during execution: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_pipeline())
