import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.config import settings
from app.models import user, week_plan, task, daily_review
from app.routers import auth, users, plans, tasks, reviews, analytics, llm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Zenith Planner API",
    description="AI Personal Efficiency Coach Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
