import asyncio
from collections.abc import AsyncIterator
from contextlib import suppress
from uuid import UUID

from fastapi import (
    APIRouter,
    File,
    Query,
    Request,
    Response,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from voiceform.api.dependencies import OwnedForm, SessionDep
from voiceform.core.config import settings
from voiceform.core.exceptions import NotFoundError, ValidationError
from voiceform.core.logging import logger
from voiceform.db.enums import InputMode, QuestionType, TranscriptStatus
from voiceform.db.models import AudioRecording
from voiceform.modules.forms import service as forms_service
from voiceform.modules.responses import service
from voiceform.modules.responses.schemas import (
    AnswerPublic,
    PublicForm,
    QuestionAudio,
    ResponseDetail,
    ResponseOverview,
    ResponseSession,
    StartResponseRequest,
    SubmitAnswerRequest,
    SubmitFormRequest,
    VoiceAnswerResult,
)
from voiceform.modules.speech import service as speech
from voiceform.modules.speech.matching import match_answer
from voiceform.modules.speech.streaming import (
    deepgram_socket,
    relay_from_deepgram,
    relay_to_deepgram,
)
from voiceform.modules.storage.service import answer_audio_key, get_storage

public_router = APIRouter(prefix="/public/forms/{slug}", tags=["respondent"])
router = APIRouter(prefix="/forms/{form_id}/responses", tags=["responses"])


@public_router.get("", response_model=PublicForm)
async def get_public_form(slug: str, session: SessionDep) -> PublicForm:
    form = await service.load_public_form(session, slug)
    return PublicForm.model_validate(form)


@public_router.post("/responses", response_model=ResponseSession, status_code=201)
async def start_response(
    slug: str, body: StartResponseRequest, request: Request, session: SessionDep
) -> ResponseSession:
    form = await service.load_public_form(session, slug)
    response = await service.start_response(
        session,
        form,
        body.respondent_key,
        str(body.respondent_email) if body.respondent_email else None,
        request.headers.get("user-agent"),
    )
    await session.commit()
    return ResponseSession.model_validate(response)


@public_router.put("/responses/{response_id}/answers", response_model=AnswerPublic)
async def save_answer(
    slug: str, response_id: UUID, body: SubmitAnswerRequest, session: SessionDep
) -> AnswerPublic:
    form = await service.load_public_form(session, slug)
    response = await service.load_response(session, form.id, response_id)
    answer = await service.save_answer(
        session,
        form,
        response,
        body.question_id,
        body.input_mode,
        body.text_value,
        body.selected_option_ids,
        body.value,
        body.was_edited,
    )
    await session.commit()
    return AnswerPublic.model_validate(answer)


@public_router.post("/responses/{response_id}/submit", response_model=ResponseSession)
async def submit_response(
    slug: str, response_id: UUID, body: SubmitFormRequest, session: SessionDep
) -> ResponseSession:
    form = await service.load_public_form(session, slug)
    response = await service.load_response(session, form.id, response_id)
    await service.submit_response(session, form, response, body.duration_seconds)
    await session.commit()
    return ResponseSession.model_validate(response)


@public_router.get("/questions/{question_id}/audio", response_model=QuestionAudio)
async def question_audio(slug: str, question_id: UUID, session: SessionDep) -> QuestionAudio:
    form = await service.load_public_form(session, slug)
    question = next((q for q in form.questions if q.id == question_id), None)
    if question is None:
        raise ValidationError(message="That question is not part of this form")

    url = await speech.question_audio_url(
        session, question, form.settings.voice_id, form.settings.voice_speed
    )
    await session.commit()
    return QuestionAudio(question_id=question.id, audio_url=url)


@public_router.post(
    "/responses/{response_id}/answers/{question_id}/audio",
    response_model=VoiceAnswerResult,
)
async def submit_voice_answer(
    slug: str,
    response_id: UUID,
    question_id: UUID,
    session: SessionDep,
    audio: UploadFile = File(...),
) -> VoiceAnswerResult:
    form = await service.load_public_form(session, slug)
    response = await service.load_response(session, form.id, response_id)

    payload = await audio.read()
    if len(payload) > settings.max_audio_bytes:
        raise ValidationError(message="That recording is too long")
    if not payload:
        raise ValidationError(message="The recording was empty")

    mime_type = audio.content_type or "audio/webm"
    transcript = await speech.transcribe_audio(payload, mime_type)
    recognised = speech.is_recognised(transcript)

    question = next((q for q in form.questions if q.id == question_id), None)
    if question is None:
        raise ValidationError(message="That question is not part of this form")

    option_ids: list[UUID] = []
    rating: int | None = None
    if recognised:
        option_ids, rating = match_answer(question, transcript.text)

    answer = await service.save_answer(
        session,
        form,
        response,
        question_id,
        InputMode.VOICE,
        transcript.text if recognised else None,
        option_ids,
        {"rating": rating} if rating is not None else {},
        False,
    )

    key = answer_audio_key(form.id, response.id, answer.id, speech.extension_for(mime_type))
    await get_storage().put(key, payload, mime_type)

    recording = answer.recording
    if recording is None:
        recording = AudioRecording(answer_id=answer.id, storage_key=key, mime_type=mime_type)
        answer.recording = recording
        session.add(recording)

    recording.storage_key = key
    recording.mime_type = mime_type
    recording.size_bytes = len(payload)
    recording.duration_seconds = transcript.duration_seconds
    recording.transcript = transcript.text
    recording.transcript_confidence = transcript.confidence
    recording.transcript_provider = settings.stt_provider
    recording.transcript_status = (
        TranscriptStatus.COMPLETED if recognised else TranscriptStatus.NOT_RECOGNISED
    )

    await session.commit()

    expects_structured = bool(question.options) or question.type == QuestionType.RATING

    return VoiceAnswerResult(
        answer_id=answer.id,
        status=recording.transcript_status,
        transcript=transcript.text or None,
        confidence=transcript.confidence,
        duration_seconds=transcript.duration_seconds,
        recognised=recognised,
        selected_option_ids=option_ids,
        rating=rating,
        needs_confirmation=recognised and expects_structured and not option_ids and rating is None,
    )


@public_router.websocket("/transcribe/stream")
async def stream_transcription(websocket: WebSocket, slug: str) -> None:
    await websocket.accept()

    async def incoming() -> AsyncIterator[bytes | str]:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                return
            if (payload := message.get("bytes")) is not None:
                yield payload
            elif (text := message.get("text")) is not None:
                yield text

    async def send_event(event: dict[str, object]) -> None:
        with suppress(Exception):
            await websocket.send_json(event)

    try:
        async with deepgram_socket() as socket:
            sender = asyncio.create_task(relay_to_deepgram(incoming(), socket))
            reader = asyncio.create_task(relay_from_deepgram(socket, send_event))

            _, pending = await asyncio.wait({sender, reader}, return_when=asyncio.ALL_COMPLETED)
            for task in pending:
                task.cancel()
    except WebSocketDisconnect:
        logger.info("streaming.client_disconnected", slug=slug)
    except Exception as error:
        logger.warning("streaming.failed", slug=slug, error=str(error))
        with suppress(Exception):
            await websocket.send_json({"type": "error", "message": "Live transcription failed"})
    finally:
        with suppress(Exception):
            await websocket.close()


@router.get("", response_model=list[ResponseDetail])
async def list_responses(
    form: OwnedForm,
    session: SessionDep,
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[ResponseDetail]:
    responses, total = await service.list_responses(session, form.id, limit, offset)
    return [
        ResponseDetail(
            id=response.id,
            index=offset + position + 1,
            total=total,
            respondent_email=response.respondent_email,
            submitted_at=response.submitted_at,
            duration_seconds=response.duration_seconds,
            primary_input_mode=response.primary_input_mode,
            answers=[AnswerPublic.model_validate(a) for a in response.answers],
        )
        for position, response in enumerate(responses)
    ]


@router.get("/overview", response_model=ResponseOverview)
async def response_overview(form: OwnedForm, session: SessionDep) -> ResponseOverview:
    loaded = await forms_service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    responses, _ = await service.list_responses(session, form.id, 1000, 0)
    return ResponseOverview.model_validate(service.build_overview(loaded, responses))


@router.get("/export")
async def export_csv(form: OwnedForm, session: SessionDep) -> Response:
    loaded = await forms_service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    responses, _ = await service.list_responses(session, form.id, 10000, 0)
    body = service.build_csv(loaded, responses)

    return Response(
        content=body,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{loaded.slug}-responses.csv"'},
    )


@router.get("/{response_id}", response_model=ResponseDetail)
async def get_response(response_id: UUID, form: OwnedForm, session: SessionDep) -> ResponseDetail:
    response = await service.load_submitted_response(session, form.id, response_id)
    total = await service.count_submitted(session, form.id)
    position = await service.response_position(session, form.id, response_id)

    answers = []
    storage = get_storage()
    for answer in response.answers:
        payload = AnswerPublic.model_validate(answer)
        if answer.recording and payload.recording:
            payload.recording.audio_url = await storage.presign_get(
                answer.recording.storage_key, 3600
            )
        answers.append(payload)

    return ResponseDetail(
        id=response.id,
        index=position,
        total=total,
        respondent_email=response.respondent_email,
        submitted_at=response.submitted_at,
        duration_seconds=response.duration_seconds,
        primary_input_mode=response.primary_input_mode,
        answers=answers,
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_responses(form: OwnedForm, session: SessionDep) -> None:
    await service.delete_all_responses(session, form.id)
    await session.commit()
