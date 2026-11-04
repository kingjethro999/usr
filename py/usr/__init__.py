"""USR: Unix Style Request — Axios with a Unix vocabulary HTTP client.

Synchronous by default. Use ``from usr import *`` safely (explicit ``__all__``;
no Python builtins are shadowed).
"""

from __future__ import annotations

from ._client import Response, UsrClient, cd, defaults, create_usr
from ._error import UsrError
from ._flags import normalize_flags, parse_flags_string, parse_flag_string
from ._pipe import PipeError, cut, grep, head, pipeable, sort, tail, tee, uniq, wc, xargs
from . import _async as aio

_client: UsrClient = create_usr()

cat = _client.cat
touch = _client.touch
mv = _client.mv
sed = _client.sed
rm = _client.rm
stat = _client.stat
man = _client.man


def request(config: dict) -> Response:
    return _client.request(config)


__all__ = [
    "cat",
    "touch",
    "mv",
    "sed",
    "rm",
    "stat",
    "man",
    "request",
    "grep",
    "head",
    "tail",
    "sort",
    "uniq",
    "cut",
    "wc",
    "tee",
    "xargs",
    "cd",
    "defaults",
    "UsrError",
    "parse_flags_string",
    "parse_flag_string",
    "normalize_flags",
    "pipeable",
    "PipeError",
    "Response",
    "AsyncResponse",
    "aio",
    "create_usr",
]

# Re-export async response type name for convenience.
from ._async import AsyncResponse  # noqa: E402
