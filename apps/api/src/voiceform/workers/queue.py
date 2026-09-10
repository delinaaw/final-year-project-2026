from typing import Any

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from voiceform.core.config import settings
from voiceform.core.logging import logger

_pool: ArqRedis | None = None


async def get_queue() -> ArqRedis:
    global _pool
    if _pool is None:
        _pool = await create_pool(RedisSettings.from_dsn(str(settings.redis_url)))
    return _pool


async def enqueue(task: str, *args: Any, **kwargs: Any) -> None:
    try:
        queue = await get_queue()
        await queue.enqueue_job(task, *args, **kwargs)
    except Exception as error:
        logger.warning("queue.enqueue_failed", task=task, error=str(error))
