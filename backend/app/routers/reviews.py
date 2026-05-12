from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.database import get_db
from app.models.daily_review import DailyReview
from app.models.user import User
from app.schemas.daily_review import DailyReviewCreate, DailyReviewRead, RolloverRequest
from app.schemas.task import TaskRead
from app.services.rollover_service import RolloverService

router = APIRouter()


@router.post("/daily", response_model=DailyReviewRead)
async def create_daily_review(
    body: DailyReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    review = DailyReview(
        user_id=current_user.id,
        date=body.date,
        summary_text=body.summary_text,
        mood_score=body.mood_score,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return DailyReviewRead.model_validate(review)


@router.post("/rollover")
async def process_rollover(
    body: RolloverRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RolloverService(db)
    result = await service.process(body, current_user.id)
    return result
