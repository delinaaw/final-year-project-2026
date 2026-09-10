import httpx

from voiceform.core.config import settings
from voiceform.core.exceptions import AppError
from voiceform.db.enums import VoiceSpeed
from voiceform.modules.speech.provider import Voice

BASE_URL = "https://api.elevenlabs.io/v1"
MODEL = "eleven_flash_v2_5"
DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

SPEED_VALUES: dict[VoiceSpeed, float] = {
    VoiceSpeed.SLOW: 0.8,
    VoiceSpeed.NORMAL: 1.0,
    VoiceSpeed.FAST: 1.2,
}


class ElevenLabsTtsProvider:
    def __init__(self) -> None:
        self._key = settings.elevenlabs_api_key.get_secret_value()

    async def synthesize(self, text: str, voice_id: str, speed: VoiceSpeed) -> bytes:
        resolved = DEFAULT_VOICE_ID if voice_id == "default" else voice_id
        body = {
            "text": text,
            "model_id": MODEL,
            "voice_settings": {"speed": SPEED_VALUES[speed]},
        }
        headers = {"xi-api-key": self._key, "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{BASE_URL}/text-to-speech/{resolved}", headers=headers, json=body
            )

        if res.status_code >= 400:
            raise AppError(message="Speech synthesis failed", code="tts_failed")
        return res.content

    async def voices(self) -> list[Voice]:
        headers = {"xi-api-key": self._key}
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.get(f"{BASE_URL}/voices", headers=headers)

        if res.status_code >= 400:
            raise AppError(message="Could not load voices", code="tts_voices_failed")

        return [
            Voice(id=v["voice_id"], name=v["name"], preview_url=v.get("preview_url"))
            for v in res.json().get("voices", [])
        ]
