from enum import StrEnum


class AuthProvider(StrEnum):
    EMAIL = "email"
    GOOGLE = "google"
    APPLE = "apple"


class FormStatus(StrEnum):
    DRAFT = "draft"
    LIVE = "live"
    CLOSED = "closed"


class QuestionType(StrEnum):
    SHORT_ANSWER = "short_answer"
    PARAGRAPH = "paragraph"
    MULTIPLE_CHOICE = "multiple_choice"
    CHECKBOXES = "checkboxes"
    DROPDOWN = "dropdown"
    DATE = "date"
    RATING = "rating"
    FILE_UPLOAD = "file_upload"


class InputMode(StrEnum):
    VOICE = "voice"
    TEXT = "text"


class ResponseStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    ABANDONED = "abandoned"


class TranscriptStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    NOT_RECOGNISED = "not_recognised"


class AudienceType(StrEnum):
    ANYONE_WITH_LINK = "anyone_with_link"
    INVITED_ONLY = "invited_only"


class VoiceSpeed(StrEnum):
    SLOW = "slow"
    NORMAL = "normal"
    FAST = "fast"


class InvitationStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REVOKED = "revoked"
