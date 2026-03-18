"""
Centralized configuration using Pydantic Settings.
All secrets and environment variables are loaded from .env
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str
    SUPABASE_KEY: str
    FRONTEND_URL: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
