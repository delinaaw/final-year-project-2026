from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from voiceform.api.router import api_router
from voiceform.core.config import settings
from voiceform.core.database import engine
from voiceform.core.limiter import limiter
from voiceform.core.logging import configure_logging


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    if settings.sentry_dsn:
        sentry_sdk.init(dsn=settings.sentry_dsn, environment=settings.app_env)
    yield
    await engine.dispose()


app = FastAPI(
    title="VoiceForm API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    openapi_url="/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/v1")
