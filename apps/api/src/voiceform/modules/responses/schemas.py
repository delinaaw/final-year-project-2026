from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from voiceform.db.enums import InputMode, QuestionType, ResponseStatus, TranscriptStatus


class RecordingPublic(BaseModel):
    id: UUID
    audio_url: str | None
    duration_seconds: float | None
    waveform_peaks: list[float]
    transcript: str | None
    transcript_status: TranscriptStatus
    transcript_confidence: float | None

    model_config = {"from_attributes": True}


class AnswerPublic(BaseModel):
    id: UUID
    question_id: UUID
    input_mode: InputMode
    text_value: str | None
    selected_option_ids: list[str]
    value: dict[str, Any]
    was_edited: bool
    recording: RecordingPublic | None

    model_config = {"from_attributes": True}


class SubmitAnswerRequest(BaseModel):
    question_id: UUID
    input_mode: InputMode = InputMode.TEXT
    text_value: str | None = Field(default=None, max_length=5000)
    selected_option_ids: list[UUID] = Field(default_factory=list)
    value: dict[str, Any] = Field(default_factory=dict)
    was_edited: bool = False


class StartResponseRequest(BaseModel):
    respondent_email: EmailStr | None = None
    respondent_key: str | None = Field(default=None, max_length=64)
    invitation_token: str | None = None


class ResponseSession(BaseModel):
    id: UUID
    form_id: UUID
    status: ResponseStatus
    answers: list[AnswerPublic]

    model_config = {"from_attributes": True}


class ResponseDetail(BaseModel):
    id: UUID
    index: int
    total: int
    respondent_email: str | None
    submitted_at: datetime | None
    duration_seconds: int | None
    primary_input_mode: InputMode | None
    answers: list[AnswerPublic]

    model_config = {"from_attributes": True}


class OptionBreakdown(BaseModel):
    option_id: UUID | None
    label: str
    count: int
    percentage: float


class QuestionSummary(BaseModel):
    question_id: UUID
    prompt: str
    type: QuestionType
    response_count: int
    breakdown: list[OptionBreakdown]
    text_answers: list[str]
    average_rating: float | None


class ResponseOverview(BaseModel):
    form_id: UUID
    total_responses: int
    completion_rate: float
    average_duration_seconds: float | None
    summaries: list[QuestionSummary]


class SubmitFormRequest(BaseModel):
    duration_seconds: int | None = None
