from email.message import EmailMessage as MimeMessage

import aiosmtplib

from voiceform.core.config import settings
from voiceform.modules.email.provider import EmailMessage

LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1", "mailpit", "mailhog"}


def is_local_relay(host: str) -> bool:
    return host in LOCAL_HOSTS


class SmtpEmailProvider:
    def __init__(self) -> None:
        self._host = settings.smtp_host
        self._port = settings.smtp_port
        self._local = is_local_relay(self._host)
        self._user = None if self._local else (settings.smtp_user or None)
        self._password = (
            None if self._local else (settings.smtp_password.get_secret_value() or None)
        )
        self._starttls = settings.smtp_starttls and not self._local
        self._sender = settings.email_from

    async def send(self, message: EmailMessage) -> None:
        mime = MimeMessage()
        mime["From"] = self._sender
        mime["To"] = message.to
        mime["Subject"] = message.subject
        mime.set_content(message.text)
        mime.add_alternative(message.html, subtype="html")

        await aiosmtplib.send(
            mime,
            hostname=self._host,
            port=self._port,
            username=self._user,
            password=self._password,
            start_tls=self._starttls,
            timeout=20,
        )
