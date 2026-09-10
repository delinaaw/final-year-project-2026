import time
from typing import Any

import httpx
import jwt
from jwt import PyJWKClient

from voiceform.core.config import settings
from voiceform.core.exceptions import UnauthorizedError

_jwk_client: PyJWKClient | None = None
_client_built_at = 0.0
JWKS_TTL_SECONDS = 3600


def jwk_client() -> PyJWKClient:
    global _jwk_client, _client_built_at

    expired = time.time() - _client_built_at > JWKS_TTL_SECONDS
    if _jwk_client is None or expired:
        if not settings.jwks_url.startswith("https://"):
            raise UnauthorizedError(message="Clerk is not configured on this server")
        _jwk_client = PyJWKClient(settings.jwks_url, cache_keys=True)
        _client_built_at = time.time()

    return _jwk_client


def verify_session_token(token: str) -> dict[str, Any]:
    try:
        signing_key = jwk_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer or None,
            options={"verify_aud": False},
        )
    except jwt.PyJWTError as error:
        raise UnauthorizedError(message="Session expired") from error


async def fetch_profile(clerk_user_id: str) -> dict[str, Any]:
    secret = settings.clerk_secret_key.get_secret_value()
    if not secret:
        return {}

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"https://api.clerk.com/v1/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {secret}"},
        )

    if response.status_code >= 400:
        return {}
    return response.json()


def profile_email(profile: dict[str, Any], claims: dict[str, Any]) -> str | None:
    if email := claims.get("email"):
        return str(email)

    primary = profile.get("primary_email_address_id")
    for address in profile.get("email_addresses", []):
        if address.get("id") == primary:
            return address.get("email_address")

    addresses = profile.get("email_addresses", [])
    return addresses[0].get("email_address") if addresses else None


def profile_name(profile: dict[str, Any], claims: dict[str, Any]) -> str:
    for key in ("name", "full_name"):
        if value := claims.get(key):
            return str(value)

    parts = [profile.get("first_name"), profile.get("last_name")]
    joined = " ".join(part for part in parts if part)
    return joined or profile.get("username") or "There"
