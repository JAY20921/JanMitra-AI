import asyncio
from app.services.tavily_client import TavilySearchService
from app.services.scheme_extractor import SchemeExtractor
import json

async def test():
    t = TavilySearchService()
    ext = SchemeExtractor()
    docs = await t.perform_search('Indian government welfare schemes eligibility benefits 2026 -site:myscheme.gov.in unemployed West Bengal')
    for d in docs:
        print(f"URL: {d.metadata['source']}")
        result = await ext.extract(d.page_content)
        if result:
            print(json.dumps(result.model_dump(), indent=2))
        else:
            print("Extraction failed (None)")
        print("-" * 50)
if __name__ == "__main__":
    asyncio.run(test())
