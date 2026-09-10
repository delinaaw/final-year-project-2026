from pydantic import BaseModel, Field

from voiceform.modules.auth.schemas import PasswordMixin


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    avatar_url: str | None = None


class ChangePasswordRequest(PasswordMixin):
    current_password: str
