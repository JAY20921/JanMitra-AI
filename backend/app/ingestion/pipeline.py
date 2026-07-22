import os
from typing import List
from langchain_community.document_loaders import PyMuPDFLoader, BSHTMLLoader
from langchain_core.documents import Document

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
            
        # In a real app, you would run the text through additional cleaning and metadata extraction here.
        # But LangChain loaders already provide some sensible defaults for metadata and text extraction.
        
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
