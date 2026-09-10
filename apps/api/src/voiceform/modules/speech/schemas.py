from uuid import UUID

from pydantic import BaseModel, Field

from voiceform.db.enums import TranscriptStatus, VoiceSpeed


class VoicePublic(BaseModel):
    id: str
    name: str
    preview_url: str | None


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    voice_id: str = "default"
    speed: VoiceSpeed = VoiceSpeed.NORMAL


class QuestionAudioResponse(BaseModel):
    question_id: UUID
    audio_url: str


class TranscribeResponse(BaseModel):
    answer_id: UUID
    status: TranscriptStatus
    transcript: str | None
    confidence: float | None
