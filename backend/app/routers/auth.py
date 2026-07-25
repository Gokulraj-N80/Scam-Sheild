from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth import get_current_user
from app.services import firebase_service
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

class UserSyncRequest(BaseModel):
    email: str
    name: str
    photo_url: Optional[str] = None

@router.post("/sync")
def sync_user(request: UserSyncRequest, user: dict = Depends(get_current_user)):
    """
    Synchronizes logged in user's profile details with the database.
    """
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized. Missing or invalid authorization token."
        )
    try:
        updated_profile = firebase_service.upsert_user(
            user["uid"],
            {
                "email": request.email,
                "name": request.name,
                "photo_url": request.photo_url
            }
        )
        return {"status": "success", "user": updated_profile}
    except Exception as e:
        logger.error(f"Error synchronizing user {user['uid']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync user profile")
