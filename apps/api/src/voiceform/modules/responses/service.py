from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voiceform.core.exceptions import AppError, ForbiddenError, NotFoundError, ValidationError
from voiceform.db.enums import FormStatus, InputMode, ResponseStatus
from voiceform.db.models import Answer, Form, FormResponse, Question


class FormClosedError(AppError):
    status_code = 410
    code = "form_closed"
    message = "This form is no longer accepting responses"


class AlreadySubmittedError(AppError):
    status_code = 409
    code = "already_submitted"
    message = "You have already answered this form"


class LimitReachedError(AppError):
    status_code = 410
    code = "limit_reached"
    message = "This form has reached its response limit"


async def load_public_form(session: AsyncSession, slug: str) -> Form:
    result = await session.execute(
        select(Form)
        .where(Form.slug == slug)
        .options(
            selectinload(Form.questions).selectinload(Question.options),
            selectinload(Form.settings),
            selectinload(Form.theme),
        )
        .execution_options(populate_existing=True)
    )
    form = result.scalar_one_or_none()
    if form is None or form.status == FormStatus.DRAFT:
        raise NotFoundError(message="This link does not work")
    return form


async def count_submitted(session: AsyncSession, form_id: UUID) -> int:
    result = await session.execute(
        select(func.count(FormResponse.id)).where(
            FormResponse.form_id == form_id,
            FormResponse.status == ResponseStatus.SUBMITTED,
        )
    )
    return int(result.scalar_one())


async def assert_accepting(session: AsyncSession, form: Form) -> None:
    if form.status == FormStatus.CLOSED:
        raise FormClosedError()

    limit = form.settings.response_limit
    if limit is not None and await count_submitted(session, form.id) >= limit:
        raise LimitReachedError()


async def find_previous_response(
    session: AsyncSession, form_id: UUID, respondent_key: str | None
) -> FormResponse | None:
    if not respondent_key:
        return None

    result = await session.execute(
        select(FormResponse)
        .where(
            FormResponse.form_id == form_id,
            FormResponse.respondent_key == respondent_key,
        )
        .options(selectinload(FormResponse.answers).selectinload(Answer.recording))
    )
    return result.scalars().first()


async def start_response(
    session: AsyncSession,
    form: Form,
    respondent_key: str | None,
    respondent_email: str | None,
    user_agent: str | None,
) -> FormResponse:
    await assert_accepting(session, form)

    existing = await find_previous_response(session, form.id, respondent_key)
    if existing is not None:
        if existing.status == ResponseStatus.SUBMITTED:
            if form.settings.one_response_per_person:
                raise AlreadySubmittedError()
        else:
            return existing

    response = FormResponse(
        form_id=form.id,
        respondent_key=respondent_key,
        respondent_email=respondent_email,
        status=ResponseStatus.IN_PROGRESS,
        started_at=datetime.now(UTC),
        user_agent=user_agent[:255] if user_agent else None,
    )
    response.answers = []
    session.add(response)
    await session.flush()
    return response


async def load_response(session: AsyncSession, form_id: UUID, response_id: UUID) -> FormResponse:
    result = await session.execute(
        select(FormResponse)
        .where(FormResponse.id == response_id, FormResponse.form_id == form_id)
        .options(selectinload(FormResponse.answers).selectinload(Answer.recording))
    )
    response = result.scalar_one_or_none()
    if response is None:
        raise NotFoundError(message="This response no longer exists")
    if response.status == ResponseStatus.SUBMITTED:
        raise ForbiddenError(message="This response has already been submitted")
    return response


async def save_answer(
    session: AsyncSession,
    form: Form,
    response: FormResponse,
    question_id: UUID,
    input_mode: InputMode,
    text_value: str | None,
    selected_option_ids: list[UUID],
    value: dict[str, object],
    was_edited: bool,
) -> Answer:
    question = next((q for q in form.questions if q.id == question_id), None)
    if question is None:
        raise ValidationError(message="That question is not part of this form")

    valid_ids = {option.id for option in question.options}
    unknown = [str(o) for o in selected_option_ids if o not in valid_ids]
    if unknown:
        raise ValidationError(message="That option is not part of this question")

    answer = next((a for a in response.answers if a.question_id == question_id), None)
    if answer is None:
        answer = Answer(response_id=response.id, question_id=question_id, input_mode=input_mode)
        answer.recording = None
        session.add(answer)
        response.answers.append(answer)

    answer.input_mode = input_mode
    answer.text_value = text_value
    answer.selected_option_ids = [str(o) for o in selected_option_ids]
    answer.value = value
    answer.was_edited = was_edited

    await session.flush()
    return answer


def missing_required(form: Form, response: FormResponse) -> list[Question]:
    answered = {
        answer.question_id
        for answer in response.answers
        if answer.text_value or answer.selected_option_ids or answer.value
    }
    required = form.settings.all_questions_required
    return [q for q in form.questions if (required or q.is_required) and q.id not in answered]


async def submit_response(
    session: AsyncSession,
    form: Form,
    response: FormResponse,
    duration_seconds: int | None,
) -> FormResponse:
    await assert_accepting(session, form)

    outstanding = missing_required(form, response)
    if outstanding:
        raise ValidationError(
            message=f"{len(outstanding)} required question(s) still need an answer",
            code="required_missing",
        )

    modes = {answer.input_mode for answer in response.answers}
    response.status = ResponseStatus.SUBMITTED
    response.submitted_at = datetime.now(UTC)
    response.duration_seconds = duration_seconds
    response.primary_input_mode = InputMode.VOICE if InputMode.VOICE in modes else InputMode.TEXT

    await session.flush()
    return response
