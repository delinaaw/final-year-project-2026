from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from voiceform.db.enums import QuestionType


class QuestionOptionPublic(BaseModel):
    id: UUID
    label: str
    position: int

    model_config = {"from_attributes": True}


class QuestionOptionInput(BaseModel):
    id: UUID | None = None
    label: str = Field(min_length=1, max_length=500)


class QuestionPublic(BaseModel):
    id: UUID
    type: QuestionType
    prompt: str
    help_text: str | None
    position: int
    is_required: bool
    config: dict[str, Any]
    options: list[QuestionOptionPublic]

    model_config = {"from_attributes": True}


class CreateQuestionRequest(BaseModel):
    type: QuestionType
    prompt: str = Field(default="", max_length=2000)
    help_text: str | None = None
    is_required: bool = False
    position: int | None = None
    config: dict[str, Any] = Field(default_factory=dict)
    options: list[QuestionOptionInput] = Field(default_factory=list)


class UpdateQuestionRequest(BaseModel):
    type: QuestionType | None = None
    prompt: str | None = Field(default=None, max_length=2000)
    help_text: str | None = None
    is_required: bool | None = None
    config: dict[str, Any] | None = None
    options: list[QuestionOptionInput] | None = None


class ReorderQuestionsRequest(BaseModel):
    question_ids: list[UUID] = Field(min_length=1)


class DictateQuestionsRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=10000)
