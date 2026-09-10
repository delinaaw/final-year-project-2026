import pytest

from voiceform.db.enums import QuestionType
from voiceform.modules.speech.matching import match_choice, match_rating


class FakeOption:
    def __init__(self, label: str) -> None:
        self.label = label
        self.id = label


class FakeQuestion:
    def __init__(self, question_type: QuestionType, labels: list[str]) -> None:
        self.type = question_type
        self.options = [FakeOption(label) for label in labels]


def choose(labels: list[str], transcript: str) -> list[str]:
    return match_choice(FakeQuestion(QuestionType.MULTIPLE_CHOICE, labels), transcript)


def check(labels: list[str], transcript: str) -> list[str]:
    return match_choice(FakeQuestion(QuestionType.CHECKBOXES, labels), transcript)


@pytest.mark.parametrize(
    ("labels", "transcript", "expected"),
    [
        (["Yes", "No", "Maybe"], "yes", "Yes"),
        (["Yes", "No", "Maybe"], "no", "No"),
        (["Yes", "No", "Maybe"], "maybe", "Maybe"),
        (["Under 18", "18 to 24", "25 to 34"], "I am 25 to 34", "25 to 34"),
        (["Daily", "Weekly", "Monthly"], "weekly", "Weekly"),
    ],
)
def test_label_match_wins(labels: list[str], transcript: str, expected: str) -> None:
    assert choose(labels, transcript) == [expected]


@pytest.mark.parametrize(
    ("labels", "transcript", "expected"),
    [
        (["Yes", "No", "Maybe"], "no, I have three dogs", "No"),
        (["Red", "Green", "Blue"], "blue, like my two cars", "Blue"),
        (["Excellent", "Good", "Poor"], "poor, one of the worst", "Poor"),
        (["Student", "Teacher", "Parent"], "teacher for three years", "Teacher"),
    ],
)
def test_numbers_in_speech_do_not_override_a_label(
    labels: list[str], transcript: str, expected: str
) -> None:
    assert choose(labels, transcript) == [expected]


@pytest.mark.parametrize(
    ("transcript", "expected"),
    [("option one", "Alpha"), ("number two", "Beta"), ("the third one", "Gamma")],
)
def test_spoken_position_is_the_fallback(transcript: str, expected: str) -> None:
    assert choose(["Alpha", "Beta", "Gamma"], transcript) == [expected]


def test_affirmative_and_negative_shortcuts() -> None:
    assert choose(["Yes", "No"], "yeah definitely") == ["Yes"]
    assert choose(["Yes", "No"], "nope not really") == ["No"]


def test_checkboxes_collect_every_match() -> None:
    assert set(check(["Email", "Phone", "Post"], "email and phone")) == {"Email", "Phone"}


def test_checkboxes_fall_back_to_positions() -> None:
    assert set(check(["Alpha", "Beta", "Gamma"], "one and three")) == {"Alpha", "Gamma"}


def test_no_match_returns_empty() -> None:
    assert choose(["Alpha", "Beta"], "something else entirely") == []
    assert choose(["Alpha", "Beta"], "") == []


@pytest.mark.parametrize(
    ("transcript", "expected"),
    [("4", 4), ("five", 5), ("I would say 3", 3), ("nine", None), ("no idea", None)],
)
def test_rating_match(transcript: str, expected: int | None) -> None:
    assert match_rating(transcript, maximum=5) == expected
