from typing import Protocol


class EmailMessage:
    def __init__(self, to: str, subject: str, html: str, text: str) -> None:
        self.to = to
        self.subject = subject
        self.html = html
        self.text = text


class EmailProvider(Protocol):
    async def send(self, message: EmailMessage) -> None: ...
