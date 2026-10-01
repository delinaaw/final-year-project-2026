from uuid import UUID

import jwt
from fastapi import APIRouter, BackgroundTasks, Request, status

from voiceform.api.dependencies import CurrentUser, SessionDep
from voiceform.core.config import settings
from voiceform.core.exceptions import UnauthorizedError
from voiceform.core.limiter import limiter
from voiceform.core.security import decode_token
from voiceform.modules.auth import service
from voiceform.modules.auth.clerk import verify_session_token
from voiceform.modules.auth.provisioning import link_social_account
from voiceform.modules.auth.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    SignUpRequest,
    SocialExchangeRequest,
    TokenPair,
    UserPublic,
)
from voiceform.modules.email.service import send_template

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(body: SignUpRequest, session: SessionDep) -> AuthResponse:
    user = await service.register(session, body.full_name, body.email, body.password)
    tokens = await service.issue_tokens(session, user)
    await session.commit()
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/login", response_model=AuthResponse)
async def log_in(request: Request, body: LoginRequest, session: SessionDep) -> AuthResponse:
    user = await service.authenticate(
        session, body.email, body.password, request.client.host if request.client else None
    )
    tokens = await service.issue_tokens(session, user, body.remember_me)
    await session.commit()
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/social/clerk", response_model=AuthResponse)
async def exchange_social_session(body: SocialExchangeRequest, session: SessionDep) -> AuthResponse:
    claims = verify_session_token(body.token)
    user = await link_social_account(session, claims)
    tokens = await service.issue_tokens(session, user)
    await session.commit()
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshRequest, session: SessionDep) -> TokenPair:
    try:
        payload = decode_token(body.refresh_token, "refresh")
    except jwt.PyJWTError as exc:
        raise UnauthorizedError(message="Session expired") from exc
    tokens = await service.rotate_refresh_token(session, UUID(payload["sub"]), body.refresh_token)
    await session.commit()
    return tokens


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def log_out(user: CurrentUser, session: SessionDep) -> None:
    await service.revoke_all_tokens(session, user.id)
    await session.commit()


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("20/hour")
async def forgot_password(
    request: Request, body: ForgotPasswordRequest, session: SessionDep, background: BackgroundTasks
) -> dict[str, str]:
    user = await service.get_user_by_email(session, body.email)
    if user is not None:
        token = await service.create_reset_token(session, user)
        await session.commit()
        background.add_task(
            send_template,
            to=user.email,
            subject="Reset your password",
            template="reset_password",
            context={
                "reset_url": f"{settings.app_url}/reset-password?token={token}",
                "ttl_minutes": settings.reset_token_ttl_minutes,
            },
        )
    return {"status": "sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("20/hour")
async def reset_password(
    request: Request, body: ResetPasswordRequest, session: SessionDep, background: BackgroundTasks
) -> dict[str, str]:
    user = await service.reset_password(session, body.token, body.password)
    await session.commit()

    background.add_task(
        send_template,
        to=user.email,
        subject="Your password was changed",
        template="password_changed",
        context={},
    )
    return {"status": "updated"}
