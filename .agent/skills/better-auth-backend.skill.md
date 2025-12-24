# Skill: Better-Auth FastAPI Integration

## Metadata
- **Name**: better-auth-fastapi
- **Category**: security
- **Tags**: auth, fastapi, python, security, jwt, better-auth

## Description
Scaffolds a robust authentication verification layer for FastAPI that consumes tokens issued by a Better-Auth service. Implements JWKS caching and `get_current_user` dependency injection.

## Inputs
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| auth_url | string | No | http://localhost:3000 | URL of the Better-Auth service |

## Outputs
- `backend/auth.py` - Core authentication logic
- `backend/requirements.txt` - Dependency updates

## Execution Steps

### 1. Update Dependencies
Add `pyjwt` with crypto support to process keys.

```bash
# Update requirements.txt or run:
uv add "pyjwt[crypto]"
```

### 2. Create `backend/auth.py`
This file serves as the gatekeeper for your API routes.

```python
import os
import jwt
from jwt import PyJWKClient
from functools import lru_cache
from typing import Annotated, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# --- Configuration ---
# Ideally verify against the specific better-auth server URL
AUTH_BASE_URL = os.getenv("BETTER_AUTH_URL", "{{auth_url}}")
JWKS_URL = f"{AUTH_BASE_URL}/.well-known/jwks.json"

security = HTTPBearer()

# --- Models ---
class UserSession(BaseModel):
    """Represents the authenticated user extracted from the token"""
    id: str
    email: str | None = None
    name: str | None = None
    email_verified: bool = False

    # Add any custom claims you configured in Better-Auth here
    # role: str = "user"

# --- Logic ---

@lru_cache()
def get_jwks_client():
    """
    Caches the JWKS client to prevent fetching keys on every request.
    PyJWKClient handles key rotation and caching internally as well.
    """
    return PyJWKClient(JWKS_URL)

async def get_current_user_token(
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> dict:
    """
    Low-level dependency: Decodes token and returns raw payload.
    """
    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token.credentials)

        payload = jwt.decode(
            token.credentials,
            signing_key.key,
            algorithms=["RS256", "HS256"],
            options={
                "verify_aud": False, # Adjust if your Better-Auth sets audience
                "verify_exp": True
            }
        )
        return payload
    except jwt.ConnectError:
        print(f"ERROR: Could not connect to Auth JWKS at {JWKS_URL}")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Auth service unreachable")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except Exception as e:
        print(f"Auth Verification Error: {e}")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid authentication credentials")

async def get_current_user(
    claims: Annotated[dict, Depends(get_current_user_token)]
) -> UserSession:
    """
    High-level dependency: Returns a strongly-typed User model.
    Usage:
        @app.get("/me")
        def me(user: UserSession = Depends(get_current_user)):
            return user
    """
    return UserSession(
        id=claims.get("sub") or claims.get("id", ""),
        email=claims.get("email"),
        name=claims.get("name"),
        email_verified=claims.get("email_verified", False)
    )
```

### 3. Usage Example (for context)

Copy this snippet into `main.py` or your routers to protect endpoints.

```python
from fastapi import APIRouter
from .auth import get_current_user, UserSession

router = APIRouter()

@router.get("/protected-resource")
async def read_protected_data(user: UserSession = Depends(get_current_user)):
    return {
        "message": f"Hello {user.name or user.email}!",
        "secret_data": "Only visible to authed users",
        "user_id": user.id
    }
```
