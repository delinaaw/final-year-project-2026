from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceform.db.models import User
from voiceform.modules.auth.clerk import fetch_profile, profile_email, profile_name


async def user_for_claims(session: AsyncSession, claims: dict[str, Any]) -> User:
    clerk_user_id = str(claims.get("sub", ""))
    if not clerk_user_id:
        raise ValueError("token has no subject")

    existing = await session.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    user = existing.scalar_one_or_none()
    if user is not None:
        return user

    profile = await fetch_profile(clerk_user_id)
    email = profile_email(profile, claims)
    if not email:
        raise ValueError("no email on the Clerk account")

    by_email = await session.execute(select(User).where(User.email == email.lower()))
    user = by_email.scalar_one_or_none()

    if user is None:
        user = User(
            email=email.lower(),
            full_name=profile_name(profile, claims),
            email_verified_at=datetime.now(UTC),
        )
        session.add(user)

    user.clerk_user_id = clerk_user_id
    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(UTC)
    if avatar := profile.get("image_url"):
        user.avatar_url = avatar

    await session.flush()
    return user
