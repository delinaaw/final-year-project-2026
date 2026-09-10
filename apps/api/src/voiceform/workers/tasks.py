from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import select

from voiceform.core.config import settings
from voiceform.core.database import SessionFactory
from voiceform.core.logging import logger
from voiceform.db.enums import ResponseStatus
from voiceform.db.models import (
    Form,
    FormResponse,
    FormSettings,
    RefreshToken,
    User,
    VerificationCode,
)
from voiceform.modules.email.service import send_template
from voiceform.modules.forms import service as forms_service
from voiceform.modules.responses import service as responses_service
from voiceform.modules.speech import service as speech_service
from voiceform.modules.storage.service import get_storage


async def transcribe_recording(ctx: dict[str, Any], recording_id: UUID) -> None:
    logger.info("worker.transcribe_recording", recording_id=str(recording_id))


async def pregenerate_form_audio(ctx: dict[str, Any], form_id: UUID) -> None:
    async with SessionFactory() as session:
        form = await forms_service.load_form(session, form_id)
        if form is None or not form.settings.read_questions_aloud:
            return

        for question in form.questions:
            if not question.prompt.strip():
                continue
            try:
                await speech_service.question_audio_url(
                    session, question, form.settings.voice_id, form.settings.voice_speed
                )
            except Exception as error:
                logger.warning(
                    "worker.pregenerate_failed",
                    question_id=str(question.id),
                    error=str(error),
                )

        await session.commit()

    logger.info("worker.pregenerate_form_audio", form_id=str(form_id))


async def export_responses_csv(ctx: dict[str, Any], form_id: UUID) -> str:
    async with SessionFactory() as session:
        form = await forms_service.load_form(session, form_id)
        if form is None:
            raise ValueError("form not found")

        responses, _ = await responses_service.list_responses(session, form_id, 10000, 0)
        body = responses_service.build_csv(form, responses)

    key = f"forms/{form_id}/exports/{datetime.now(UTC):%Y%m%d%H%M%S}.csv"
    await get_storage().put(key, body.encode(), "text/csv")
    logger.info("worker.export_responses_csv", form_id=str(form_id), key=key)
    return key


async def deliver_response_digests(ctx: dict[str, Any]) -> None:
    since = datetime.now(UTC) - timedelta(days=1)

    async with SessionFactory() as session:
        result = await session.execute(
            select(Form, User)
            .join(User, User.id == Form.owner_id)
            .join(FormSettings, FormSettings.form_id == Form.id)
            .where(FormSettings.notify_on_response.is_(True))
        )

        for form, owner in result.all():
            counted = await session.execute(
                select(FormResponse.id).where(
                    FormResponse.form_id == form.id,
                    FormResponse.status == ResponseStatus.SUBMITTED,
                    FormResponse.submitted_at >= since,
                )
            )
            count = len(list(counted.scalars()))
            if count == 0:
                continue

            await send_template(
                to=owner.email,
                subject=f"{count} new {'response' if count == 1 else 'responses'}",
                template="response_digest",
                context={
                    "count": count,
                    "form_title": form.title,
                    "responses_url": f"{settings.app_url}/forms/{form.id}/responses",
                },
            )
            logger.info("worker.digest_sent", form_id=str(form.id), count=count)


async def purge_expired_tokens(ctx: dict[str, Any]) -> None:
    now = datetime.now(UTC)

    async with SessionFactory() as session:
        expired_tokens = await session.execute(
            select(RefreshToken).where(RefreshToken.expires_at < now)
        )
        expired_codes = await session.execute(
            select(VerificationCode).where(VerificationCode.expires_at < now)
        )

        removed = 0
        for row in [*expired_tokens.scalars(), *expired_codes.scalars()]:
            await session.delete(row)
            removed += 1

        await session.commit()

    logger.info("worker.purge_expired_tokens", removed=removed)
