from uuid import UUID

from fastapi import APIRouter, File, Form, UploadFile, WebSocket

from voiceform.api.dependencies import SessionDep
from voiceform.modules.speech.schemas import (
    QuestionAudioResponse,
    TranscribeResponse,
    VoicePublic,
)
from voiceform.modules.speech.service import get_tts

router = APIRouter(prefix="/speech", tags=["speech"])


@router.get("/voices", response_model=list[VoicePublic])
async def list_voices() -> list[VoicePublic]:
    voices = await get_tts().voices()
    return [VoicePublic(id=v.id, name=v.name, preview_url=v.preview_url) for v in voices]


@router.get("/questions/{question_id}/audio", response_model=QuestionAudioResponse)
async def question_audio(question_id: UUID, session: SessionDep) -> QuestionAudioResponse:
    raise NotImplementedError


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    session: SessionDep,
    answer_id: UUID = Form(...),
    audio: UploadFile = File(...),
) -> TranscribeResponse:
    raise NotImplementedError


@router.websocket("/stream")
async def stream_transcription(websocket: WebSocket) -> None:
    raise NotImplementedError
