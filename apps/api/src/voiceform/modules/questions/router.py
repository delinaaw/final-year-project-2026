from uuid import UUID

from fastapi import APIRouter, status

from voiceform.api.dependencies import OwnedForm, SessionDep
from voiceform.modules.questions import service
from voiceform.modules.questions.schemas import (
    CreateQuestionRequest,
    QuestionPublic,
    ReorderQuestionsRequest,
    UpdateQuestionRequest,
)

router = APIRouter(prefix="/forms/{form_id}/questions", tags=["questions"])


@router.post("", response_model=QuestionPublic, status_code=status.HTTP_201_CREATED)
async def create_question(
    body: CreateQuestionRequest, form: OwnedForm, session: SessionDep
) -> QuestionPublic:
    question = await service.create_question(session, form.id, body)
    await session.commit()
    return QuestionPublic.model_validate(question)


@router.patch("/{question_id}", response_model=QuestionPublic)
async def update_question(
    question_id: UUID, body: UpdateQuestionRequest, form: OwnedForm, session: SessionDep
) -> QuestionPublic:
    question = await service.load_question(session, form.id, question_id)
    updated = await service.update_question(session, question, body)
    await session.commit()
    return QuestionPublic.model_validate(updated)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: UUID, form: OwnedForm, session: SessionDep) -> None:
    question = await service.load_question(session, form.id, question_id)
    await session.delete(question)
    await session.commit()


@router.post("/reorder", response_model=list[QuestionPublic])
async def reorder_questions(
    body: ReorderQuestionsRequest, form: OwnedForm, session: SessionDep
) -> list[QuestionPublic]:
    questions = await service.reorder_questions(session, form.id, body.question_ids)
    await session.commit()
    return [QuestionPublic.model_validate(q) for q in questions]
