import json
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from urllib.parse import urlencode

import websockets

from voiceform.core.config import settings
from voiceform.core.logging import logger

LIVE_URL = "wss://api.deepgram.com/v1/listen"
FINALISE = json.dumps({"type": "Finalize"})
CLOSE = json.dumps({"type": "CloseStream"})


def live_url() -> str:
    query = urlencode(
        {
            "model": "nova-3",
            "interim_results": "true",
            "smart_format": "true",
            "punctuate": "true",
            "endpointing": "300",
        }
    )
    return f"{LIVE_URL}?{query}"


@asynccontextmanager
async def deepgram_socket() -> AsyncIterator[websockets.ClientConnection]:
    key = settings.deepgram_api_key.get_secret_value()
    if not key:
        raise RuntimeError("Deepgram is not configured")

    async with websockets.connect(
        live_url(),
        additional_headers={"Authorization": f"Token {key}"},
        max_size=None,
        ping_interval=5,
    ) as socket:
        yield socket


def parse_event(raw: str) -> dict[str, object] | None:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return None

    if payload.get("type") != "Results":
        return None

    alternatives = payload.get("channel", {}).get("alternatives", [])
    if not alternatives:
        return None

    transcript = alternatives[0].get("transcript", "").strip()
    if not transcript:
        return None

    return {
        "type": "final" if payload.get("is_final") else "interim",
        "text": transcript,
        "confidence": alternatives[0].get("confidence"),
    }


async def relay_to_deepgram(
    receive_audio: AsyncIterator[bytes | str],
    socket: websockets.ClientConnection,
) -> None:
    async for message in receive_audio:
        if isinstance(message, bytes):
            await socket.send(message)
        elif message == "finalize":
            await socket.send(FINALISE)
        elif message == "close":
            await socket.send(CLOSE)
            return

    await socket.send(CLOSE)


async def relay_from_deepgram(
    socket: websockets.ClientConnection,
    send_event: Callable[[dict[str, object]], Awaitable[None]],
) -> None:
    try:
        async for raw in socket:
            event = parse_event(raw if isinstance(raw, str) else raw.decode())
            if event:
                await send_event(event)
    except websockets.ConnectionClosed:
        logger.info("streaming.deepgram_closed")
