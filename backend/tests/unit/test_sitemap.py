from services.ingest.sitemap import filter_urls


def test_filter_urls_excludes_generated_pages():
    urls = [
        "https://example.com/docs/intro",
        "https://example.com/tags/robotics",
        "https://example.com/authors/zain",
        "https://example.com/blog/archive/2024",
        "https://example.com/search",
        "https://example.com/docs/advanced/control",
        "https://example.com/markdown-page"
    ]

    filtered = filter_urls(urls)

    assert "https://example.com/docs/intro" in filtered
    assert "https://example.com/docs/advanced/control" in filtered

    assert "https://example.com/tags/robotics" not in filtered
    assert "https://example.com/authors/zain" not in filtered
    assert "https://example.com/blog/archive/2024" not in filtered
    assert "https://example.com/search" not in filtered
    assert "https://example.com/markdown-page" not in filtered

    assert len(filtered) == 2
