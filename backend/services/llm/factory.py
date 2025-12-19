import os
from typing import Optional

from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel, set_tracing_disabled

def get_gemini_client() -> AsyncOpenAI:
    """Initialize and return an AsyncOpenAI client for Gemini-compatible endpoint.

    Requires GEMINI_API_KEY in environment or .env.
    """
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    # Gemini uses a specific base URL for OpenAI compatibility
    # https://ai.google.dev/gemini-api/docs/openai
    base_url = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    # Disable tracing per user preference/code snippet
    set_tracing_disabled(True)
    return client


def build_chat_model(client: AsyncOpenAI, model_name: str = "gemini-2.5-flash") -> OpenAIChatCompletionsModel:
    """Create an OpenAIChatCompletionsModel bound to provided client and model name."""
    return OpenAIChatCompletionsModel(openai_client=client, model=model_name)
