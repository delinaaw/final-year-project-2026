from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from voiceform.core.config import settings
from voiceform.core.database import get_session
from voiceform.core.exceptions import ForbiddenError, NotFoundError, UnauthorizedError
from voiceform.core.security import decode_token
from voiceform.db.models import Form, User
from voiceform.modules.auth.clerk import verify_session_token
from voiceform.modules.auth.provisioning import user_for_claims

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def _bearer_token(request: Request) -> str:
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise UnauthorizedError()
    return token


async def _local_user(session: AsyncSession, token: str) -> User:
    try:
        payload = decode_token(token, "access")
    except jwt.PyJWTError as exc:
        raise UnauthorizedError(message="Session expired") from exc

    user = await session.get(User, UUID(payload["sub"]))
    if user is None:
        raise UnauthorizedError()
    return user


async def _clerk_user(session: AsyncSession, token: str) -> User:
    claims = verify_session_token(token)
    try:
        user = await user_for_claims(session, claims)
    except ValueError as exc:
        raise UnauthorizedError(message=str(exc)) from exc
    await session.commit()
    return user


async def get_current_user(request: Request, session: SessionDep) -> User:
    token = _bearer_token(request)

    user = (
        await _clerk_user(session, token)
        if settings.auth_provider == "clerk"
        else await _local_user(session, token)
    )

    if not user.is_active:
        raise UnauthorizedError()
    return user


async def get_verified_user(user: Annotated[User, Depends(get_current_user)]) -> User:
    if not user.is_verified:
        raise ForbiddenError(message="Verify your email to continue", code="email_unverified")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
VerifiedUser = Annotated[User, Depends(get_verified_user)]


async def get_owned_form(form_id: UUID, session: SessionDep, user: CurrentUser) -> Form:
    form = await session.get(Form, form_id)
    if form is None:
        raise NotFoundError(message="Form not found")
    if form.owner_id != user.id:
        raise ForbiddenError()
    return form


OwnedForm = Annotated[Form, Depends(get_owned_form)]
