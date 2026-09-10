import re
from difflib import SequenceMatcher
from uuid import UUID

from voiceform.db.enums import QuestionType
from voiceform.db.models import Question

MATCH_THRESHOLD = 0.72

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5,
}

AFFIRMATIVE = {"yes", "yeah", "yep", "sure", "correct", "definitely", "absolutely"}
NEGATIVE = {"no", "nope", "not really", "negative"}


def normalise(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", " ", text.lower()).strip()


def similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, left, right).ratio()


def score_option(spoken: str, label: str) -> float:
    if not spoken or not label:
        return 0.0
    if spoken == label:
        return 1.0
    if label in spoken or spoken in label:
        return 0.95

    label_words = set(label.split())
    spoken_words = set(spoken.split())
    if label_words and label_words <= spoken_words:
        return 0.9

    return similarity(spoken, label)


ORDINALS = {
    "one": 1,
    "first": 1,
    "two": 2,
    "second": 2,
    "three": 3,
    "third": 3,
    "four": 4,
    "fourth": 4,
    "five": 5,
    "fifth": 5,
    "six": 6,
    "sixth": 6,
    "seven": 7,
    "seventh": 7,
    "eight": 8,
    "eighth": 8,
}


def spoken_positions(spoken: str, count: int) -> list[int]:
    found: list[int] = []

    for digit in re.findall(r"\b([1-9])\b", spoken):
        position = int(digit)
        if 1 <= position <= count and position not in found:
            found.append(position)

    for word in spoken.split():
        ordinal = ORDINALS.get(word)
        if ordinal and 1 <= ordinal <= count and ordinal not in found:
            found.append(ordinal)

    return found


def match_choice(question: Question, transcript: str) -> list[UUID]:
    spoken = normalise(transcript)
    if not spoken:
        return []

    scored = [
        (score_option(spoken, normalise(option.label)), option) for option in question.options
    ]
    scored.sort(key=lambda pair: pair[0], reverse=True)

    if question.type == QuestionType.CHECKBOXES:
        if matched := [option.id for score, option in scored if score >= MATCH_THRESHOLD]:
            return matched
    else:
        best_score, best_option = scored[0] if scored else (0.0, None)
        if best_option is not None and best_score >= MATCH_THRESHOLD:
            return [best_option.id]

    labels = {normalise(option.label): option.id for option in question.options}
    if spoken.split()[0] in AFFIRMATIVE and "yes" in labels:
        return [labels["yes"]]
    if spoken.split()[0] in NEGATIVE and "no" in labels:
        return [labels["no"]]

    positions = spoken_positions(spoken, len(question.options))
    if positions:
        chosen = [question.options[position - 1].id for position in positions]
        return chosen if question.type == QuestionType.CHECKBOXES else chosen[:1]

    return []


def match_rating(transcript: str, maximum: int = 5) -> int | None:
    spoken = normalise(transcript)
    digits = re.findall(r"\b([1-9])\b", spoken)
    if digits:
        value = int(digits[0])
        return value if 1 <= value <= maximum else None

    for word, value in NUMBER_WORDS.items():
        if re.search(rf"\b{word}\b", spoken):
            return value if 1 <= value <= maximum else None

    return None


def match_answer(question: Question, transcript: str) -> tuple[list[UUID], int | None]:
    if question.type in {
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.CHECKBOXES,
        QuestionType.DROPDOWN,
    }:
        return match_choice(question, transcript), None

    if question.type == QuestionType.RATING:
        return [], match_rating(transcript)

    return [], None
