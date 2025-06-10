from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.settings import settings

from api.healthcheck import router as router_healthcheck
from api.detect_seg import router as router_detect_seg


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_healthcheck)
app.include_router(router_detect_seg)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
