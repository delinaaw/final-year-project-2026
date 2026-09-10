from fastapi import APIRouter

from voiceform.modules.speech.schemas import VoicePublic
from voiceform.modules.speech.service import get_tts

router = APIRouter(prefix="/speech", tags=["speech"])


@router.get("/voices", response_model=list[VoicePublic])
async def list_voices() -> list[VoicePublic]:
    voices = await get_tts().voices()
    return [VoicePublic(id=v.id, name=v.name, preview_url=v.preview_url) for v in voices]
