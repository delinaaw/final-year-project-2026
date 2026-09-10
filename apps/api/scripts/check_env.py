import asyncio
import sys
from dataclasses import dataclass
from email.message import EmailMessage

import aioboto3
import aiosmtplib
import httpx
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from voiceform.core.config import settings
from voiceform.modules.email.smtp_provider import is_local_relay

GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
DIM = "\033[2m"
RESET = "\033[0m"


@dataclass(slots=True)
class Result:
    name: str
    ok: bool
    detail: str
    required: bool = True


async def check_database() -> Result:
    engine = create_async_engine(str(settings.database_url))
    try:
        async with engine.connect() as connection:
            version = await connection.scalar(text("SELECT version()"))
        return Result("Postgres", True, str(version).split(",")[0])
    except Exception as exc:
        return Result("Postgres", False, str(exc)[:120])
    finally:
        await engine.dispose()


async def check_redis() -> Result:
    client = Redis.from_url(str(settings.redis_url))
    try:
        await client.ping()
        info = await client.info("server")
        return Result("Redis", True, f"v{info.get('redis_version', 'unknown')}")
    except Exception as exc:
        return Result("Redis", False, str(exc)[:120])
    finally:
        await client.aclose()


async def check_storage() -> Result:
    if not settings.s3_access_key_id.get_secret_value():
        return Result("Cloudflare R2", False, "S3_ACCESS_KEY_ID is empty")

    session = aioboto3.Session()
    key = "_preflight/check.txt"
    kwargs = {
        "endpoint_url": settings.s3_endpoint_url or None,
        "region_name": settings.s3_region,
        "aws_access_key_id": settings.s3_access_key_id.get_secret_value(),
        "aws_secret_access_key": settings.s3_secret_access_key.get_secret_value(),
    }

    try:
        async with session.client("s3", **kwargs) as client:
            await client.put_object(
                Bucket=settings.s3_bucket, Key=key, Body=b"ok", ContentType="text/plain"
            )
            obj = await client.get_object(Bucket=settings.s3_bucket, Key=key)
            body = await obj["Body"].read()
            await client.delete_object(Bucket=settings.s3_bucket, Key=key)

        if body != b"ok":
            return Result("Cloudflare R2", False, "round trip returned wrong bytes")
        return Result("Cloudflare R2", True, f"put/get/delete on {settings.s3_bucket}")
    except Exception as exc:
        return Result("Cloudflare R2", False, str(exc)[:120])


async def check_smtp() -> Result:
    host, port = settings.smtp_host, settings.smtp_port
    local = is_local_relay(host)

    if not local and not settings.smtp_password.get_secret_value():
        return Result("SMTP", False, "SMTP_PASSWORD is empty")

    recipient = settings.smtp_user or "preflight@example.com"
    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = recipient
    message["Subject"] = "VoiceForm preflight"
    message.set_content("Your SMTP credentials work.")

    try:
        await aiosmtplib.send(
            message,
            hostname=host,
            port=port,
            username=None if local else (settings.smtp_user or None),
            password=None if local else (settings.smtp_password.get_secret_value() or None),
            start_tls=settings.smtp_starttls and not local,
            timeout=20,
        )
        where = "Mailpit at http://localhost:8025" if local else recipient
        return Result("SMTP", True, f"test email delivered to {where}")
    except Exception as exc:
        return Result("SMTP", False, str(exc)[:120])


async def check_deepgram() -> Result:
    key = settings.deepgram_api_key.get_secret_value()
    if not key:
        return Result("Deepgram", False, "DEEPGRAM_API_KEY is empty", required=False)

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.get(
                "https://api.deepgram.com/v1/projects",
                headers={"Authorization": f"Token {key}"},
            )
        if res.status_code == 200:
            projects = res.json().get("projects", [])
            name = projects[0]["name"] if projects else "no projects"
            return Result("Deepgram", True, f"authenticated as {name}", required=False)
        return Result("Deepgram", False, f"HTTP {res.status_code}", required=False)
    except Exception as exc:
        return Result("Deepgram", False, str(exc)[:120], required=False)


async def check_elevenlabs() -> Result:
    key = settings.elevenlabs_api_key.get_secret_value()
    if not key:
        return Result("ElevenLabs", False, "ELEVENLABS_API_KEY is empty", required=False)

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.get(
                "https://api.elevenlabs.io/v1/voices",
                headers={"xi-api-key": key},
            )
        if res.status_code == 200:
            count = len(res.json().get("voices", []))
            return Result("ElevenLabs", True, f"{count} voices available", required=False)
        if res.status_code == 401:
            return Result(
                "ElevenLabs", False, "key rejected, regenerate it at elevenlabs.io", required=False
            )
        return Result("ElevenLabs", False, f"HTTP {res.status_code}", required=False)
    except Exception as exc:
        return Result("ElevenLabs", False, str(exc)[:120], required=False)


def check_secret_key() -> Result:
    value = settings.secret_key.get_secret_value()
    if not value or value.startswith("change_me"):
        return Result("SECRET_KEY", False, "still the placeholder value")
    if len(value) < 32:
        return Result("SECRET_KEY", False, f"only {len(value)} characters, want 64")
    return Result("SECRET_KEY", True, f"{len(value)} characters")


def check_google_oauth() -> Result:
    if not settings.google_client_id or not settings.google_client_secret.get_secret_value():
        return Result("Google OAuth", False, "client id or secret is empty", required=False)
    if not settings.google_client_id.endswith(".apps.googleusercontent.com"):
        return Result("Google OAuth", False, "client id looks malformed", required=False)
    return Result("Google OAuth", True, "credentials present", required=False)


async def main() -> int:
    print(f"\n{DIM}VoiceForm preflight · {settings.app_env}{RESET}\n")

    results = [check_secret_key()]
    results.extend(
        await asyncio.gather(
            check_database(),
            check_redis(),
            check_storage(),
            check_smtp(),
            check_deepgram(),
            check_elevenlabs(),
        )
    )
    results.append(check_google_oauth())

    width = max(len(r.name) for r in results)
    for result in results:
        if result.ok:
            mark, colour = "PASS", GREEN
        elif result.required:
            mark, colour = "FAIL", RED
        else:
            mark, colour = "SKIP", YELLOW
        print(f"  {colour}{mark}{RESET}  {result.name:<{width}}  {DIM}{result.detail}{RESET}")

    blocking = [r for r in results if not r.ok and r.required]
    optional = [r for r in results if not r.ok and not r.required]

    print()
    if blocking:
        names = ", ".join(r.name for r in blocking)
        print(f"{RED}Not ready.{RESET} Fix these before starting: {names}\n")
        return 1

    if optional:
        names = ", ".join(r.name for r in optional)
        print(f"{GREEN}Ready to build.{RESET} {DIM}Needed later for voice: {names}{RESET}\n")
    else:
        print(f"{GREEN}Everything is configured.{RESET}\n")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
