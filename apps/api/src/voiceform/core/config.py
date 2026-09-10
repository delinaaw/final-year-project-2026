import base64
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: Literal["development", "staging", "production", "test"] = "development"
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    secret_key: SecretStr

    database_url: PostgresDsn
    redis_url: RedisDsn

    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 7
    refresh_token_ttl_days_remembered: int = 30
    verification_code_ttl_minutes: int = 15
    reset_token_ttl_minutes: int = 30

    auth_provider: Literal["local", "clerk"] = "local"
    clerk_publishable_key: str = ""
    clerk_secret_key: SecretStr = SecretStr("")
    clerk_jwks_url: str = ""

    google_client_id: str = ""
    google_client_secret: SecretStr = SecretStr("")
    apple_client_id: str = ""
    apple_team_id: str = ""
    apple_key_id: str = ""
    apple_private_key: SecretStr = SecretStr("")

    email_provider: Literal["smtp", "resend", "console"] = "smtp"
    email_from: str = "VoiceForm <noreply@voiceform.app>"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: SecretStr = SecretStr("")
    smtp_starttls: bool = True

    storage_provider: Literal["s3"] = "s3"
    s3_endpoint_url: str = ""
    s3_region: str = "auto"
    s3_bucket: str = "voiceform-media"
    s3_access_key_id: SecretStr = SecretStr("")
    s3_secret_access_key: SecretStr = SecretStr("")
    s3_public_base_url: str = ""

    stt_provider: Literal["deepgram", "whisper_local"] = "deepgram"
    deepgram_api_key: SecretStr = SecretStr("")

    tts_provider: Literal["elevenlabs", "openai"] = "elevenlabs"
    elevenlabs_api_key: SecretStr = SecretStr("")

    llm_provider: Literal["anthropic", "none"] = "anthropic"
    anthropic_api_key: SecretStr = SecretStr("")

    sentry_dsn: str = ""

    max_audio_bytes: int = 25 * 1024 * 1024
    max_upload_bytes: int = 10 * 1024 * 1024
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    @property
    def clerk_issuer(self) -> str:
        if not self.clerk_publishable_key:
            return ""
        encoded = self.clerk_publishable_key.split("_", 2)[-1]
        padded = encoded + "=" * (-len(encoded) % 4)
        host = base64.b64decode(padded).decode().rstrip("$")
        return f"https://{host}"

    @property
    def jwks_url(self) -> str:
        return self.clerk_jwks_url or f"{self.clerk_issuer}/.well-known/jwks.json"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
