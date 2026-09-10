from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voiceform.core.exceptions import NotFoundError, ValidationError
from voiceform.db.enums import QuestionType
from voiceform.db.models import Question, QuestionOption
from voiceform.modules.questions.schemas import (
    CreateQuestionRequest,
    QuestionOptionInput,
    UpdateQuestionRequest,
)

CHOICE_TYPES = {
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.CHECKBOXES,
    QuestionType.DROPDOWN,
}


async def next_position(session: AsyncSession, form_id: UUID) -> int:
    result = await session.execute(
        select(func.coalesce(func.max(Question.position), -1)).where(Question.form_id == form_id)
    )
    return int(result.scalar_one()) + 1


async def load_question(session: AsyncSession, form_id: UUID, question_id: UUID) -> Question:
    result = await session.execute(
        select(Question)
        .where(Question.id == question_id, Question.form_id == form_id)
        .options(selectinload(Question.options))
    )
    question = result.scalar_one_or_none()
    if question is None:
        raise NotFoundError(message="Question not found")
    return question


def _sync_options(question: Question, options: list[QuestionOptionInput]) -> None:
    if question.type not in CHOICE_TYPES:
        question.options.clear()
        return
    if not options:
        raise ValidationError(message="This question type needs at least one option")

    existing = {option.id: option for option in question.options}
    kept: list[QuestionOption] = []

    for index, payload in enumerate(options):
        if payload.id and payload.id in existing:
            option = existing[payload.id]
            option.label = payload.label
            option.position = index
        else:
            option = QuestionOption(label=payload.label, position=index)
        kept.append(option)

    question.options[:] = kept


async def create_question(
    session: AsyncSession, form_id: UUID, body: CreateQuestionRequest
) -> Question:
    position = body.position if body.position is not None else await next_position(session, form_id)
    question = Question(
        form_id=form_id,
        type=body.type,
        prompt=body.prompt,
        help_text=body.help_text,
        is_required=body.is_required,
        position=position,
        config=body.config,
    )
    _sync_options(question, body.options)
    session.add(question)
    await session.flush()
    return question


async def update_question(
    session: AsyncSession, question: Question, body: UpdateQuestionRequest
) -> Question:
    data = body.model_dump(exclude_unset=True, exclude={"options"})
    for field, value in data.items():
        setattr(question, field, value)

    if body.options is not None or "type" in data:
        _sync_options(question, body.options or [])

    question.tts_audio_key = None
    question.tts_audio_hash = None
    await session.flush()
    return question


async def reorder_questions(
    session: AsyncSession, form_id: UUID, ordered_ids: list[UUID]
) -> list[Question]:
    result = await session.execute(select(Question).where(Question.form_id == form_id))
    questions = {question.id: question for question in result.scalars()}

    if set(questions) != set(ordered_ids):
        raise ValidationError(message="Question list does not match this form")

    for index, question_id in enumerate(ordered_ids):
        questions[question_id].position = index

    await session.flush()
    return sorted(questions.values(), key=lambda q: q.position)
