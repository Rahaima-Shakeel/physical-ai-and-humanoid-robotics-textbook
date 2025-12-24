from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class ExperienceLevel(str, Enum):
    Beginner = "Beginner"
    Intermediate = "Intermediate"
    Advanced = "Advanced"

class SoftwareContext(BaseModel):
    languages: List[str]
    experience_level: ExperienceLevel
    preferred_tools: List[str]

class HardwareContext(BaseModel):
    devices: List[str]
    specifications: Dict[str, Any] = {}
    constraints: List[str] = []

class UserProfileRequest(BaseModel):
    software_context: SoftwareContext
    hardware_context: HardwareContext

class UserProfileResponse(UserProfileRequest):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime