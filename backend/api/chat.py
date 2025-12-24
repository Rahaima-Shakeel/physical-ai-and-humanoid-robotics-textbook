import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.query.retrieval import QueryService
from services.query.models import ValidationQuery
from services.llm.agent import get_rag_agent
from agents import Runner
from .deps import get_current_user, get_optional_current_user, UserSession
from services.db import Database

# Configure logging to inspect ChatKit requests
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context_limit: int = 5

@router.post("/message")
async def chat_message(
    request: Request,
    query_service: QueryService = Depends(QueryService),
    user: Optional[UserSession] = Depends(get_optional_current_user)
):
    """
    Handle chat message with RAG and streaming response.
    Supports simple JSON { "message": "..." }
    """

    try:
        body = await request.json()
        logger.info(f"Chat Request Body: {body}")

        # Debug Logging
        print(f"DEBUG: Cookies received: {request.cookies.keys()}")
        print(f"DEBUG: User identified: {user.id if user else 'None'}")

        user_message = body.get("message", "")
        if not user_message:
            # Fallback for complex nesting if client sends something else
            if "messages" in body and body["messages"]:
                user_message = body["messages"][-1].get("content", "")

        if not user_message:
             user_message = "Hello" # Fallback

        # 1. Retrieve context
        search_response = query_service.search(
            ValidationQuery(
                query_text=user_message,
                top_k=5
            )
        )
        results = search_response.results

        context_text = ""
        sources_metadata = []

        for i, res in enumerate(results):
            source_id = i + 1
            title = res.page_title
            url = res.source_url
            text = res.chunk_text.strip()
            context_text += f"SOURCE [{source_id}] (Title: {title}, URL: {url}):\n{text}\n\n"
            sources_metadata.append({
                "id": source_id,
                "title": title,
                "url": url,
                "score": res.similarity_score
            })

        # 2. Initialize Agent
        agent = get_rag_agent(context=context_text)

        # 3. Stream Response & Log (if user authed or always if session id provided)
        # For simplicity, we log if a session_id is provided, or create one.
        session_id = body.get("session_id", "anonymous")

        async def event_generator():
            # Send sources
            yield f"data: {json.dumps({'type': 'sources', 'data': sources_metadata})}\n\n"

            streamed = Runner.run_streamed(agent, input=user_message)
            full_response = ""

            async for event in streamed.stream_events():
                if getattr(event, "type", None) == "raw_response_event":
                    data = getattr(event, "data", None)
                    delta = getattr(data, "delta", None)
                    if isinstance(delta, str):
                        full_response += delta
                        payload = json.dumps({"type": "content", "delta": delta})
                        yield f"data: {payload}\n\n"

            # 4. Persistence (Background-ish but simple for now)
            # Log the exchange in chat_messages table
            try:
                msg_query = """
                    INSERT INTO chat_messages (userId, sessionId, role, content)
                    VALUES ($1, $2, $3, $4), ($1, $2, $5, $6)
                """
                # We log both query and response in one go for simplicity here
                user_id = user.id if user else None
                await Database.execute(msg_query, user_id, session_id, "user", user_message, "assistant", full_response)
            except Exception as db_err:
                logger.error(f"Failed to persist chat message: {db_err}")

            yield "data: [DONE]\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        return {"error": str(e)}