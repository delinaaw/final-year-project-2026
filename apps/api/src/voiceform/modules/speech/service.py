import hashlib
from functools import lru_cache

from sqlalchemy.ext.asyncio import AsyncSession

from voiceform.db.enums import VoiceSpeed
from voiceform.db.models import Question
from voiceform.modules.speech.deepgram_provider import DeepgramSttProvider
from voiceform.modules.speech.elevenlabs_provider import ElevenLabsTtsProvider
from voiceform.modules.speech.provider import (
    SpeechToTextProvider,
    TextToSpeechProvider,
    Transcript,
)
from voiceform.modules.storage.service import get_storage, question_tts_key

MIN_CONFIDENCE = 0.4
AUDIO_URL_TTL = 3600


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


async def question_audio_url(
    session: AsyncSession,
    question: Question,
    voice_id: str,
    speed: VoiceSpeed,
) -> str:
    digest = prompt_digest(question.prompt, voice_id, speed)
    storage = get_storage()

    if question.tts_audio_key and question.tts_audio_hash == digest:
        return await storage.presign_get(question.tts_audio_key, AUDIO_URL_TTL)

    audio = await get_tts().synthesize(question.prompt, voice_id, speed)
    key = question_tts_key(question.form_id, question.id, voice_id, digest)
    await storage.put(key, audio, "audio/mpeg")

    question.tts_audio_key = key
    question.tts_audio_hash = digest
    await session.flush()

    return await storage.presign_get(key, AUDIO_URL_TTL)


async def transcribe_audio(audio: bytes, mime_type: str) -> Transcript:
    return await get_stt().transcribe(audio, mime_type)


def extension_for(mime_type: str) -> str:
    base = mime_type.split(";")[0].strip()
    return {
        "audio/webm": "webm",
        "audio/ogg": "ogg",
        "audio/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/x-wav": "wav",
    }.get(base, "webm")
