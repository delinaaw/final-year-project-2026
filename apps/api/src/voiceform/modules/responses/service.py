from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voiceform.core.exceptions import AppError, ForbiddenError, NotFoundError, ValidationError
from voiceform.db.enums import FormStatus, InputMode, QuestionType, ResponseStatus
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


async def list_responses(
    session: AsyncSession, form_id: UUID, limit: int, offset: int
) -> tuple[list[FormResponse], int]:
    total = await count_submitted(session, form_id)

    result = await session.execute(
        select(FormResponse)
        .where(
            FormResponse.form_id == form_id,
            FormResponse.status == ResponseStatus.SUBMITTED,
        )
        .options(selectinload(FormResponse.answers).selectinload(Answer.recording))
        .order_by(FormResponse.submitted_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars()), total


async def load_submitted_response(
    session: AsyncSession, form_id: UUID, response_id: UUID
) -> FormResponse:
    result = await session.execute(
        select(FormResponse)
        .where(FormResponse.id == response_id, FormResponse.form_id == form_id)
        .options(selectinload(FormResponse.answers).selectinload(Answer.recording))
    )
    response = result.scalar_one_or_none()
    if response is None:
        raise NotFoundError(message="Response not found")
    return response


async def response_position(session: AsyncSession, form_id: UUID, response_id: UUID) -> int:
    result = await session.execute(
        select(FormResponse.id)
        .where(
            FormResponse.form_id == form_id,
            FormResponse.status == ResponseStatus.SUBMITTED,
        )
        .order_by(FormResponse.submitted_at.desc())
    )
    ids = list(result.scalars())
    return ids.index(response_id) + 1 if response_id in ids else 0


def build_overview(form: Form, responses: list[FormResponse]) -> dict[str, object]:
    total = len(responses)
    durations = [r.duration_seconds for r in responses if r.duration_seconds]
    summaries = []

    for question in form.questions:
        answers = [
            answer
            for response in responses
            for answer in response.answers
            if answer.question_id == question.id
        ]
        answered = [a for a in answers if a.text_value or a.selected_option_ids or a.value]

        breakdown = []
        if question.options:
            counts: dict[str, int] = {str(o.id): 0 for o in question.options}
            for answer in answered:
                for option_id in answer.selected_option_ids:
                    if option_id in counts:
                        counts[option_id] += 1
            picked = sum(counts.values()) or 1
            breakdown = [
                {
                    "option_id": option.id,
                    "label": option.label,
                    "count": counts[str(option.id)],
                    "percentage": round(counts[str(option.id)] / picked * 100, 1),
                }
                for option in question.options
            ]

        ratings = [
            int(a.value["rating"])
            for a in answered
            if isinstance(a.value, dict) and a.value.get("rating") is not None
        ]

        if question.type == QuestionType.RATING:
            scale = int(question.config.get("scale", 5)) if question.config else 5
            breakdown = [
                {
                    "option_id": None,
                    "label": f"{score} star{'s' if score != 1 else ''}",
                    "count": ratings.count(score),
                    "percentage": round(ratings.count(score) / len(ratings) * 100, 1)
                    if ratings
                    else 0.0,
                }
                for score in range(1, scale + 1)
            ]

        summaries.append(
            {
                "question_id": question.id,
                "prompt": question.prompt,
                "type": question.type,
                "response_count": len(answered),
                "breakdown": breakdown,
                "text_answers": []
                if question.type == QuestionType.RATING
                else [a.text_value for a in answered if a.text_value and not a.selected_option_ids][
                    :50
                ],
                "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else None,
            }
        )

    return {
        "form_id": form.id,
        "total_responses": total,
        "completion_rate": 100.0 if total else 0.0,
        "average_duration_seconds": (
            round(sum(durations) / len(durations), 1) if durations else None
        ),
        "summaries": summaries,
    }


def build_csv(form: Form, responses: list[FormResponse]) -> str:
    import csv
    import io

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    labels = {str(o.id): o.label for q in form.questions for o in q.options}
    writer.writerow(
        ["Submitted", "Duration (s)", "Input mode", *[q.prompt for q in form.questions]]
    )

    for response in responses:
        by_question = {a.question_id: a for a in response.answers}
        row = [
            response.submitted_at.isoformat() if response.submitted_at else "",
            response.duration_seconds or "",
            response.primary_input_mode or "",
        ]
        for question in form.questions:
            answer = by_question.get(question.id)
            if answer is None:
                row.append("")
            elif answer.selected_option_ids:
                row.append(", ".join(labels.get(o, o) for o in answer.selected_option_ids))
            elif isinstance(answer.value, dict) and answer.value.get("rating") is not None:
                row.append(str(answer.value["rating"]))
            else:
                row.append(answer.text_value or "")
        writer.writerow(row)

    return buffer.getvalue()


async def delete_all_responses(session: AsyncSession, form_id: UUID) -> int:
    result = await session.execute(select(FormResponse).where(FormResponse.form_id == form_id))
    responses = list(result.scalars())
    for response in responses:
        await session.delete(response)
    return len(responses)
