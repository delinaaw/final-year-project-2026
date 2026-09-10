from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from voiceform.db.enums import AudienceType, FormStatus, VoiceSpeed
from voiceform.modules.questions.schemas import QuestionPublic


class FormSettingsPublic(BaseModel):
    read_questions_aloud: bool
    autoplay_audio: bool
    voice_id: str
    voice_speed: VoiceSpeed
    show_live_transcription: bool
    collect_respondent_email: bool
    allow_review_and_edit: bool
    require_sign_in: bool
    one_response_per_person: bool
    audience: AudienceType
    response_limit: int | None
    show_progress_bar: bool
    shuffle_questions: bool
    all_questions_required: bool
    notify_on_response: bool

    model_config = {"from_attributes": True}


class FormSettingsUpdate(BaseModel):
    read_questions_aloud: bool | None = None
    autoplay_audio: bool | None = None
    voice_id: str | None = None
    voice_speed: VoiceSpeed | None = None
    show_live_transcription: bool | None = None
    collect_respondent_email: bool | None = None
    allow_review_and_edit: bool | None = None
    require_sign_in: bool | None = None
    one_response_per_person: bool | None = None
    audience: AudienceType | None = None
    response_limit: int | None = Field(default=None, ge=1)
    show_progress_bar: bool | None = None
    shuffle_questions: bool | None = None
    all_questions_required: bool | None = None
    notify_on_response: bool | None = None


class FormThemePublic(BaseModel):
    primary_color: str
    header_font: str
    header_size: int
    question_font: str
    question_size: int
    body_font: str
    body_size: int
    header_image_key: str | None

    model_config = {"from_attributes": True}


class FormThemeUpdate(BaseModel):
    primary_color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    header_font: str | None = None
    header_size: int | None = Field(default=None, ge=12, le=96)
    question_font: str | None = None
    question_size: int | None = Field(default=None, ge=12, le=48)
    body_font: str | None = None
    body_size: int | None = Field(default=None, ge=10, le=32)
    header_image_key: str | None = None


class FormSummary(BaseModel):
    id: UUID
    title: str
    slug: str
    status: FormStatus
    response_count: int
    question_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class FormDetail(BaseModel):
    id: UUID
    title: str
    description: str | None
    slug: str
    status: FormStatus
    published_at: datetime | None
    closed_at: datetime | None
    closing_message: str | None
    questions: list[QuestionPublic]
    settings: FormSettingsPublic
    theme: FormThemePublic
    updated_at: datetime

    model_config = {"from_attributes": True}


class CreateFormRequest(BaseModel):
    title: str = Field(default="Untitled form", max_length=255)
    description: str | None = None
    template: str | None = None


class UpdateFormRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None


class PublishFormRequest(BaseModel):
    audience: AudienceType = AudienceType.ANYONE_WITH_LINK
    read_questions_aloud: bool = True
    show_live_transcription: bool = True
    allow_review_and_edit: bool = True


class CloseResponsesRequest(BaseModel):
    closing_message: str | None = Field(default=None, max_length=500)


class InviteRequest(BaseModel):
    emails: list[EmailStr] = Field(min_length=1, max_length=50)


class PublishedFormResponse(BaseModel):
    form: FormDetail
    respondent_url: str
