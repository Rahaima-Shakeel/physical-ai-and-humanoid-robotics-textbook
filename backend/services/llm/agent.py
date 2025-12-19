from typing import Optional
from agents import Agent
from services.llm.factory import get_gemini_client, build_chat_model

def get_rag_agent(
    context: str,
    name: str = "Tutor",
    model_name: str = "gemini-2.5-flash"
) -> Agent:
    """
    Creates a RAG-aware agent with injected context.

    Args:
        context: The retrieved text chunks from the textbook.
        name: Name of the agent.
        model_name: Model identifier.
    """
    client = get_gemini_client()

    instructions = f"""
You are an expert tutor for the "Physical AI & Humanoid Robotics" textbook.
Your goal is to answer student questions based ONLY on the provided textbook context.

CONTEXT FROM TEXTBOOK:
{context}

INSTRUCTIONS:
1. Answer the user's question using the information above.
2. If someone greets you, respond politely.
3. If the answer is not in the context, say "I cannot find this information in the textbook."
4. Do not use outside knowledge unless necessary to explain a concept found in the text.
5. Be concise and educational.
    """.strip()

    return Agent(
        name=name,
        instructions=instructions,
        model=build_chat_model(client, model_name=model_name),
    )
