import re
from datetime import UTC, datetime
from secrets import token_hex
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voiceform.core.exceptions import ValidationError
from voiceform.db.enums import FormStatus, ResponseStatus
from voiceform.db.models import Form, FormResponse, FormSettings, FormTheme, Question, User

SLUG_PATTERN = re.compile(r"[^a-z0-9]+")


def build_slug(title: str) -> str:
    base = SLUG_PATTERN.sub("-", title.lower()).strip("-")[:48] or "form"
    return f"{base}-{token_hex(3)}"


async def create_form(
    session: AsyncSession, owner: User, title: str, description: str | None
) -> Form:
    form = Form(
        owner_id=owner.id,
        title=title,
        description=description,
        slug=build_slug(title),
    )
    form.settings = FormSettings()
    form.theme = FormTheme()
    session.add(form)
    await session.flush()
    return form


async def load_form(session: AsyncSession, form_id: UUID) -> Form | None:
    result = await session.execute(
        select(Form)
        .where(Form.id == form_id)
        .options(
            selectinload(Form.questions).selectinload(Question.options),
            selectinload(Form.settings),
            selectinload(Form.theme),
        )
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def load_by_slug(session: AsyncSession, slug: str) -> Form | None:
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
    return result.scalar_one_or_none()


async def list_forms(
    session: AsyncSession, owner: User, search: str | None, status: FormStatus | None
) -> list[dict[str, object]]:
    response_count = (
        select(func.count(FormResponse.id))
        .where(
            FormResponse.form_id == Form.id,
            FormResponse.status == ResponseStatus.SUBMITTED,
        )
        .scalar_subquery()
    )
    question_count = (
        select(func.count(Question.id)).where(Question.form_id == Form.id).scalar_subquery()
    )

    stmt = (
        select(Form, response_count.label("response_count"), question_count.label("question_count"))
        .where(Form.owner_id == owner.id)
        .order_by(Form.updated_at.desc())
    )
    if search:
        stmt = stmt.where(Form.title.ilike(f"%{search}%"))
    if status:
        stmt = stmt.where(Form.status == status)

    result = await session.execute(stmt)
    return [
        {
            "id": form.id,
            "title": form.title,
            "slug": form.slug,
            "status": form.status,
            "response_count": responses,
            "question_count": questions,
            "updated_at": form.updated_at,
        }
        for form, responses, questions in result.all()
    ]


async def duplicate_form(session: AsyncSession, form: Form) -> Form:
    copy = Form(
        owner_id=form.owner_id,
        title=f"{form.title} (copy)",
        description=form.description,
        slug=build_slug(form.title),
        status=FormStatus.DRAFT,
    )
    copy.settings = FormSettings()
    copy.theme = FormTheme()
    session.add(copy)
    await session.flush()
    return copy


async def publish_form(session: AsyncSession, form: Form) -> Form:
    if not form.questions:
        raise ValidationError(message="Add at least one question before publishing")
    form.status = FormStatus.LIVE
    form.published_at = datetime.now(UTC)
    form.closed_at = None
    await session.flush()
    return form


async def close_form(session: AsyncSession, form: Form, closing_message: str | None) -> Form:
    form.status = FormStatus.CLOSED
    form.closed_at = datetime.now(UTC)
    form.closing_message = closing_message
    await session.flush()
    return form


async def reopen_form(session: AsyncSession, form: Form) -> Form:
    form.status = FormStatus.LIVE
    form.closed_at = None
    await session.flush()
    return form
