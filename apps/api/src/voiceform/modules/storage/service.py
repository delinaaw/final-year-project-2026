from functools import lru_cache
from uuid import UUID

from voiceform.modules.storage.provider import StorageProvider
from voiceform.modules.storage.s3_provider import S3StorageProvider


@lru_cache
def get_storage() -> StorageProvider:
    return S3StorageProvider()


def answer_audio_key(form_id: UUID, response_id: UUID, answer_id: UUID, ext: str) -> str:
    return f"forms/{form_id}/responses/{response_id}/answers/{answer_id}.{ext}"


def question_tts_key(form_id: UUID, question_id: UUID, voice_id: str, digest: str) -> str:
    return f"forms/{form_id}/tts/{question_id}/{voice_id}-{digest}.mp3"


def upload_key(form_id: UUID, response_id: UUID, answer_id: UUID, filename: str) -> str:
    return f"forms/{form_id}/responses/{response_id}/uploads/{answer_id}-{filename}"


def header_image_key(form_id: UUID, digest: str) -> str:
    return f"forms/{form_id}/header/{digest}"
