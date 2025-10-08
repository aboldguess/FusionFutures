"""
============================================================================
File: services/api/src/fusion_futures_api/core/settings.py
Purpose: Provide strongly typed application settings loaded from environment variables.
Structure: Pydantic BaseSettings definitions for database, security, and feature toggles.
Usage: Imported wherever configuration is required; ensures secure defaults.
============================================================================
"""
from __future__ import annotations

from functools import lru_cache
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    database_url: str = Field("sqlite:///./fusion_futures.db", env="DATABASE_URL")
    secret_key: str = Field("super-secret-demo", env="SECRET_KEY")
    cors_origins: str = Field("http://localhost:3100", env="CORS_ORIGINS")
    cookie_domain: str | None = Field(None, env="COOKIE_DOMAIN")
    redis_url: str = Field("redis://localhost:6379/0", env="REDIS_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
