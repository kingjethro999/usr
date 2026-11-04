"""USR error model (mirrors Axios error handling)."""

from __future__ import annotations

from typing import Any, Optional

import json as _json


CREDENTIAL_KEYS = (
    "authorization",
    "cookie",
    "x-api-key",
    "proxy-authorization",
    "set-cookie",
)


def _redact(headers: Optional[dict]) -> dict:
    out: dict = {}
    for k, v in (headers or {}).items():
        out[k] = "[REDACTED]" if str(k).lower() in CREDENTIAL_KEYS else v
    return out


class UsrError(Exception):
    """Raised for network errors, non-success statuses, and bad input."""

    def __init__(
        self,
        message: str,
        *,
        code: str = "ERR_UNKNOWN",
        status: Optional[int] = None,
        config: Optional[dict] = None,
        response: Optional[dict] = None,
        request: Any = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status
        self.config = config
        self.response = response
        self.request = request

    def to_json(self) -> dict:
        resp = None
        if self.response is not None:
            r = self.response
            resp = {
                "data": r.get("data"),
                "status": r.get("status"),
                "statusText": r.get("statusText"),
                "headers": _redact(r.get("headers")),
                "config": r.get("config"),
                "request": r.get("request"),
            }
        cfg = None
        if self.config is not None:
            c = dict(self.config)
            c["headers"] = _redact(c.get("headers"))
            cfg = c
        return {
            "message": self.message,
            "name": self.__class__.__name__,
            "code": self.code,
            "status": self.status,
            "config": cfg,
            "response": resp,
            "request": self.request,
        }

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return f"{self.__class__.__name__}({self.code!r}: {self.message!r})"


def network_error(message: str, config: Optional[dict] = None, request: Any = None) -> UsrError:
    return UsrError(message, code="ERR_NETWORK", config=config, request=request)


def timeout_error(config: Optional[dict] = None, request: Any = None) -> UsrError:
    return UsrError("Request timed out", code="ETIMEDOUT", config=config, request=request)


def bad_request_error(message: str, config: Optional[dict] = None, response: Optional[dict] = None, status: Optional[int] = None) -> UsrError:
    return UsrError(message, code="ERR_BAD_REQUEST", config=config, response=response, status=status)


def bad_response_error(message: str, config: Optional[dict] = None, response: Optional[dict] = None, status: Optional[int] = None) -> UsrError:
    return UsrError(message, code="ERR_BAD_RESPONSE", config=config, response=response, status=status)


def canceled_error(config: Optional[dict] = None, request: Any = None) -> UsrError:
    return UsrError("Request canceled", code="ERR_CANCELED", config=config, request=request)


def invalid_url_error(message: str, config: Optional[dict] = None) -> UsrError:
    return UsrError(message, code="ERR_INVALID_URL", config=config)


def too_many_redirects_error(config: Optional[dict] = None, response: Optional[dict] = None, status: Optional[int] = None) -> UsrError:
    return UsrError("Too many redirects", code="ERR_TOO_MANY_REDIRECTS", config=config, response=response, status=status)


def pipe_error(message: str) -> UsrError:
    return UsrError(message, code="ERR_BAD_PIPE")
