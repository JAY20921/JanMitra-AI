import asyncio
import sys
from app.rag.retriever import Retriever
from app.models.user import UserProfile

async def main():
    try:
        ret = Retriever()
        docs = await ret.retrieve_documents('agriculture schemes for farmers', UserProfile(category='Agriculture'))
        print(f'Found {len(docs)} docs.')
        for i, d in enumerate(docs):
            source_type = d.metadata.get("source_type", "Unknown")
            title = d.metadata.get("title", "No Title")
            source = d.metadata.get("source", "No Source")
            print(f'\n--- Doc {i} | Type: {source_type} | Title: {title} | Source: {source} ---')
            print(d.page_content[:200].replace('\n', ' '))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
