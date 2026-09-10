from uuid import UUID

import jwt
from fastapi import APIRouter, BackgroundTasks, status

from voiceform.api.dependencies import CurrentUser, SessionDep
from voiceform.core.config import settings
from voiceform.core.exceptions import UnauthorizedError
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
    VerifyEmailRequest,
)
from voiceform.modules.email.service import send_template

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(
    body: SignUpRequest, session: SessionDep, background: BackgroundTasks
) -> AuthResponse:
    user = await service.register(session, body.full_name, body.email, body.password)
    code = await service.create_verification_code(session, user)
    tokens = await service.issue_tokens(session, user)

    await session.commit()

    background.add_task(
        send_template,
        to=user.email,
        subject="Verify your email",
        template="verify_email",
        context={"code": code, "ttl_minutes": settings.verification_code_ttl_minutes},
    )
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/login", response_model=AuthResponse)
async def log_in(body: LoginRequest, session: SessionDep) -> AuthResponse:
    user = await service.authenticate(session, body.email, body.password)
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


@router.post("/verify-email", response_model=UserPublic)
async def verify_email(
    body: VerifyEmailRequest, user: CurrentUser, session: SessionDep
) -> UserPublic:
    await service.consume_verification_code(session, user, body.code)
    await session.commit()
    return UserPublic.model_validate(user)


@router.post("/verify-email/resend", status_code=status.HTTP_202_ACCEPTED)
async def resend_verification(
    user: CurrentUser, session: SessionDep, background: BackgroundTasks
) -> dict[str, str]:
    code = await service.create_verification_code(session, user)
    await session.commit()

    background.add_task(
        send_template,
        to=user.email,
        subject="Verify your email",
        template="verify_email",
        context={"code": code, "ttl_minutes": settings.verification_code_ttl_minutes},
    )
    return {"status": "sent"}


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    body: ForgotPasswordRequest, session: SessionDep, background: BackgroundTasks
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
async def reset_password(
    body: ResetPasswordRequest, session: SessionDep, background: BackgroundTasks
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
