from pathlib import Path
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Project Information
    PROJECT_NAME: str = "Sketch2Screen AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ]

    # Image Validation & Storage
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    MIN_IMAGE_DIMENSION: int = 64
    MAX_IMAGE_DIMENSION: int = 4096
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    UPLOAD_DIR: Path = Path("/tmp/s2s_uploads")
    CLEANUP_EPHEMERAL_FILES: bool = True

    # AI Provider Settings
    VLM_PROVIDER: str = "mock"  # "mock" or "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    def get_upload_dir(self) -> Path:
        """Ensures the upload directory exists and returns it."""
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        return self.UPLOAD_DIR


settings = Settings()
