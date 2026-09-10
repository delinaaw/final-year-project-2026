import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voiceform.db.base import Base, TimestampMixin, UUIDMixin
from voiceform.db.enums import InputMode, ResponseStatus, TranscriptStatus

if TYPE_CHECKING:
    from voiceform.db.models.form import Form, Question


class FormResponse(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "form_responses"
    __table_args__ = (Index("ix_form_responses_form_status", "form_id", "status"),)

    form_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), index=True
    )
    respondent_email: Mapped[str | None] = mapped_column(String(320))
    respondent_key: Mapped[str | None] = mapped_column(String(64), index=True)
    status: Mapped[ResponseStatus] = mapped_column(
        String(20), default=ResponseStatus.IN_PROGRESS, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    primary_input_mode: Mapped[InputMode | None] = mapped_column(String(10))
    user_agent: Mapped[str | None] = mapped_column(String(255))

    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="response", cascade="all, delete-orphan"
    )


class Answer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "answers"
    __table_args__ = (UniqueConstraint("response_id", "question_id"),)

    response_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("form_responses.id", ondelete="CASCADE"), index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True
    )
    input_mode: Mapped[InputMode] = mapped_column(String(10), nullable=False)
    text_value: Mapped[str | None] = mapped_column(Text)
    selected_option_ids: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    was_edited: Mapped[bool] = mapped_column(default=False, nullable=False)

    response: Mapped["FormResponse"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship()
    recording: Mapped["AudioRecording | None"] = relationship(
        back_populates="answer", cascade="all, delete-orphan", uselist=False
    )


class AudioRecording(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audio_recordings"

    answer_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("answers.id", ondelete="CASCADE"), unique=True, index=True
    )
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(80), nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    waveform_peaks: Mapped[list[float]] = mapped_column(JSONB, default=list, nullable=False)

    transcript: Mapped[str | None] = mapped_column(Text)
    transcript_status: Mapped[TranscriptStatus] = mapped_column(
        String(20), default=TranscriptStatus.PENDING, nullable=False
    )
    transcript_confidence: Mapped[float | None] = mapped_column(Float)
    transcript_provider: Mapped[str | None] = mapped_column(String(40))
    transcript_error: Mapped[str | None] = mapped_column(Text)

    answer: Mapped["Answer"] = relationship(back_populates="recording")


class FileUpload(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "file_uploads"

    answer_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("answers.id", ondelete="CASCADE"), index=True
    )
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
