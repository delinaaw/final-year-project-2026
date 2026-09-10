import io

import pytest
from fastapi import UploadFile

from voiceform.core.exceptions import ValidationError
from voiceform.core.uploads import audio_mime_type, read_capped


def upload(data: bytes, content_type: str = "audio/webm") -> UploadFile:
    return UploadFile(
        file=io.BytesIO(data), filename="clip", headers={"content-type": content_type}
    )


async def test_read_capped_returns_a_body_under_the_limit() -> None:
    assert await read_capped(upload(b"x" * 500), 1000, "too big") == b"x" * 500


async def test_read_capped_stops_before_buffering_the_whole_body() -> None:
    oversized = upload(b"x" * (5 * 1024 * 1024))
    with pytest.raises(ValidationError):
        await read_capped(oversized, 64 * 1024, "too big")


@pytest.mark.parametrize(
    "declared", ["audio/webm", "audio/ogg", "audio/webm;codecs=opus", "AUDIO/WAV"]
)
def test_supported_audio_types_are_accepted(declared: str) -> None:
    assert audio_mime_type(upload(b"", declared)).startswith(("audio/", "video/"))


@pytest.mark.parametrize("declared", ["text/html", "application/zip", "image/png"])
def test_unsupported_audio_types_are_rejected(declared: str) -> None:
    with pytest.raises(ValidationError):
        audio_mime_type(upload(b"", declared))
