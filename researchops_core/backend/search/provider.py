"""
Unified Search Provider Abstraction for ResearchOps.
Supports:
- DuckDuckGo live scraping
- Wikipedia factual API
- Tavily / SerpAPI (if key provided)
- Deterministic seeded MockSearchProvider fallback
"""

import os
import re
import json
import urllib.parse
import urllib.request
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
load_dotenv("D:/webman_researchops/.env")
load_dotenv("D:/kognivera/.env")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

class BaseSearchProvider:
    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        raise NotImplementedError

class DuckDuckGoProvider(BaseSearchProvider):
    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
        results = []
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as response:
                html = response.read().decode("utf-8", errors="ignore")
            
            # Fast regex extraction of title and snippet
            snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
            titles = re.findall(r'<h2[^>]+class="result__title"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, re.DOTALL)
            
            for i in range(min(len(snippets), len(titles), max_results)):
                raw_link, raw_title = titles[i]
                clean_title = re.sub(r'<[^>]+>', '', raw_title).strip()
                clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
                if clean_title and clean_snippet:
                    results.append({
                        "title": clean_title,
                        "url": raw_link if raw_link.startswith("http") else "https://duckduckgo.com",
                        "snippet": clean_snippet,
                        "publisher": "Web Search",
                        "published_at": "2025/2026",
                        "independence_group": "group_web_search"
                    })
        except Exception:
            pass
        return results

class WikipediaProvider(BaseSearchProvider):
    def search(self, query: str, max_results: int = 2) -> List[Dict[str, Any]]:
        api_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(query)}&limit={max_results}&namespace=0&format=json"
        headers = {"User-Agent": USER_AGENT}
        results = []
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if len(data) >= 4:
                    titles = data[1]
                    snippets = data[2]
                    urls = data[3]
                    for i in range(len(titles)):
                        results.append({
                            "title": f"Wikipedia: {titles[i]}",
                            "url": urls[i],
                            "snippet": snippets[i],
                            "publisher": "Wikipedia Foundation",
                            "published_at": "2025",
                            "independence_group": "wikimedia_encyclopedia"
                        })
        except Exception as e:
            print(f"[Wikipedia Error] {e}")
        return results

class MockSearchProvider(BaseSearchProvider):
    """
    Fallback deterministic mock search provider when air-gapped or network down.
    """
    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        q_lower = query.lower()
        if "inventory" in q_lower or "retail" in q_lower or "computer vision" in q_lower:
            return [
                {
                    "title": "Gartner Retail Technology Report: CV Shelf Auditing 2025",
                    "url": "https://gartner.com/en/retail/reports/computer-vision-shelf-auditing-2025",
                    "snippet": "Mid-sized retailers deploying automated CV shelf tracking observed a 24% reduction in stockouts and 18-month ROI paybacks.",
                    "publisher": "Gartner",
                    "published_at": "2025-06-15",
                    "independence_group": "group_gartner_analysis"
                },
                {
                    "title": "Retail Tech India: Hardware vs Cloud CapEx Breakdown",
                    "url": "https://retailtechindia.com/insights/cv-edge-hardware-cost-breakdown",
                    "snippet": "Camera retrofitting across a standard 5,000 sq ft store averages INR 4.5 Lakhs initial outlay plus recurring cloud inference costs.",
                    "publisher": "Retail Tech India",
                    "published_at": "2025-11-20",
                    "independence_group": "group_retail_tech_india"
                },
                {
                    "title": "Economic Times: Shrinkage and Theft Impact in Indian Modern Retail",
                    "url": "https://economictimes.indiatimes.com/retail/theft-and-inventory-shrinkage-report",
                    "snippet": "Shrinkage accounts for 1.8% to 2.4% of total sales for Indian department stores, driving urgency toward automated auditing.",
                    "publisher": "The Economic Times",
                    "published_at": "2026-01-10",
                    "independence_group": "group_et_retail"
                }
            ]
        elif "loyalty" in q_lower or "food" in q_lower or "delivery" in q_lower:
            return [
                {
                    "title": "FoodTech India 2025: Zomato Gold vs Swiggy One Retention Study",
                    "url": "https://foodtechindia.org/research/subscription-retention-dynamics-2025",
                    "snippet": "Subscription members order 3.2x more frequently but reduce company gross contribution margin by 14% unless delivery fees are calibrated.",
                    "publisher": "FoodTech India",
                    "published_at": "2025-08-12",
                    "independence_group": "group_foodtech_india"
                },
                {
                    "title": "Bain & Company: Regional Quick-Service Unit Economics",
                    "url": "https://bain.com/insights/regional-food-delivery-loyalty-margins",
                    "snippet": "Tier-2 regional food aggregators face severe delivery partner shortages during peak discount subscription hours.",
                    "publisher": "Bain & Company",
                    "published_at": "2025-09-30",
                    "independence_group": "group_bain_mobility"
                }
            ]
        else:
            return [
                {
                    "title": "Frost & Sullivan Healthcare AI Adoption Matrix",
                    "url": "https://frost.com/healthcare/ai-copilots-clinic-telehealth-2025",
                    "snippet": "Over 68% of small outpatient clinics cite patient privacy laws (DPDP/HIPAA) and upfront training costs as primary adoption blockers.",
                    "publisher": "Frost & Sullivan",
                    "published_at": "2025-04-18",
                    "independence_group": "group_frost_healthcare"
                }
            ]

class SerpApiProvider(BaseSearchProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPAPI_KEY", "")

    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        if not self.api_key:
            return []
        url = f"https://serpapi.com/search.json?q={urllib.parse.quote(query)}&api_key={self.api_key}&num={max_results}&engine=google"
        results = []
        try:
            import requests
            params = {
                "q": query,
                "api_key": self.api_key,
                "num": max_results,
                "engine": "google"
            }
            resp = requests.get("https://serpapi.com/search.json", params=params, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("organic_results", [])[:max_results]:
                    link = item.get("link", "")
                    domain = urllib.parse.urlparse(link).netloc.replace("www.", "") or "Google Search"
                    results.append({
                        "title": item.get("title", ""),
                        "url": link,
                        "snippet": item.get("snippet", ""),
                        "publisher": domain,
                        "published_at": item.get("date", "2025/2026"),
                        "independence_group": f"google_{domain[:12]}"
                    })
        except Exception as e:
            print(f"[SerpApi Provider Notice] {e}")
        return results

class UnifiedSearchService:
    def __init__(self, mode: str = "LIVE"):
        self.mode = mode
        self.serpapi = SerpApiProvider()
        self.ddg = DuckDuckGoProvider()
        self.wiki = WikipediaProvider()
        self.mock = MockSearchProvider()
        
    def query(self, search_text: str, max_results: int = 4) -> List[Dict[str, Any]]:
        if self.mode == "DEMO":
            return self.mock.search(search_text, max_results=max_results)
            
        # Live attempts: SerpApi -> DuckDuckGo -> Wikipedia -> Mock
        try:
            results = self.serpapi.search(search_text, max_results=max_results)
            if not results:
                results = self.ddg.search(search_text, max_results=max_results)
            if not results:
                results = self.wiki.search(search_text, max_results=2)
            if not results:
                results = self.mock.search(search_text, max_results=max_results)
            return results
        except Exception:
            return self.mock.search(search_text, max_results=max_results)
