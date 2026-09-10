from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from voiceform.db.enums import (
    FormStatus,
    InputMode,
    QuestionType,
    ResponseStatus,
    TranscriptStatus,
)


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


class QuestionAudio(BaseModel):
    question_id: UUID
    audio_url: str


class VoiceAnswerResult(BaseModel):
    answer_id: UUID
    status: TranscriptStatus
    transcript: str | None
    confidence: float | None
    duration_seconds: float | None
    recognised: bool
    selected_option_ids: list[UUID] = Field(default_factory=list)
    rating: int | None = None
    needs_confirmation: bool = False


class PublicQuestionOption(BaseModel):
    id: UUID
    label: str

    model_config = {"from_attributes": True}


class PublicQuestion(BaseModel):
    id: UUID
    type: QuestionType
    prompt: str
    help_text: str | None
    position: int
    is_required: bool
    options: list[PublicQuestionOption]

    model_config = {"from_attributes": True}


class PublicFormSettings(BaseModel):
    read_questions_aloud: bool
    autoplay_audio: bool
    show_live_transcription: bool
    allow_review_and_edit: bool
    collect_respondent_email: bool
    show_progress_bar: bool
    all_questions_required: bool

    model_config = {"from_attributes": True}


class PublicFormTheme(BaseModel):
    primary_color: str

    model_config = {"from_attributes": True}


class PublicForm(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str | None
    status: FormStatus
    closing_message: str | None
    closed_at: datetime | None
    questions: list[PublicQuestion]
    settings: PublicFormSettings
    theme: PublicFormTheme

    model_config = {"from_attributes": True}
