from slowapi import Limiter
from slowapi.util import get_remote_address

from voiceform.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=str(settings.redis_url),
    enabled=not settings.is_testing,
)
