from typing import List
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

class Chunker:
    """
    Splits document text into semantically meaningful chunks using LangChain.
    Ensures that chunks do not break sentences in the middle when possible.
    """
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", "?", "!", " ", ""]
        )

    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        """
        Takes a list of LangChain Documents and splits them into smaller chunk Documents.
        """
        return self.text_splitter.split_documents(documents)
