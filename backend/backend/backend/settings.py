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

    host: str = "localhost"
    port: int = 5432
    user: str = "postgres"
    password: SecretStr = SecretStr("postgres")
    database: str = "postgres"
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


class Settings(BaseSettings):
    """Main settings."""

    env: str = "local"
    host: str = "localhost"
    port: int = 8000
    workers: int = 1
    log_level: str = "info"
    reload: bool = False

    db: DBSettings = DBSettings()
    redis: RedisSettings = RedisSettings()

    model_config = SettingsConfigDict(
        env_file=DOTENV,
        env_prefix=PREFIX,
    )


settings = Settings()
