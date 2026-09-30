"""
Web Search & Retrieval Tools for ResearchOps Agent.
Supports DuckDuckGo HTML scraping, Wikipedia summaries, and direct web page retrieval
without external paid API keys.
"""

import re
import urllib.parse
import urllib.request
import json
from typing import List, Dict, Any
from bs4 import BeautifulSoup

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Search DuckDuckGo HTML endpoint and extract top organic results.
    """
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    
    results = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode("utf-8", errors="ignore")
            
        soup = BeautifulSoup(html, "html.parser")
        web_results = soup.find_all("div", class_="result__body")
        
        for r in web_results[:max_results]:
            title_tag = r.find("a", class_="result__snippet")
            link_tag = r.find("a", class_="result__url")
            head_tag = r.find("h2", class_="result__title")
            
            title = head_tag.get_text(strip=True) if head_tag else ""
            snippet = title_tag.get_text(strip=True) if title_tag else ""
            raw_link = link_tag.get("href", "") if link_tag else ""
            
            # Clean up duckduckgo redirect link if present
            if "uddg=" in raw_link:
                try:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw_link).query)
                    if "uddg" in parsed:
                        raw_link = parsed["uddg"][0]
                except Exception:
                    pass
            elif not raw_link.startswith("http"):
                raw_link = "https://" + raw_link.strip("/")
                
            if title and snippet:
                results.append({
                    "title": title,
                    "url": raw_link,
                    "snippet": snippet
                })
    except Exception as e:
        print(f"[DuckDuckGo Error] {e}")
        
    return results

def search_wikipedia(query: str, max_results: int = 2) -> List[Dict[str, str]]:
    """
    Search Wikipedia API for high-authority factual overviews.
    """
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
                        "snippet": snippets[i]
                    })
    except Exception as e:
        print(f"[Wikipedia Error] {e}")
    return results

def fetch_page_content(url: str, max_chars: int = 3500) -> str:
    """
    Fetch and parse clean readable text from a web page.
    """
    if not url.startswith("http"):
        return ""
    headers = {"User-Agent": USER_AGENT}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            soup = BeautifulSoup(html, "html.parser")
            # Remove scripts, styles, navbars
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()
            text = soup.get_text(separator=" ", strip=True)
            text = re.sub(r"\s+", " ", text)
            return text[:max_chars]
    except Exception as e:
        return f"[Failed to fetch content from {url}: {str(e)}]"
