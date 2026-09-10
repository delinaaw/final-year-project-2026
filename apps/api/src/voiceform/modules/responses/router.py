from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from voiceform.api.dependencies import OwnedForm, SessionDep
from voiceform.modules.responses.schemas import (
    AnswerPublic,
    ResponseDetail,
    ResponseOverview,
    ResponseSession,
    StartResponseRequest,
    SubmitAnswerRequest,
    SubmitFormRequest,
)

public_router = APIRouter(prefix="/public/forms/{slug}", tags=["respondent"])
router = APIRouter(prefix="/forms/{form_id}/responses", tags=["responses"])


@public_router.post("/responses", response_model=ResponseSession, status_code=201)
async def start_response(
    slug: str, body: StartResponseRequest, session: SessionDep
) -> ResponseSession:
    raise NotImplementedError


@public_router.put("/responses/{response_id}/answers", response_model=AnswerPublic)
async def save_answer(
    slug: str, response_id: UUID, body: SubmitAnswerRequest, session: SessionDep
) -> AnswerPublic:
    raise NotImplementedError


@public_router.post("/responses/{response_id}/submit", response_model=ResponseSession)
async def submit_response(
    slug: str, response_id: UUID, body: SubmitFormRequest, session: SessionDep
) -> ResponseSession:
    raise NotImplementedError


@router.get("", response_model=list[ResponseDetail])
async def list_responses(
    form: OwnedForm,
    session: SessionDep,
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[ResponseDetail]:
    raise NotImplementedError


@router.get("/overview", response_model=ResponseOverview)
async def response_overview(form: OwnedForm, session: SessionDep) -> ResponseOverview:
    raise NotImplementedError


@router.get("/export", response_class=Response)
async def export_csv(form: OwnedForm, session: SessionDep) -> Response:
    raise NotImplementedError


@router.get("/{response_id}", response_model=ResponseDetail)
async def get_response(response_id: UUID, form: OwnedForm, session: SessionDep) -> ResponseDetail:
    raise NotImplementedError


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_responses(form: OwnedForm, session: SessionDep) -> None:
    raise NotImplementedError
