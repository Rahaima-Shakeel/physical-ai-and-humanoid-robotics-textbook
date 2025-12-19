import re
from typing import List


def chunk_text(text: str, target_tokens: int = 500) -> List[str]:
    """
    Splits text into chunks of approx `target_tokens`.
    Preserves large code blocks and tables if possible ("Preserve & Oversize").
    """
    if not text:
        return []

    # 1. Identify "Indivisible" blocks (Code blocks fenced with ```)
    # We use a simple regex for markdown code blocks.
    # Note: This simple splitter might be imperfect for nested blocks but works for std markdown.

    # Simple split by code blocks
    # Pattern captures: (```[\s\S]*?```)
    parts = re.split(r'(```[\s\S]*?```)', text)

    chunks = []
    current_chunk = ""

    # Rough token estimator: 1 word ~= 1.3 tokens.
    # So target_words ~= target_tokens / 1.3
    TARGET_CHARS = target_tokens * 4 # Approximation: 1 token ~ 4 chars

    for part in parts:
        if part.startswith("```") and part.endswith("```"):
            # This is a code block.
            # If current chunk + code block is too big, flush current chunk.
            if len(current_chunk) + len(part) > TARGET_CHARS:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""

            # If code block itself is huge, we preserve it (Oversize)
            # If it fits in current, append it.
            if len(current_chunk) + len(part) <= TARGET_CHARS:
                current_chunk += "\n" + part
            else:
                # Flush current if any
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                # Add code block as its own chunk (even if oversized)
                chunks.append(part.strip())
        else:
            # Normal text. Split nicely.
            # Split by double newlines (paragraphs)
            paragraphs = part.split("\n\n")
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                if len(current_chunk) + len(para) > TARGET_CHARS:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                        current_chunk = ""

                    # If paragraph itself is huge (unlikely for text), strict split?
                    # For now, let's just append it to start a new chunk or split sentences if extremely huge.
                    # Simplification: just start new chunk.
                    if len(para) > TARGET_CHARS:
                        # Fallback for huge paragraph: recursive split?
                        # For now, allow oversize for simplicity or split by period.
                        current_chunk = para
                    else:
                        current_chunk = para
                else:
                    if current_chunk:
                        current_chunk += "\n\n" + para
                    else:
                        current_chunk = para

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks
