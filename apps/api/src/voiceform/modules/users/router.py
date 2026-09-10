from fastapi import APIRouter, status

from voiceform.api.dependencies import CurrentUser, SessionDep
from voiceform.core.exceptions import ValidationError
from voiceform.core.security import hash_password, verify_password
from voiceform.modules.auth.schemas import UserPublic
from voiceform.modules.auth.service import revoke_all_tokens
from voiceform.modules.users.schemas import ChangePasswordRequest, UpdateProfileRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def get_me(user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(user)


@router.patch("/me", response_model=UserPublic)
async def update_me(
    body: UpdateProfileRequest, user: CurrentUser, session: SessionDep
) -> UserPublic:
    if body.full_name is not None:
        user.full_name = body.full_name.strip()
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    await session.commit()
    return UserPublic.model_validate(user)


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: ChangePasswordRequest, user: CurrentUser, session: SessionDep
) -> None:
    if user.password_hash is None or not verify_password(body.current_password, user.password_hash):
        raise ValidationError(message="Your current password is incorrect")
    user.password_hash = hash_password(body.password)
    await revoke_all_tokens(session, user.id)
    await session.commit()
