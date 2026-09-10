from fastapi import UploadFile

from voiceform.core.exceptions import ValidationError

AUDIO_MIME_TYPES = frozenset(
    {
        "audio/webm",
        "audio/ogg",
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "audio/x-wav",
        "audio/flac",
        "video/webm",
    }
)

_CHUNK = 64 * 1024


async def read_capped(upload: UploadFile, limit: int, message: str) -> bytes:
    chunks: list[bytes] = []
    total = 0

    while chunk := await upload.read(_CHUNK):
        total += len(chunk)
        if total > limit:
            raise ValidationError(message=message)
        chunks.append(chunk)

    return b"".join(chunks)


def audio_mime_type(upload: UploadFile) -> str:
    declared = (upload.content_type or "audio/webm").split(";")[0].strip().lower()
    if declared not in AUDIO_MIME_TYPES:
        raise ValidationError(message="That audio format is not supported")
    return declared
