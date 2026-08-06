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
            # Central Government Core Portals
            "myscheme.gov.in",
            "india.gov.in",
            "pib.gov.in",
            "egazette.nic.in",
            
            # Major Central Scheme Portals
            "pmjay.gov.in",
            "pmkisan.gov.in",
            "nrega.nic.in",
            "nsap.nic.in",
            
            # State Government Portals (28 States)
            "ap.gov.in",                 # Andhra Pradesh
            "arunachalpradesh.gov.in",   # Arunachal Pradesh
            "assam.gov.in",              # Assam
            "state.bihar.gov.in",        # Bihar
            "cgstate.gov.in",            # Chhattisgarh
            "goa.gov.in",                # Goa
            "gujarat.gov.in",            # Gujarat
            "haryana.gov.in",            # Haryana
            "himachal.nic.in",           # Himachal Pradesh
            "jharkhand.gov.in",          # Jharkhand
            "karnataka.gov.in",          # Karnataka
            "kerala.gov.in",             # Kerala
            "mp.gov.in",                 # Madhya Pradesh
            "maharashtra.gov.in",        # Maharashtra
            "manipur.gov.in",            # Manipur
            "meghalaya.gov.in",          # Meghalaya
            "mizoram.gov.in",            # Mizoram
            "nagaland.gov.in",           # Nagaland
            "odisha.gov.in",             # Odisha
            "punjab.gov.in",             # Punjab
            "rajasthan.gov.in",          # Rajasthan
            "sikkim.gov.in",             # Sikkim
            "tn.gov.in",                 # Tamil Nadu
            "telangana.gov.in",          # Telangana
            "tripura.gov.in",            # Tripura
            "up.gov.in",                 # Uttar Pradesh
            "uk.gov.in",                 # Uttarakhand
            "wb.gov.in",                 # West Bengal
            
            # Union Territories (8 UTs)
            "andaman.gov.in",            # Andaman and Nicobar Islands
            "chandigarh.gov.in",         # Chandigarh
            "ddd.gov.in",                # Dadra and Nagar Haveli and Daman and Diu
            "delhi.gov.in",              # Delhi
            "jk.gov.in",                 # Jammu and Kashmir
            "ladakh.nic.in",             # Ladakh
            "lakshadweep.gov.in",        # Lakshadweep
            "py.gov.in"                  # Puducherry
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
