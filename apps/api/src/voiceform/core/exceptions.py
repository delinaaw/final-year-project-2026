from fastapi import HTTPException, status


class AppError(HTTPException):
    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "app_error"
    message: str = "Something went wrong"

    def __init__(self, message: str | None = None, code: str | None = None) -> None:
        super().__init__(
            status_code=self.status_code,
            detail={"code": code or self.code, "message": message or self.message},
        )


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"
    message = "Resource not found"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"
    message = "Authentication required"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"
    message = "You do not have access to this resource"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"
    message = "Resource already exists"


class ValidationError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "validation_error"
    message = "The submitted data is invalid"


class RateLimitError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "rate_limited"
    message = "Too many attempts. Try again later"
