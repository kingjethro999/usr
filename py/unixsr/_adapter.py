"""HTTP transport adapter backed by httpx (synchronous)."""

from __future__ import annotations

from typing import Any, Optional

import httpx

from ._config import append_query, normalize_headers, resolve_url, serialize_body, validate_status_default
from ._error import (
    UsrError,
    bad_request_error,
    bad_response_error,
    canceled_error,
    invalid_url_error,
    network_error,
    timeout_error,
    too_many_redirects_error,
)

REDIRECT_STATUS = {301, 302, 303, 307, 308}


def _headers_obj(headers: httpx.Headers) -> dict:
    return dict(headers)


def dispatch(config: dict) -> dict:
    url = append_query(resolve_url(config.get("base_url"), str(config["url"])), config.get("params"))
    headers = normalize_headers({"accept": "application/json", **(config.get("headers") or {})})
    body, headers = serialize_body(config.get("data"), headers)

    timeout = config.get("timeout", 0)
    httpx_timeout = httpx.Timeout(timeout) if timeout else None

    max_redirects = config.get("max_redirects")
    follow = max_redirects is None

    try:
        with httpx.Client(timeout=httpx_timeout, follow_redirects=follow, max_redirects=max_redirects or 20) as client:
            response = client.request(config["method"], url, headers=headers, content=body)
    except httpx.TimeoutException as exc:
        raise timeout_error(config) from exc
    except httpx.NetworkError as exc:
        raise network_error(str(exc), config) from exc
    except httpx.TooManyRedirects as exc:
        raise too_many_redirects_error(config) from exc
    except httpx.InvalidURL as exc:
        raise invalid_url_error(str(exc), config) from exc
    except httpx.RequestError as exc:
        raise network_error(str(exc), config) from exc

    if not follow and response.status_code in REDIRECT_STATUS:
        raise too_many_redirects_error(
            config,
            response=_response_dict(response, config),
            status=response.status_code,
        )

    status = response.status_code
    validate_status = config.get("validate_status") or validate_status_default
    content_type = response.headers.get("content-type", "")
    is_json = "application/json" in content_type
    text = response.text

    try:
        data = _json_loads(text) if is_json else text
    except Exception:
        data = text

    res = {
        "data": data,
        "status": status,
        "statusText": response.reason_phrase,
        "headers": _headers_obj(response.headers),
        "config": config,
        "request": response,
    }

    if not validate_status(status):
        raise bad_request_error(f"Request failed with status {status}", config, res, status=status)

    return res


def _json_loads(text: str):
    import json as _json

    return _json.loads(text)


def _response_dict(response: httpx.Response, config: dict) -> dict:
    try:
        data = response.json()
    except Exception:
        data = response.text
    return {
        "data": data,
        "status": response.status_code,
        "statusText": response.reason_phrase,
        "headers": _headers_obj(response.headers),
        "config": config,
        "request": response,
    }
