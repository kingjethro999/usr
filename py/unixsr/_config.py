"""Configuration merge, validation, and URL handling."""

from __future__ import annotations

from typing import Any, Optional
from urllib.parse import urljoin, urlencode, urlparse

from ._error import invalid_url_error

FORBIDDEN_KEYS = {"__proto__", "constructor", "prototype"}

ALLOWED_SCHEMES = {"http:", "https:"}


def _is_plain_dict(v: Any) -> bool:
    return isinstance(v, dict)


def merge_config(defaults: dict, config: dict) -> dict:
    merged = dict(defaults)
    for key, value in config.items():
        if key in FORBIDDEN_KEYS:
            continue
        if key == "headers" and _is_plain_dict(merged.get("headers")) and _is_plain_dict(value):
            merged["headers"] = {**merged["headers"], **value}
            continue
        merged[key] = value
    return merged


def validate_status_default(status: int) -> bool:
    return 200 <= status < 300


def resolve_url(base_url: Optional[str], url: str) -> str:
    if not url:
        raise invalid_url_error("URL is required")
    resolved = urljoin(base_url or "", url)
    parsed = urlparse(resolved)
    if parsed.scheme not in ("http", "https"):
        raise invalid_url_error(f"Unsupported scheme: {parsed.scheme}")
    return resolved


def build_query(params: dict) -> str:
    return urlencode({k: str(v) for k, v in params.items()})


def append_query(url: str, params: Optional[dict]) -> str:
    if not params:
        return url
    qs = build_query(params)
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}{qs}"


def normalize_headers(headers: Optional[dict]) -> dict:
    out: dict = {}
    for k, v in (headers or {}).items():
        if str(k) in FORBIDDEN_KEYS:
            continue
        out[str(k)] = str(v)
    return out


def serialize_body(data: Any, headers: dict):
    if data is None:
        return None, headers
    if isinstance(data, str):
        headers.setdefault("content-type", "text/plain")
        return data, headers
    import json as _json

    headers.setdefault("content-type", "application/json")
    return _json.dumps(data), headers
