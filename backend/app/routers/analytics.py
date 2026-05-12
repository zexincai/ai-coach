from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import WeeklyReportResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/weekly", response_model=WeeklyReportResponse)
async def get_weekly_report(
    week_start: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AnalyticsService(db)
    return await service.build_weekly_report(current_user.id, week_start)
