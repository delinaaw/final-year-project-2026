from voiceform.core.logging import logger
from voiceform.modules.email.provider import EmailMessage


class ConsoleEmailProvider:
    async def send(self, message: EmailMessage) -> None:
        logger.info(
            "email.sent",
            to=message.to,
            subject=message.subject,
            body=message.text,
        )
