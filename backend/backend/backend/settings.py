import pathlib

from pydantic import SecretStr
from pydantic_settings import BaseSettings as PydanticBaseSettings
from pydantic_settings import SettingsConfigDict
from yarl import URL

PREFIX = "BACKEND_"

DOTENV = pathlib.Path(__file__).parent.parent / ".env"


class BaseSettings(PydanticBaseSettings):
    """Base settings."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


class DBSettings(BaseSettings):
    """Configuration for PostgreSQL connection."""

    host: str = "backend-pg"
    port: int = 5432
    user: str = "backend"
    password: SecretStr = SecretStr("backend")
    database: str = "backend"
    pool_size: int = 15
    echo: bool = False
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix=f"{PREFIX}PG_",
    )

    @property
    def url(self) -> URL:
        """Generates a URL for the PostgreSQL connection."""
        return URL.build(
            scheme="postgresql+asyncpg",
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password.get_secret_value(),
            path=f"/{self.database}",
        )


class RedisSettings(BaseSettings):
    """Configuration for Redis."""

    host: str = "redis"
    port: int = 6379
    password: SecretStr = SecretStr("")
    max_connections: int = 50
    cache_ttl_seconds: int = 3600  # Default to 1 hour

    @property
    def url(self) -> URL:
        """Generates a URL for the Redis connection."""
        return URL.build(
            scheme="redis",
            host=self.host,
            port=self.port,
            password=self.password.get_secret_value(),
        )

    model_config = SettingsConfigDict(env_file=".env", env_prefix=f"{PREFIX}REDIS_")


class CORSSettings(BaseSettings):
    """Configuration for CORS settings."""

    allow_origins: str = "*"
    allow_credentials: bool = True
    allow_methods: str = "*"
    allow_headers: str = "*"

    @property
    def origins_list(self) -> list[str]:
        """Convert comma-separated string to list."""
        if self.allow_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.allow_origins.split(",")]

    @property
    def methods_list(self) -> list[str]:
        """Convert comma-separated string to list."""
        if self.allow_methods == "*":
            return ["*"]
        return [method.strip() for method in self.allow_methods.split(",")]

    @property
    def headers_list(self) -> list[str]:
        """Convert comma-separated string to list."""
        if self.allow_headers == "*":
            return ["*"]
        return [header.strip() for header in self.allow_headers.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix=f"{PREFIX}CORS_",
    )


class Settings(BaseSettings):
    """Main settings."""

    env: str = "local"
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1
    log_level: str = "info"
    reload: bool = False

    # File upload settings
    uploads_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB

    db: DBSettings = DBSettings()
    redis: RedisSettings = RedisSettings()
    cors: CORSSettings = CORSSettings()
    prosto_board_volume_seg_url: str = "http://yolo_backend:8001"

    @property
    def uploads_path(self) -> pathlib.Path:
        """Get absolute path to uploads directory."""
        if pathlib.Path(self.uploads_dir).is_absolute():
            return pathlib.Path(self.uploads_dir)

        # In Docker container, working directory is /app
        # In local development, we're in backend/backend
        if pathlib.Path("/app").exists():
            # Docker environment
            return pathlib.Path("/app") / self.uploads_dir
        else:
            # Local development - relative to project root (where backend/backend is located)
            return pathlib.Path(__file__).parent.parent / self.uploads_dir

    @property
    def products_uploads_path(self) -> pathlib.Path:
        """Get absolute path to products uploads directory."""
        return self.uploads_path / "products"

    model_config = SettingsConfigDict(
        env_file=DOTENV,
        env_prefix=PREFIX,
    )


settings = Settings()
