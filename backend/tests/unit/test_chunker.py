from services.ingest.chunker import chunk_text


def test_chunk_text_normal_split():
    text = "Sentence 1.\n\nSentence 2 is here."
    chunks = chunk_text(text, target_tokens=10)
    # With target_tokens=10, approx 40 chars.
    # Sentence 1 is short. Sentence 2 is short.
    # They might be combined if < 40 chars.
    # "Sentence 1.\n\nSentence 2 is here." is approx 30 chars.
    # Should be 1 chunk.
    assert len(chunks) >= 1
    assert "Sentence 1" in chunks[0]

def test_chunk_text_preserves_code_block():
    code = "```python\nprint('hello world')\n```"
    text = f"Intro text.\n\n{code}\n\nOutro text."

    # Set small target tokens to force split if logic wasn't preserving
    chunks = chunk_text(text, target_tokens=5)

    # Expect: "Intro text." (chunk 1), "Code block" (chunk 2, oversized), "Outro text." (chunk 3)
    # Note: Chunker logic appends code block to previous if it fits, else new chunk.
    # Intro text is short. Code block is medium.

    # Just verify code block is intact in one of the chunks
    found_code = False
    for ch in chunks:
        if code in ch:
            found_code = True
            break

    assert found_code, "Code block should be preserved intact"

def test_chunk_text_handles_empty():
    assert chunk_text("") == []
