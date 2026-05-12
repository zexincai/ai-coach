import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class WorkHours(BaseModel):
    start: str = "09:00"
    end: str = "18:00"


class UserPreferences(BaseModel):
    work_hours: WorkHours = WorkHours()
    peak_energy_time: str = "morning"  # morning | afternoon | evening
    notification_enabled: bool = True
    learning_mode_enabled: bool = False


class UserPreferencesUpdate(BaseModel):
    work_hours: WorkHours | None = None
    peak_energy_time: str | None = None
    notification_enabled: bool | None = None
    learning_mode_enabled: bool | None = None


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    preferences: dict
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
