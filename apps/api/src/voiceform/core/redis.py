from redis.asyncio import ConnectionPool, Redis

from voiceform.core.config import settings

pool = ConnectionPool.from_url(str(settings.redis_url), decode_responses=True)


def get_redis() -> Redis:
    return Redis(connection_pool=pool)
