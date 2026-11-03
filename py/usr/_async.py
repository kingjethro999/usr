"""Async companion namespace for USR (httpx.AsyncClient)."""

from __future__ import annotations

from typing import Any, Callable, Optional

import httpx

from ._config import append_query, normalize_headers, resolve_url, serialize_body, validate_status_default
from ._error import (
    UsrError,
    bad_request_error,
    canceled_error,
    invalid_url_error,
    network_error,
    timeout_error,
    too_many_redirects_error,
)
from ._pipe import PipeError, Pipeable
from ._request import NO_BODY_METHODS, METHOD_BY_COMMAND


class AsyncResponse:
    __slots__ = ("_data", "status", "status_text", "headers", "config", "request")

    def __init__(self, raw: dict) -> None:
        self._data = raw["data"]
        self.status = raw["status"]
        self.status_text = raw.get("statusText", "")
        self.headers = raw.get("headers", {})
        self.config = raw.get("config", {})
        self.request = raw.get("request")

    @property
    def data(self) -> Any:
        return self._data

    def __or__(self, stage):
        return Pipeable(stage(self._data))

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return f"AsyncResponse(status={self.status}, data={self._data!r})"


async def _adispatch(config: dict) -> dict:
    url = append_query(resolve_url(config.get("base_url"), str(config["url"])), config.get("params"))
    headers = normalize_headers({"accept": "application/json", **(config.get("headers") or {})})
    body, headers = serialize_body(config.get("data"), headers)

    timeout = config.get("timeout", 0)
    httpx_timeout = httpx.Timeout(timeout) if timeout else None
    max_redirects = config.get("max_redirects")
    follow = max_redirects is None

    async with httpx.AsyncClient(timeout=httpx_timeout, follow_redirects=follow, max_redirects=max_redirects or 20) as client:
        try:
            response = await client.request(config["method"], url, headers=headers, content=body)
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

    status = response.status_code
    validate_status = config.get("validate_status") or validate_status_default
    content_type = response.headers.get("content-type", "")
    is_json = "application/json" in content_type
    text = response.text
    try:
        import json as _json

        data = _json.loads(text) if is_json else text
    except Exception:
        data = text

    res = {
        "data": data,
        "status": status,
        "statusText": response.reason_phrase,
        "headers": dict(response.headers),
        "config": config,
        "request": response,
    }

    if not validate_status(status):
        raise bad_request_error(f"Request failed with status {status}", config, res, status=status)
    return res


class AsyncUsrClient:
    def __init__(self, base_config: Optional[dict] = None) -> None:
        self.defaults: dict = dict(base_config or {})
        self._traps: list = []

    async def cat(self, url: str, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("cat", url, None, options)

    async def touch(self, url: str, data: Any = None, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("touch", url, data, options)

    async def mv(self, url: str, data: Any = None, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("mv", url, data, options)

    async def sed(self, url: str, data: Any = None, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("sed", url, data, options)

    async def rm(self, url: str, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("rm", url, None, options)

    async def stat(self, url: str, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("stat", url, None, options)

    async def man(self, url: str, options: Optional[dict] = None) -> AsyncResponse:
        return await self._call("man", url, None, options)

    async def _call(self, method: str, url: str, data: Any, options: Optional[dict]) -> AsyncResponse:
        from ._config import merge_config

        base = merge_config(self.defaults, options or {})
        cfg = dict(base)
        cfg["url"] = url
        cfg["method"] = METHOD_BY_COMMAND[method]
        if data is not None and method not in NO_BODY_METHODS:
            cfg["data"] = data
        cfg.setdefault("validate_status", validate_status_default)

        def run_request_traps(c):
            for t in self._traps:
                if t["kind"] != "request":
                    continue
                if t.get("runWhen") and not t["runWhen"](c):
                    continue
                out = t["fn"](c)
                if out is not None:
                    c = out
            return c

        def run_response_traps(r):
            for t in self._traps:
                if t["kind"] != "response":
                    continue
                out = t["fn"](r)
                if out is not None:
                    r = out
            return r

        cfg = run_request_traps(cfg)
        raw = await _adispatch(cfg)
        raw = run_response_traps(raw)
        return AsyncResponse(raw)

    def trap(self, kind: str, fn: Callable, options: Optional[dict] = None) -> dict:
        entry = {"kind": kind, "fn": fn, "runWhen": (options or {}).get("runWhen")}
        self._traps.append(entry)
        return {"eject": lambda: self._remove(entry)}

    def untrap(self, handle: dict) -> None:
        handle["eject"]()

    def _remove(self, entry: dict) -> None:
        if entry in self._traps:
            self._traps.remove(entry)

    def cd(self, base_url: str, options: Optional[dict] = None) -> "AsyncUsrClient":
        from ._config import merge_config

        merged = merge_config(self.defaults, {**dict(options or {}), "base_url": base_url})
        client = AsyncUsrClient(merged)
        client._traps = list(self._traps)
        return client


async def cd(base_url: str, options: Optional[dict] = None) -> AsyncUsrClient:
    client = AsyncUsrClient({**dict(options or {}), "base_url": base_url})
    return client.cd(base_url, options)
