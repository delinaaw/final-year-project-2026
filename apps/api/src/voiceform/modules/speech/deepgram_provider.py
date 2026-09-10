from collections.abc import AsyncIterator

import httpx

from voiceform.core.config import settings
from voiceform.core.exceptions import AppError
from voiceform.modules.speech.provider import PartialTranscript, Transcript

BASE_URL = "https://api.deepgram.com/v1/listen"
MODEL = "nova-3"


class DeepgramSttProvider:
    def __init__(self) -> None:
        self._key = settings.deepgram_api_key.get_secret_value()

    async def transcribe(self, audio: bytes, mime_type: str) -> Transcript:
        params = {"model": MODEL, "smart_format": "true", "punctuate": "true"}
        headers = {"Authorization": f"Token {self._key}", "Content-Type": mime_type}

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(BASE_URL, params=params, headers=headers, content=audio)

        if res.status_code >= 400:
            raise AppError(message="Transcription failed", code="stt_failed")

        payload = res.json()
        alternatives = payload["results"]["channels"][0]["alternatives"]
        if not alternatives:
            return Transcript(text="", confidence=0.0)

        best = alternatives[0]
        return Transcript(
            text=best.get("transcript", ""),
            confidence=float(best.get("confidence", 0.0)),
            duration_seconds=payload.get("metadata", {}).get("duration"),
        )

    async def stream(
        self, chunks: AsyncIterator[bytes], mime_type: str
    ) -> AsyncIterator[PartialTranscript]:
        raise NotImplementedError
