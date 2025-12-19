from typing import Optional

import trafilatura
import json


def extract_content(url: str) -> Optional[dict]:
    """Downloads and extracts main text content and metadata from a URL."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            print(f"Failed to fetch {url}")
            return None

        # Extract as JSON string to get metadata reliably
        json_output = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=True,
            no_fallback=False,
            output_format="json"
        )

        if not json_output:
            return None

        data = json.loads(json_output)

        return {
            "text": data.get("text"),
            "title": data.get("title"),
            "url": url,
            # "date": data.get("date"),
            # "fingerprint": data.get("fingerprint"),
        }
    except Exception as e:
        print(f"Error extracting {url}: {e}")
        return None
