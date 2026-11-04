"""Pipe stages for transforming response data (mirrors the JS implementation)."""

from __future__ import annotations

from typing import Any, Callable, Optional

from ._error import UsrError


class PipeError(UsrError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="ERR_BAD_PIPE")
        self.name = "PipeError"


def _as_array(input: Any):
    if not isinstance(input, list):
        raise PipeError("pipe stage requires an array of items")
    return input


def _is_plain_dict(v: Any) -> bool:
    return isinstance(v, dict)


def _match_item(item: Any, match: Any) -> bool:
    if callable(match):
        return bool(match(item))
    if isinstance(match, str):
        return match in __import__("json").dumps(item)
    if _is_plain_dict(match):
        if not _is_plain_dict(item):
            return False
        return all(item.get(k) == v for k, v in match.items())
    return str(item) == str(match)


def grep(match: Any):
    def stage(input: Any):
        arr = _as_array(input)
        return [item for item in arr if _match_item(item, match)]

    return stage


def head(n: int):
    def stage(input: Any):
        arr = _as_array(input)
        return arr[:n]

    return stage


def tail(n: int):
    def stage(input: Any):
        arr = _as_array(input)
        return arr[-n:] if n else []

    return stage


def sort(key: Any = None):
    def stage(input: Any):
        arr = _as_array(input)
        copy = list(arr)
        if callable(key):
            return sorted(copy, key=key)
        if isinstance(key, str):
            return sorted(copy, key=lambda item: (item is None, str((item or {}).get(key, ""))))
        return sorted(copy)

    return stage


def uniq(key: Optional[str] = None):
    def stage(input: Any):
        arr = _as_array(input)
        seen = set()
        out = []
        for item in arr:
            k = item.get(key) if (key is not None and _is_plain_dict(item)) else item
            if k in seen:
                continue
            seen.add(k)
            out.append(item)
        return out

    return stage


def cut(*fields: str):
    def stage(input: Any):
        arr = _as_array(input)
        result = []
        for item in arr:
            if not _is_plain_dict(item):
                raise PipeError("cut requires objects")
            result.append({f: item.get(f) for f in fields})
        return result

    return stage


def wc():
    def stage(input: Any):
        arr = _as_array(input)
        return len(arr)

    return stage


def tee(fn: Callable[[Any], None]):
    def stage(input: Any):
        fn(input)
        return input

    return stage


def xargs(fn: Callable[[Any], Any]):
    def stage(input: Any):
        arr = _as_array(input)
        return [fn(item) for item in arr]

    return stage


class Pipeable:
    __slots__ = ("_data",)

    def __init__(self, data: Any) -> None:
        self._data = data

    def __or__(self, stage: Callable[[Any], Any]) -> "Pipeable":
        return Pipeable(stage(self._data))

    @property
    def data(self) -> Any:
        return self._data

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return f"Pipeable({self._data!r})"


def pipeable(data: Any) -> Pipeable:
    return Pipeable(data)
