from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

PASSWORD_MIN_LENGTH = 8


class PasswordMixin(BaseModel):
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_strength(cls, value: str) -> str:
        if not any(c.isupper() for c in value):
            raise ValueError("Password needs one uppercase letter")
        if not any(c.isdigit() for c in value):
            raise ValueError("Password needs one number")
        if value.isalnum():
            raise ValueError("Password needs one symbol")
        return value


class SignUpRequest(PasswordMixin):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    accepted_terms: bool = Field(default=False)

    @field_validator("accepted_terms")
    @classmethod
    def must_accept(cls, value: bool) -> bool:
        if not value:
            raise ValueError("You must accept the Terms & Conditions")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(PasswordMixin):
    token: str


class VerifyEmailRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None
    email_verified_at: datetime | None

    model_config = {"from_attributes": True}


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    user: UserPublic
    tokens: TokenPair
