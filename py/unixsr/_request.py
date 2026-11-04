"""Command dispatch built on the transport adapter."""

from __future__ import annotations

from typing import Any, Optional

from ._adapter import dispatch
from ._config import merge_config, validate_status_default

NO_BODY_METHODS = {"cat", "rm", "stat", "man"}

METHOD_BY_COMMAND = {
    "cat": "GET",
    "touch": "POST",
    "mv": "PUT",
    "sed": "PATCH",
    "rm": "DELETE",
    "stat": "HEAD",
    "man": "OPTIONS",
}


def create_dispatcher(base_config: dict, method: str):
    def call(url: str, data: Optional[Any] = None, options: Optional[dict] = None) -> dict:
        config = merge_config(dict(base_config), options or {})
        config["url"] = url
        config["method"] = METHOD_BY_COMMAND[method]
        if data is not None and method not in NO_BODY_METHODS:
            config["data"] = data
        config.setdefault("validate_status", validate_status_default)
        return dispatch(config)

    return call


def request(config: dict) -> dict:
    return dispatch(merge_config({}, config))
