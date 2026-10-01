from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

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


async def rate_limit_handler(request: Request, exc: Exception) -> Response:
    retry_after = getattr(getattr(request.state, "view_rate_limit", None), "reset_at", None)
    headers = {"Retry-After": str(retry_after)} if retry_after else {}
    return JSONResponse(
        status_code=429,
        headers=headers,
        content={
            "detail": {
                "code": "rate_limited",
                "message": "Too many attempts. Wait a moment and try again",
            }
        },
    )


app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/v1")
