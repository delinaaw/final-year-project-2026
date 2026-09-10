from dataclasses import dataclass
from typing import Protocol

from voiceform.db.enums import VoiceSpeed


@dataclass(slots=True)
class Transcript:
    text: str
    confidence: float
    duration_seconds: float | None = None


@dataclass(slots=True)
class Voice:
    id: str
    name: str
    preview_url: str | None = None


class SpeechToTextProvider(Protocol):
    async def transcribe(self, audio: bytes, mime_type: str) -> Transcript: ...


class TextToSpeechProvider(Protocol):
    async def synthesize(self, text: str, voice_id: str, speed: VoiceSpeed) -> bytes: ...
    async def voices(self) -> list[Voice]: ...
