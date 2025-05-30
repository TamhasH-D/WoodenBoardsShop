import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI
from loguru import logger
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.settings import settings


def run_migrations() -> None:
    """Run Alembic migrations automatically."""
    try:
        logger.info("🔄 Running database migrations...")

        # Get the directory where alembic.ini is located
        backend_dir = Path(__file__).parent.parent
        alembic_ini_path = backend_dir / "alembic.ini"

        if not alembic_ini_path.exists():
            logger.error(f"❌ Alembic configuration not found at {alembic_ini_path}")
            return

        # Run alembic upgrade head
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            timeout=60  # 60 seconds timeout
        )

        if result.returncode == 0:
            logger.info("✅ Database migrations completed successfully")
            if result.stdout:
                logger.debug(f"Migration output: {result.stdout}")
        else:
            logger.error(f"❌ Migration failed with return code {result.returncode}")
            if result.stderr:
                logger.error(f"Migration error: {result.stderr}")
            if result.stdout:
                logger.error(f"Migration output: {result.stdout}")

    except subprocess.TimeoutExpired:
        logger.error("❌ Migration timed out after 60 seconds")
    except Exception as e:
        logger.error(f"❌ Unexpected error during migration: {e}")


async def setup_db(app: FastAPI) -> None:
    """Setup database."""
    # Run migrations first (only in non-test environments and if auto_migrate is enabled)
    if settings.env != "test" and settings.auto_migrate:
        run_migrations()

    engine = create_async_engine(
        str(settings.db.url),
        echo=settings.db.echo,
    )
    session_factory = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )

    app.state.db_engine = engine
    app.state.db_session_factory = session_factory


async def shutdown_db(app: FastAPI) -> None:
    """Shutdown database."""
    await app.state.db_engine.dispose()
