from typing import Any
from uuid import UUID

from arq import cron

from voiceform.core.logging import logger


async def transcribe_recording(ctx: dict[str, Any], recording_id: UUID) -> None:
    logger.info("worker.transcribe_recording", recording_id=str(recording_id))
    raise NotImplementedError


async def pregenerate_form_audio(ctx: dict[str, Any], form_id: UUID) -> None:
    logger.info("worker.pregenerate_form_audio", form_id=str(form_id))
    raise NotImplementedError


async def export_responses_csv(ctx: dict[str, Any], form_id: UUID) -> str:
    logger.info("worker.export_responses_csv", form_id=str(form_id))
    raise NotImplementedError


async def deliver_response_digests(ctx: dict[str, Any]) -> None:
    logger.info("worker.deliver_response_digests")
    raise NotImplementedError


@cron(hour=3, minute=0)
async def purge_expired_tokens(ctx: dict[str, Any]) -> None:
    logger.info("worker.purge_expired_tokens")
    raise NotImplementedError
