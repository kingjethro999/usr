"""USR client: commands, scoped clients, defaults, and traps."""

from __future__ import annotations

from typing import Any, Callable, Optional

from ._adapter import dispatch
from ._config import merge_config, validate_status_default
from ._error import UsrError
from ._pipe import PipeError, Pipeable, pipeable
from ._request import NO_BODY_METHODS, create_dispatcher, request as raw_request


class Response:
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
        return f"Response(status={self.status}, data={self._data!r})"


class UsrClient:
    def __init__(self, base_config: Optional[dict] = None) -> None:
        self.defaults: dict = dict(base_config or {})
        self._traps: list = []

    # -- commands --
    def cat(self, url: str, options: Optional[dict] = None) -> Response:
        return self._call("cat", url, None, options)

    def touch(self, url: str, data: Any = None, options: Optional[dict] = None) -> Response:
        return self._call("touch", url, data, options)

    def mv(self, url: str, data: Any = None, options: Optional[dict] = None) -> Response:
        return self._call("mv", url, data, options)

    def sed(self, url: str, data: Any = None, options: Optional[dict] = None) -> Response:
        return self._call("sed", url, data, options)

    def rm(self, url: str, options: Optional[dict] = None) -> Response:
        return self._call("rm", url, None, options)

    def stat(self, url: str, options: Optional[dict] = None) -> Response:
        return self._call("stat", url, None, options)

    def man(self, url: str, options: Optional[dict] = None) -> Response:
        return self._call("man", url, None, options)

    def request(self, config: dict) -> Response:
        merged = merge_config(self.defaults, config)
        merged.setdefault("validate_status", validate_status_default)
        return Response(raw_request(merged))

    def _call(self, method: str, url: str, data: Any, options: Optional[dict]) -> Response:
        base = merge_config(self.defaults, options or {})
        call = create_dispatcher(base, method)
        raw = call(url, data)
        return Response(raw)

    # -- traps --
    def trap(self, kind: str, fn: Callable, options: Optional[dict] = None) -> dict:
        entry = {"kind": kind, "fn": fn, "runWhen": (options or {}).get("runWhen")}
        self._traps.append(entry)
        return {"eject": lambda: self._remove(entry)}

    def untrap(self, handle: dict) -> None:
        handle["eject"]()

    def _remove(self, entry: dict) -> None:
        if entry in self._traps:
            self._traps.remove(entry)

    # -- scoped client --
    def cd(self, base_url: str, options: Optional[dict] = None) -> "UsrClient":
        merged = merge_config(self.defaults, {**dict(options or {}), "base_url": base_url})
        client = UsrClient(merged)
        client._traps = list(self._traps)
        return client


def cd(base_url: str, options: Optional[dict] = None) -> UsrClient:
    client = UsrClient({**dict(options or {}), "base_url": base_url})
    return client.cd(base_url, options)


defaults: dict = {}


def create_usr() -> UsrClient:
    return UsrClient()
