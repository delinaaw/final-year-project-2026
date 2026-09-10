from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceform.core.config import settings
from voiceform.core.exceptions import ConflictError, UnauthorizedError, ValidationError
from voiceform.core.security import (
    create_token,
    generate_numeric_code,
    generate_url_token,
    hash_password,
    hash_token,
    verify_password,
    verify_token_hash,
)
from voiceform.db.models import RefreshToken, User, VerificationCode
from voiceform.modules.auth.schemas import TokenPair

VERIFY_PURPOSE = "verify_email"
RESET_PURPOSE = "reset_password"
MAX_CODE_ATTEMPTS = 5


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def register(session: AsyncSession, full_name: str, email: str, password: str) -> User:
    if await get_user_by_email(session, email):
        raise ConflictError(message="An account with this email already exists")

    user = User(
        email=email.lower(),
        full_name=full_name.strip(),
        password_hash=hash_password(password),
    )
    session.add(user)
    await session.flush()
    return user


async def authenticate(session: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(session, email)
    if user is None or user.password_hash is None:
        raise UnauthorizedError(message="That email and password combination is incorrect")
    if not verify_password(password, user.password_hash):
        raise UnauthorizedError(message="That email and password combination is incorrect")
    if not user.is_active:
        raise UnauthorizedError(message="This account has been disabled")
    return user


async def issue_tokens(session: AsyncSession, user: User, remember_me: bool = False) -> TokenPair:
    access_ttl = timedelta(minutes=settings.access_token_ttl_minutes)
    refresh_days = (
        settings.refresh_token_ttl_days_remembered
        if remember_me
        else settings.refresh_token_ttl_days
    )
    refresh_ttl = timedelta(days=refresh_days)

    access = create_token(user.id, "access", access_ttl)
    refresh = create_token(user.id, "refresh", refresh_ttl)

    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh),
            expires_at=datetime.now(UTC) + refresh_ttl,
        )
    )
    await session.flush()

    return TokenPair(
        access_token=access,
        refresh_token=refresh,
        expires_in=int(access_ttl.total_seconds()),
    )


async def rotate_refresh_token(session: AsyncSession, user_id: UUID, raw_token: str) -> TokenPair:
    result = await session.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(UTC),
        )
    )
    stored = next((t for t in result.scalars() if verify_token_hash(raw_token, t.token_hash)), None)
    if stored is None:
        raise UnauthorizedError(message="Session expired")

    stored.revoked_at = datetime.now(UTC)
    user = await session.get(User, user_id)
    if user is None:
        raise UnauthorizedError()
    return await issue_tokens(session, user)


async def revoke_all_tokens(session: AsyncSession, user_id: UUID) -> None:
    result = await session.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
        )
    )
    for token in result.scalars():
        token.revoked_at = datetime.now(UTC)


async def create_verification_code(session: AsyncSession, user: User) -> str:
    code = generate_numeric_code()
    session.add(
        VerificationCode(
            user_id=user.id,
            code_hash=hash_token(code),
            purpose=VERIFY_PURPOSE,
            expires_at=datetime.now(UTC)
            + timedelta(minutes=settings.verification_code_ttl_minutes),
        )
    )
    await session.flush()
    return code


async def consume_verification_code(session: AsyncSession, user: User, code: str) -> None:
    result = await session.execute(
        select(VerificationCode)
        .where(
            VerificationCode.user_id == user.id,
            VerificationCode.purpose == VERIFY_PURPOSE,
            VerificationCode.consumed_at.is_(None),
            VerificationCode.expires_at > datetime.now(UTC),
        )
        .order_by(VerificationCode.created_at.desc())
    )
    record = result.scalars().first()
    if record is None:
        raise ValidationError(message="That code has expired. Request a new one")
    if record.attempts >= MAX_CODE_ATTEMPTS:
        raise ValidationError(message="Too many attempts. Request a new code")

    record.attempts += 1
    if not verify_token_hash(code, record.code_hash):
        raise ValidationError(message="That code is not correct")

    record.consumed_at = datetime.now(UTC)
    user.email_verified_at = datetime.now(UTC)


async def create_reset_token(session: AsyncSession, user: User) -> str:
    raw = generate_url_token()
    session.add(
        VerificationCode(
            user_id=user.id,
            code_hash=hash_token(raw),
            purpose=RESET_PURPOSE,
            expires_at=datetime.now(UTC) + timedelta(minutes=settings.reset_token_ttl_minutes),
        )
    )
    await session.flush()
    return raw


async def reset_password(session: AsyncSession, raw_token: str, new_password: str) -> User:
    result = await session.execute(
        select(VerificationCode).where(
            VerificationCode.purpose == RESET_PURPOSE,
            VerificationCode.consumed_at.is_(None),
            VerificationCode.expires_at > datetime.now(UTC),
        )
    )
    record = next((r for r in result.scalars() if verify_token_hash(raw_token, r.code_hash)), None)
    if record is None:
        raise ValidationError(message="This reset link has expired. Request a new one")

    user = await session.get(User, record.user_id)
    if user is None:
        raise ValidationError(message="This reset link is no longer valid")

    user.password_hash = hash_password(new_password)
    record.consumed_at = datetime.now(UTC)
    await revoke_all_tokens(session, user.id)
    return user
