from urllib.parse import urlparse
from typing import List

class SourceValidator:
    """
    Validates URLs and sources to ensure they meet strict government trust criteria.
    This prevents hallucinations by rejecting unverified sources like Reddit, Wikipedia, or blogs.
    """
    def __init__(self):
        # Official allowed domains/suffixes for the Indian Government
        self.allowed_suffixes = [
            ".gov.in",
            ".nic.in"
        ]
        
        self.allowed_domains = [
            "myscheme.gov.in",
            "india.gov.in",
            "pib.gov.in",
            "egazette.nic.in"
        ]

    def is_valid_url(self, url: str) -> bool:
        """
        Checks if a URL belongs to a trusted government domain and uses HTTPS.
        """
        try:
            parsed = urlparse(url)
            
            # 1. Enforce HTTPS
            if parsed.scheme != "https":
                return False
                
            domain = parsed.netloc.lower()
            
            # Remove 'www.' for cleaner checking
            if domain.startswith("www."):
                domain = domain[4:]
                
            # 2. Check strict exact matches
            if domain in self.allowed_domains:
                return True
                
            # 3. Check official suffixes (*.gov.in)
            if any(domain.endswith(suffix) for suffix in self.allowed_suffixes):
                return True
                
            return False
            
        except Exception:
            return False

    def filter_valid_results(self, search_results: List[dict]) -> List[dict]:
        """
        Takes a list of search result dictionaries (from Tavily) and returns only valid ones.
        Expects a dictionary with a 'url' key.
        """
        valid_results = []
        seen_urls = set()
        
        for result in search_results:
            url = result.get("url", "")
            
            # 4. Filter duplicates and invalid sources
            if url not in seen_urls and self.is_valid_url(url):
                valid_results.append(result)
                seen_urls.add(url)
                
        return valid_results
