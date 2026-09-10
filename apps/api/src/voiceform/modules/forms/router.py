from hashlib import sha256

from fastapi import APIRouter, BackgroundTasks, File, Query, UploadFile, status

from voiceform.api.dependencies import CurrentUser, OwnedForm, SessionDep
from voiceform.core.config import settings
from voiceform.core.exceptions import NotFoundError, ValidationError
from voiceform.db.enums import FormStatus
from voiceform.modules.email.service import send_template
from voiceform.modules.forms import service
from voiceform.modules.forms.schemas import (
    CloseResponsesRequest,
    CreateFormRequest,
    FormDetail,
    FormSettingsPublic,
    FormSettingsUpdate,
    FormSummary,
    FormThemePublic,
    FormThemeUpdate,
    InviteRequest,
    PublishedFormResponse,
    PublishFormRequest,
    UpdateFormRequest,
)
from voiceform.modules.storage.service import get_storage, header_image_key

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get("", response_model=list[FormSummary])
async def list_forms(
    user: CurrentUser,
    session: SessionDep,
    search: str | None = Query(default=None),
    status_filter: FormStatus | None = Query(default=None, alias="status"),
) -> list[FormSummary]:
    rows = await service.list_forms(session, user, search, status_filter)
    return [FormSummary.model_validate(row) for row in rows]


@router.post("", response_model=FormDetail, status_code=status.HTTP_201_CREATED)
async def create_form(
    body: CreateFormRequest, user: CurrentUser, session: SessionDep
) -> FormDetail:
    form = await service.create_form(session, user, body.title, body.description)
    loaded = await service.load_form(session, form.id)
    await session.commit()
    return FormDetail.model_validate(loaded)


@router.get("/{form_id}", response_model=FormDetail)
async def get_form(form: OwnedForm, session: SessionDep) -> FormDetail:
    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    return FormDetail.model_validate(loaded)


@router.patch("/{form_id}", response_model=FormDetail)
async def update_form(body: UpdateFormRequest, form: OwnedForm, session: SessionDep) -> FormDetail:
    if body.title is not None:
        form.title = body.title
    if body.description is not None:
        form.description = body.description
    loaded = await service.load_form(session, form.id)
    await session.commit()
    return FormDetail.model_validate(loaded)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(form: OwnedForm, session: SessionDep) -> None:
    await session.delete(form)
    await session.commit()


@router.post("/{form_id}/duplicate", response_model=FormDetail, status_code=201)
async def duplicate_form(form: OwnedForm, session: SessionDep) -> FormDetail:
    copy = await service.duplicate_form(session, form)
    loaded = await service.load_form(session, copy.id)
    await session.commit()
    return FormDetail.model_validate(loaded)


@router.post("/{form_id}/publish", response_model=PublishedFormResponse)
async def publish_form(
    body: PublishFormRequest, form: OwnedForm, session: SessionDep
) -> PublishedFormResponse:
    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()

    loaded.settings.audience = body.audience
    loaded.settings.read_questions_aloud = body.read_questions_aloud
    loaded.settings.show_live_transcription = body.show_live_transcription
    loaded.settings.allow_review_and_edit = body.allow_review_and_edit

    await service.publish_form(session, loaded)
    await session.commit()
    return PublishedFormResponse(
        form=FormDetail.model_validate(loaded),
        respondent_url=f"{settings.app_url}/f/{loaded.slug}",
    )


@router.post("/{form_id}/close", response_model=FormDetail)
async def close_responses(
    body: CloseResponsesRequest, form: OwnedForm, session: SessionDep
) -> FormDetail:
    await service.close_form(session, form, body.closing_message)
    loaded = await service.load_form(session, form.id)
    await session.commit()
    return FormDetail.model_validate(loaded)


@router.post("/{form_id}/reopen", response_model=FormDetail)
async def reopen_responses(form: OwnedForm, session: SessionDep) -> FormDetail:
    await service.reopen_form(session, form)
    loaded = await service.load_form(session, form.id)
    await session.commit()
    return FormDetail.model_validate(loaded)


@router.patch("/{form_id}/settings", response_model=FormSettingsPublic)
async def update_settings(
    body: FormSettingsUpdate, form: OwnedForm, session: SessionDep
) -> FormSettingsPublic:
    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(loaded.settings, field, value)
    await session.commit()
    return FormSettingsPublic.model_validate(loaded.settings)


@router.patch("/{form_id}/theme", response_model=FormThemePublic)
async def update_theme(
    body: FormThemeUpdate, form: OwnedForm, session: SessionDep
) -> FormThemePublic:
    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(loaded.theme, field, value)
    await session.commit()
    return FormThemePublic.model_validate(loaded.theme)


@router.post("/{form_id}/theme/header", response_model=FormThemePublic)
async def upload_header_image(
    form: OwnedForm,
    session: SessionDep,
    image: UploadFile = File(...),
) -> FormThemePublic:
    allowed = {"image/png", "image/jpeg", "image/webp"}
    if image.content_type not in allowed:
        raise ValidationError(message="Header images must be PNG, JPG or WebP")

    payload = await image.read()
    if len(payload) > settings.max_upload_bytes:
        raise ValidationError(message="That image is larger than 10 MB")

    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()

    digest = sha256(payload).hexdigest()[:16]
    key = header_image_key(form.id, digest)
    await get_storage().put(key, payload, image.content_type)

    loaded.theme.header_image_key = key
    await session.commit()
    return FormThemePublic.model_validate(loaded.theme)


@router.delete("/{form_id}/theme/header", response_model=FormThemePublic)
async def remove_header_image(form: OwnedForm, session: SessionDep) -> FormThemePublic:
    loaded = await service.load_form(session, form.id)
    if loaded is None:
        raise NotFoundError()
    loaded.theme.header_image_key = None
    await session.commit()
    return FormThemePublic.model_validate(loaded.theme)


@router.get("/{form_id}/theme/header", response_model=dict[str, str | None])
async def header_image_url(form: OwnedForm, session: SessionDep) -> dict[str, str | None]:
    loaded = await service.load_form(session, form.id)
    key = loaded.theme.header_image_key if loaded else None
    url = await get_storage().presign_get(key, 3600) if key else None
    return {"url": url}


@router.post("/{form_id}/invitations", status_code=status.HTTP_202_ACCEPTED)
async def invite_respondents(
    body: InviteRequest,
    form: OwnedForm,
    user: CurrentUser,
    background: BackgroundTasks,
) -> dict[str, int]:
    for email in body.emails:
        background.add_task(
            send_template,
            to=str(email),
            subject=f"{user.full_name} invited you to answer a form",
            template="form_invitation",
            context={
                "inviter_name": user.full_name,
                "form_title": form.title,
                "form_url": f"{settings.app_url}/f/{form.slug}",
            },
        )
    return {"sent": len(body.emails)}
