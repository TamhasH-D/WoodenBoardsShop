from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PORT: int = 8001
    PATH_TO_YOLO_SEGMENT_MODEL: str

    class Config:
        env_file = ".env"  # Основной файл .env
        env_file_encoding = "utf-8"

# Инициализация настроек
settings = Settings()
