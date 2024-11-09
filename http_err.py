"""HTTP status codes
"""

__all__ = [
    "ERR_SUCCESS",
    "ERR_SUCCESS_NEW",
    "ERR_ACCEPTED",
    "ERR_NO_CONTENT",
    "ERR_INVALID",
    "ERR_UNAUTHORIZED",
    "ERR_FORBIDDEN",
    "ERR_NOT_FOUND",
    "ERR_METHOD_NOT_ALLOWED",
    "ERR_NOT_ACCEPTABLE",
    "ERR_CONFLICT",
    "ERR_GONE",
    "ERR_UNSUPPORTED_MEDIA",
    "ERR_UNPROCESSABLE",
    "ERR_TOO_MANY_REQUESTS",
    "ERR_INTERNAL_ALL",
    "ERR_NOT_IMPLEMENTED",
    "ERR_BAD_GATEWAY",
    "ERR_SERVICE_UNAVAILABLE",
    "ERR_GATEWAY_TIMEOUT"
]

ERR_SUCCESS = 200  # OK
ERR_SUCCESS_NEW = 201  # Created
ERR_ACCEPTED = 202  # Accepted
ERR_NO_CONTENT = 204  # No Content

ERR_INVALID = 400  # Bad Request
ERR_UNAUTHORIZED = 401  # Unauthorized
ERR_FORBIDDEN = 403  # Forbidden
ERR_NOT_FOUND = 404  # Not Found
ERR_METHOD_NOT_ALLOWED = 405  # Method Not Allowed
ERR_NOT_ACCEPTABLE = 406  # Not Acceptable
ERR_CONFLICT = 409  # Conflict
ERR_GONE = 410  # Gone
ERR_UNSUPPORTED_MEDIA = 415  # Unsupported Media Type
ERR_UNPROCESSABLE = 422  # Unprocessable Entity
ERR_TOO_MANY_REQUESTS = 429  # Too Many Requests

ERR_INTERNAL_ALL = 500  # Internal Server Error
ERR_NOT_IMPLEMENTED = 501  # Not Implemented
ERR_BAD_GATEWAY = 502  # Bad Gateway
ERR_SERVICE_UNAVAILABLE = 503  # Service Unavailable
ERR_GATEWAY_TIMEOUT = 504  # Gateway Timeout
