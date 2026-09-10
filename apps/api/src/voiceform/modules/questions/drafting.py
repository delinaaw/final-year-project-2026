import json
import re
from typing import Any

from anthropic import AsyncAnthropic

from voiceform.core.config import settings
from voiceform.core.exceptions import AppError
from voiceform.db.enums import QuestionType

MODEL = "claude-sonnet-5"
MAX_QUESTIONS = 12

INSTRUCTIONS = f"""You turn a spoken description of a form into questions.

Return only JSON, shaped as:
{{"questions": [{{"type": ..., "prompt": ..., "is_required": bool, "options": [...]}}]}}

Allowed types: short_answer, paragraph, multiple_choice, checkboxes, dropdown, date, rating.
Give options only for multiple_choice, checkboxes and dropdown, between two and six each.
Write prompts as a person would say them aloud.
Keep to at most {MAX_QUESTIONS} questions."""

VALID_TYPES = {t.value for t in QuestionType if t != QuestionType.FILE_UPLOAD}


def extract_json(text: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise AppError(message="Could not draft questions from that", code="drafting_failed")
    try:
        parsed: dict[str, Any] = json.loads(match.group(0))
        return parsed
    except json.JSONDecodeError as error:
        raise AppError(
            message="Could not draft questions from that", code="drafting_failed"
        ) from error


def sanitise(payload: dict[str, Any]) -> list[dict[str, Any]]:
    drafted = []

    for entry in payload.get("questions", [])[:MAX_QUESTIONS]:
        question_type = str(entry.get("type", "")).strip()
        prompt = str(entry.get("prompt", "")).strip()
        if question_type not in VALID_TYPES or not prompt:
            continue

        options = [
            {"label": str(option).strip()}
            for option in entry.get("options", [])
            if str(option).strip()
        ][:6]

        if question_type in {"multiple_choice", "checkboxes", "dropdown"} and len(options) < 2:
            question_type = "short_answer"
            options = []

        drafted.append(
            {
                "type": question_type,
                "prompt": prompt,
                "is_required": bool(entry.get("is_required", False)),
                "options": options,
            }
        )

    return drafted


async def draft_questions(transcript: str) -> list[dict[str, Any]]:
    key = settings.anthropic_api_key.get_secret_value()
    if not key:
        raise AppError(
            message="Question drafting is not configured on this server",
            code="drafting_unavailable",
        )

    client = AsyncAnthropic(api_key=key)
    message = await client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=INSTRUCTIONS,
        messages=[{"role": "user", "content": transcript}],
    )

    text = "".join(block.text for block in message.content if block.type == "text")
    drafted = sanitise(extract_json(text))

    if not drafted:
        raise AppError(message="Could not draft questions from that", code="drafting_failed")

    return drafted
