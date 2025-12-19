import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv(override=True)

from services.query.retrieval import QueryService
from services.query.models import ValidationQuery
from services.llm.agent import get_rag_agent
from agents import Runner

async def debug_rag():
    print("Loading environment...")
    # Check keys
    keys = ["QDRANT_URL", "QDRANT_API_KEY", "COHERE_API_KEY", "GEMINI_API_KEY"]
    missing = [k for k in keys if not os.getenv(k)]
    if missing:
        print(f"❌ Missing keys: {missing}")
        return

    print("✅ Keys present.")

    # 1. Test Retrieval
    print("\n--- Testing Retrieval ---")
    try:
        qs = QueryService()
        qs.initialize()
        print("QueryService initialized.")

        query = "What is a servo motor?"
        print(f"Searching for: '{query}'")
        res = qs.search(ValidationQuery(query_text=query, top_k=2))
        print(f"Found {len(res.results)} results.")
        context = ""
        for r in res.results:
            print(f"- {r.page_title} ({r.source_url})")
            print(f"  Content: {r.chunk_text[:200]}..." if len(r.chunk_text) > 200 else f"  Content: {r.chunk_text}")
            context += r.chunk_text + "\n"
    except Exception as e:
        print(f"❌ Retrieval Failed: {e}")
        import traceback
        traceback.print_exc()
        return

    # 2. Test Agent
    print("\n--- Testing Agent ---")
    try:
        agent = get_rag_agent(context=context)
        print(f"Agent created: {agent.name}")

        print("Running stream...")
        streamed = Runner.run_streamed(agent, input=query)

        async for event in streamed.stream_events():
             if getattr(event, "type", None) == "raw_response_event":
                data = getattr(event, "data", None)
                delta = getattr(data, "delta", None)
                if isinstance(delta, str):
                    print(delta, end="", flush=True)
        print("\n\n✅ Agent Test Complete.")

    except Exception as e:
        print(f"\n❌ Agent Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_rag())
