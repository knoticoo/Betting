"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Football Predictions API"
    
    # Database
    DATABASE_URL: str = "sqlite:///./football_predictions.db"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # ML Settings
    ML_MODEL_PATH: str = "./models"
    MLFLOW_TRACKING_URI: str = "sqlite:///./mlflow.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".csv", ".json", ".xlsx"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
