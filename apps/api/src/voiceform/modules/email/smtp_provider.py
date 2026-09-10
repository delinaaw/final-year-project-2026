from email.message import EmailMessage as MimeMessage

import aiosmtplib

from voiceform.core.config import settings
from voiceform.modules.email.provider import EmailMessage


class SmtpEmailProvider:
    def __init__(self) -> None:
        self._host = settings.smtp_host
        self._port = settings.smtp_port
        self._user = settings.smtp_user
        self._password = settings.smtp_password.get_secret_value()
        self._starttls = settings.smtp_starttls
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
            username=self._user or None,
            password=self._password or None,
            start_tls=self._starttls,
            timeout=20,
        )
