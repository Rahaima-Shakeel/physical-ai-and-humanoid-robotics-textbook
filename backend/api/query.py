from fastapi import APIRouter, HTTPException

from services.query import QueryService, ValidationQuery, ValidationResponse

router = APIRouter(prefix="/query", tags=["query"])

# Instantiate service once? Or per request?
# For stateless logic, it's fine. Clients are initialized on first call.
query_service = QueryService()

@router.post("/validate", response_model=ValidationResponse)
async def validate_retrieval(query: ValidationQuery):
    """
    Validate content retrieval for a given query.
    """
    try:
        if not query_service.initialized:
            query_service.initialize()

        return query_service.search(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
