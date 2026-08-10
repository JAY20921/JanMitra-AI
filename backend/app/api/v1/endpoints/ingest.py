from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
import os
import uuid
from app.ingestion.pipeline import IngestionPipeline
from app.rag.chunker import Chunker
from app.rag.embedding import get_embedding_model
from app.rag.vector_store import QdrantStore

router = APIRouter()

class IngestRequest(BaseModel):
    file_path: str

class IngestResponse(BaseModel):
    message: str
    num_chunks: int = 0

def process_file_in_background(file_path: str):
    try:
        # 1. Ingest
        pipeline = IngestionPipeline()
        documents = pipeline.ingest_file(file_path)
        if not documents:
            return
            
        # 2. Chunk
        chunker = Chunker()
        chunks = chunker.chunk_documents(documents)
        
        # 3. Add to Qdrant using Langchain
        vector_store = QdrantStore().get_vector_store()
        vector_store.add_documents(chunks)
        print(f"Successfully processed and stored {len(chunks)} chunks for {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

from fastapi.security import APIKeyHeader
from fastapi import Depends
from app.core.config import settings

api_key_header = APIKeyHeader(name="X-API-Key")

def verify_admin_key(api_key: str = Depends(api_key_header)):
    if api_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin API Key")
    return api_key

@router.post("/document", response_model=IngestResponse)
async def ingest_document(
    request: IngestRequest, 
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_admin_key)
):
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    background_tasks.add_task(process_file_in_background, request.file_path)
    return IngestResponse(message="Ingestion started in background")

from fastapi import UploadFile, File, Form
from app.rag.temp_store import get_temp_store
import shutil

@router.post("/temp", response_model=IngestResponse)
async def ingest_temp_document(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Ingests a user-uploaded document into an in-memory session store.
    It will be used as the highest priority context for queries with this session_id.
    """
    # 1. Validation
    if not file.content_type in ["application/pdf", "text/plain"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed.")
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Secure filename to prevent Path Traversal
    _, ext = os.path.splitext(file.filename)
    secure_filename = f"{uuid.uuid4().hex}{ext.lower()}"
    temp_file_path = os.path.join(temp_dir, secure_filename)
    
    # Save the uploaded file temporarily
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 1. Ingest
        pipeline = IngestionPipeline()
        documents = pipeline.ingest_file(temp_file_path)
        
        if not documents:
            raise HTTPException(status_code=400, detail="Could not extract text from document.")
            
        # Tag the documents
        for doc in documents:
            doc.metadata["source_type"] = "User Uploaded Document"
            doc.metadata["source"] = file.filename
            
        # 2. Chunk
        chunker = Chunker()
        chunks = chunker.chunk_documents(documents)
        
        # 3. Add to In-Memory Temp Store
        temp_store = get_temp_store().get_vector_store(session_id)
        temp_store.add_documents(chunks)
        
        return IngestResponse(
            message=f"Successfully processed and stored user document for session {session_id}",
            num_chunks=len(chunks)
        )
    except Exception as e:
        print(f"Error processing temp file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.delete("/temp/{session_id}", response_model=IngestResponse)
async def clear_temp_documents(session_id: str):
    """
    Clears the in-memory session store for a specific session,
    effectively 'unselecting' any uploaded documents.
    """
    get_temp_store().clear_session(session_id)
    return IngestResponse(message=f"Cleared documents for session {session_id}")
