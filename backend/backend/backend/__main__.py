from backend.settings import settings

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:get_app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=settings.reload,
        lifespan="on",
        factory=True,
    )
