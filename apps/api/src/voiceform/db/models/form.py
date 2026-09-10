import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voiceform.db.base import Base, TimestampMixin, UUIDMixin
from voiceform.db.enums import (
    AudienceType,
    FormStatus,
    InvitationStatus,
    QuestionType,
    VoiceSpeed,
)

if TYPE_CHECKING:
    from voiceform.db.models.response import FormResponse
    from voiceform.db.models.user import User


class Form(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "forms"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), default="Untitled form", nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    status: Mapped[FormStatus] = mapped_column(
        String(20), default=FormStatus.DRAFT, index=True, nullable=False
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closing_message: Mapped[str | None] = mapped_column(Text)

    owner: Mapped["User"] = relationship(back_populates="forms")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.position",
    )
    settings: Mapped["FormSettings"] = relationship(
        back_populates="form", cascade="all, delete-orphan", uselist=False
    )
    theme: Mapped["FormTheme"] = relationship(
        back_populates="form", cascade="all, delete-orphan", uselist=False
    )
    responses: Mapped[list["FormResponse"]] = relationship(
        back_populates="form", cascade="all, delete-orphan"
    )
    invitations: Mapped[list["FormInvitation"]] = relationship(
        back_populates="form", cascade="all, delete-orphan"
    )


class Question(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "questions"

    form_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[QuestionType] = mapped_column(String(30), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, default="", nullable=False)
    help_text: Mapped[str | None] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    tts_audio_key: Mapped[str | None] = mapped_column(String(512))
    tts_audio_hash: Mapped[str | None] = mapped_column(String(64))

    form: Mapped["Form"] = relationship(back_populates="questions")
    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.position",
    )


class QuestionOption(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "question_options"

    question_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), index=True
    )
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    question: Mapped["Question"] = relationship(back_populates="options")


class FormSettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "form_settings"

    form_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), unique=True, index=True
    )

    read_questions_aloud: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    autoplay_audio: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    voice_id: Mapped[str] = mapped_column(String(80), default="default", nullable=False)
    voice_speed: Mapped[VoiceSpeed] = mapped_column(
        String(10), default=VoiceSpeed.NORMAL, nullable=False
    )
    show_live_transcription: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    collect_respondent_email: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_review_and_edit: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    require_sign_in: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    one_response_per_person: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    audience: Mapped[AudienceType] = mapped_column(
        String(30), default=AudienceType.ANYONE_WITH_LINK, nullable=False
    )
    response_limit: Mapped[int | None] = mapped_column(Integer)

    show_progress_bar: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    all_questions_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    notify_on_response: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="settings")


class FormTheme(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "form_themes"

    form_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), unique=True, index=True
    )
    primary_color: Mapped[str] = mapped_column(String(9), default="#807dfe", nullable=False)
    header_font: Mapped[str] = mapped_column(String(60), default="Manrope", nullable=False)
    header_size: Mapped[int] = mapped_column(Integer, default=56, nullable=False)
    question_font: Mapped[str] = mapped_column(String(60), default="Manrope", nullable=False)
    question_size: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    body_font: Mapped[str] = mapped_column(String(60), default="Manrope", nullable=False)
    body_size: Mapped[int] = mapped_column(Integer, default=16, nullable=False)
    header_image_key: Mapped[str | None] = mapped_column(String(512))

    form: Mapped["Form"] = relationship(back_populates="theme")


class FormInvitation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "form_invitations"
    __table_args__ = (UniqueConstraint("form_id", "email"),)

    form_id: Mapped[uuid.UUID] = mapped_column(
        PgUUID(as_uuid=True), ForeignKey("forms.id", ondelete="CASCADE"), index=True
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[InvitationStatus] = mapped_column(
        String(20), default=InvitationStatus.PENDING, nullable=False
    )
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    form: Mapped["Form"] = relationship(back_populates="invitations")
