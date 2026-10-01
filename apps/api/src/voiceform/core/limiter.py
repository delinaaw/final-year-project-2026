from slowapi import Limiter
from slowapi.util import get_remote_address

from voiceform.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=str(settings.redis_url),
    enabled=settings.rate_limiting_on,
    in_memory_fallback_enabled=True,
    swallow_errors=not settings.is_production,
)
