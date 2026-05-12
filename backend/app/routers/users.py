from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserPreferencesUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)


@router.patch("/me/preferences", response_model=UserRead)
async def update_preferences(
    body: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = dict(current_user.preferences)
    if body.work_hours is not None:
        prefs["work_hours"] = body.work_hours.model_dump()
    if body.peak_energy_time is not None:
        prefs["peak_energy_time"] = body.peak_energy_time
    if body.notification_enabled is not None:
        prefs["notification_enabled"] = body.notification_enabled
    if body.learning_mode_enabled is not None:
        prefs["learning_mode_enabled"] = body.learning_mode_enabled

    current_user.preferences = prefs
    await db.commit()
    await db.refresh(current_user)
    return UserRead.model_validate(current_user)
