from functools import lru_cache
from typing import Any

from voiceform.core.config import settings
from voiceform.modules.email.console_provider import ConsoleEmailProvider
from voiceform.modules.email.provider import EmailMessage, EmailProvider
from voiceform.modules.email.renderer import render
from voiceform.modules.email.smtp_provider import SmtpEmailProvider


@lru_cache
def get_provider() -> EmailProvider:
    if settings.email_provider == "console":
        return ConsoleEmailProvider()
    return SmtpEmailProvider()


async def send_template(to: str, subject: str, template: str, context: dict[str, Any]) -> None:
    html, text = render(template, {**context, "app_url": settings.app_url})
    await get_provider().send(EmailMessage(to=to, subject=subject, html=html, text=text))
