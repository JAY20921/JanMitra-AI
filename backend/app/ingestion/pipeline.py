import os
from typing import List
from langchain_community.document_loaders import PyMuPDFLoader, BSHTMLLoader
from langchain_core.documents import Document

import hashlib
from datetime import datetime

class IngestionPipeline:
    """
    Orchestrates the ingestion process using LangChain Document Loaders.
    """
    def __init__(self):
        pass
        
    def ingest_file(self, file_path: str) -> List[Document]:
        _, ext = os.path.splitext(file_path.lower())
        
        if ext == ".pdf":
            loader = PyMuPDFLoader(file_path)
            documents = loader.load()
        elif ext in [".html", ".htm"]:
            loader = BSHTMLLoader(file_path)
            documents = loader.load()
        else:
            print(f"Unsupported file extension: {ext} for {file_path}")
            return []
            
        # Add deterministic versioning metadata
        doc_id = hashlib.sha256(file_path.encode()).hexdigest()
        retrieved_at = datetime.now().isoformat()
        
        for idx, doc in enumerate(documents):
            content_hash = hashlib.sha256(doc.page_content.encode()).hexdigest()
            doc.metadata["document_id"] = doc_id
            doc.metadata["chunk_id"] = f"{doc_id}_{idx}"
            doc.metadata["content_hash"] = content_hash
            doc.metadata["retrieved_at"] = retrieved_at
            doc.metadata["version"] = "1.0"
        
        return documents
        
    def ingest_directory(self, dir_path: str) -> List[Document]:
        all_documents = []
        for root, _, files in os.walk(dir_path):
            for file in files:
                file_path = os.path.join(root, file)
                print(f"Ingesting {file_path}...")
                docs = self.ingest_file(file_path)
                all_documents.extend(docs)
                
        return all_documents
