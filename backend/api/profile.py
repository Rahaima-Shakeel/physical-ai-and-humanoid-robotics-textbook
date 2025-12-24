from fastapi import APIRouter, Depends, HTTPException
import json
from schemas.profile import UserProfileRequest, UserProfileResponse, SoftwareContext, HardwareContext
from api.deps import get_current_user, UserSession
from services.db import Database

router = APIRouter()

@router.post("/user/profile", response_model=UserProfileResponse)
async def create_or_update_profile(
    profile: UserProfileRequest,
    user: UserSession = Depends(get_current_user)
):
    """
    Create or update the user's background profile.
    """
    print(f"Received profile update for user: {user.id} ({user.name})")
    # Prepare data for insertion
    software_json = json.dumps(profile.software_context.model_dump())
    hardware_json = json.dumps(profile.hardware_context.model_dump())

    # Check if profile exists
    existing = await Database.fetchrow(
        'SELECT id FROM public.user_profiles WHERE id = $1',
        user.id
    )

    if existing:
        query = """
        UPDATE public.user_profiles
        SET software_context = $1, hardware_context = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, created_at, updated_at
        """
        result = await Database.fetchrow(query, software_json, hardware_json, user.id)
    else:
        query = """
        INSERT INTO public.user_profiles (id, software_context, hardware_context)
        VALUES ($1, $2, $3)
        RETURNING id, created_at, updated_at
        """
        result = await Database.fetchrow(query, user.id, software_json, hardware_json)

    if not result:
        raise HTTPException(status_code=500, detail="Failed to save profile")

    # Reconstruct response
    return UserProfileResponse(
        id=user.id, # The profile ID matches user ID
        user_id=user.id,
        software_context=profile.software_context,
        hardware_context=profile.hardware_context,
        created_at=result['created_at'],
        updated_at=result['updated_at']
    )

@router.get("/user/profile", response_model=UserProfileResponse)
async def get_profile(
    user: UserSession = Depends(get_current_user)
):
    """
    Get the authenticated user's profile.
    """
    row = await Database.fetchrow(
        'SELECT * FROM public.user_profiles WHERE id = $1',
        user.id
    )

    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Parse JSONB fields
    software_data = json.loads(row['software_context']) if isinstance(row['software_context'], str) else row['software_context']
    hardware_data = json.loads(row['hardware_context']) if isinstance(row['hardware_context'], str) else row['hardware_context']


    return UserProfileResponse(
        id=row['id'],
        user_id=row['id'],
        software_context=SoftwareContext(**software_data),
        hardware_context=HardwareContext(**hardware_data),
        created_at=row['created_at'],
        updated_at=row['updated_at']
    )