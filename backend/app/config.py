from pydantic import field_validator
from pydantic_settings import BaseSettings
import warnings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./zenith.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    llm_provider: str = "openai"  # "openai" | "anthropic"
    llm_model: str = "gpt-4o-mini"

    llm_timeout: int = 30
    llm_max_retries: int = 3

    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @field_validator("jwt_secret")
    @classmethod
    def warn_default_secret(cls, v: str) -> str:
        if v == "dev-secret-change-in-production":
            warnings.warn(
                "Using default JWT_SECRET. Set JWT_SECRET in your .env file for production.",
                UserWarning,
            )
        return v

    class Config:
        env_file = ".env"


settings = Settings()
