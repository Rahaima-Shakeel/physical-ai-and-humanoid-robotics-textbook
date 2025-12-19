import xml.etree.ElementTree as ET
from typing import List

import requests


def fetch_sitemap(url: str) -> List[str]:
    """Fetches and parses a sitemap XML to extract URLs."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        root = ET.fromstring(response.content)
        # Handle namespaces if present, usually sitemaps have a default namespace
        # But simple findall with wildcard often works for 'loc'

        urls = []
        # Register namespace to be safe or strip it. ElementTree is tricky with namespaces.
        # Simple hack: iterate and look for 'loc' in tag name.
        for child in root.iter():
            if 'loc' in child.tag:
                if child.text:
                    urls.append(child.text.strip())

        return filter_urls(urls)
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def filter_urls(urls: List[str]) -> List[str]:
    """Excludes generated pages like tags, authors, archives."""
    excluded_patterns = [
        "/tags/",
        "/authors/",
        "/blog/archive",
        "/search",
        "/blog/tags",  # Common docusaurus
        "/markdown-page" # Example of generated page
    ]

    filtered = []
    for url in urls:
        if any(pattern in url for pattern in excluded_patterns):
            continue
        filtered.append(url)

    return filtered
