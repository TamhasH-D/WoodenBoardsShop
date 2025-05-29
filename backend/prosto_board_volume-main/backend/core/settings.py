from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    YOLO_SERVICE_SEGMENT_URL: str
    CONFIDENCE_THRESHOLD: float = 0.5
    CORS_URL: str = "*"
    PORT: int = 8001

    class Config:
        env_file = ".env"  # Основной файл .env
        env_file_encoding = "utf-8"

# Инициализация настроек
settings = Settings()
