import hashlib
from functools import lru_cache
from uuid import UUID

from voiceform.db.enums import VoiceSpeed
from voiceform.modules.speech.deepgram_provider import DeepgramSttProvider
from voiceform.modules.speech.elevenlabs_provider import ElevenLabsTtsProvider
from voiceform.modules.speech.provider import (
    SpeechToTextProvider,
    TextToSpeechProvider,
    Transcript,
)
from voiceform.modules.storage.service import get_storage, question_tts_key

MIN_CONFIDENCE = 0.4


@lru_cache
def get_stt() -> SpeechToTextProvider:
    return DeepgramSttProvider()


@lru_cache
def get_tts() -> TextToSpeechProvider:
    return ElevenLabsTtsProvider()


def prompt_digest(text: str, voice_id: str, speed: VoiceSpeed) -> str:
    raw = f"{text}|{voice_id}|{speed}".encode()
    return hashlib.sha256(raw).hexdigest()[:16]


def is_recognised(transcript: Transcript) -> bool:
    return bool(transcript.text.strip()) and transcript.confidence >= MIN_CONFIDENCE


async def ensure_question_audio(
    form_id: UUID,
    question_id: UUID,
    prompt: str,
    voice_id: str,
    speed: VoiceSpeed,
) -> str:
    digest = prompt_digest(prompt, voice_id, speed)
    key = question_tts_key(form_id, question_id, voice_id, digest)
    audio = await get_tts().synthesize(prompt, voice_id, speed)
    await get_storage().put(key, audio, "audio/mpeg")
    return key
