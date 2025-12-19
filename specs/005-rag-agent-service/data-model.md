# Data Model

## Domain Entites

### Chat Request
```python
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    selected_text: Optional[str] = None  # For "Ask about this"
```

### Chat Response
```python
class Source(BaseModel):
    url: str
    title: str
    similarity: float

class ChatResponse(BaseModel):
    response: str
    sources: List[Source]
    session_id: str
```

## Database Schema (Neon Postgres)

> Note: Implementing per Constitution Phase 1.

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,  -- Stores the sources used for assistant response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
