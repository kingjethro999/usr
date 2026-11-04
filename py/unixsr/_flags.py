"""Flag parsing: structured dict and command-line string forms."""

from __future__ import annotations

from typing import Any

FLAG_MAP = {
    "-H": "header",
    "--header": "header",
    "-d": "data",
    "--data": "data",
    "-u": "user",
    "--user": "user",
    "-m": "max-time",
    "--max-time": "max-time",
    "-L": "location",
    "--location": "location",
    "-o": "output",
    "--output": "output",
    "-s": "silent",
    "--silent": "silent",
    "-v": "verbose",
    "--verbose": "verbose",
    "-q": "query",
    "--query": "query",
    "--ok": "ok",
}


def _tokenize(input: str):
    i = 0
    n = len(input)
    while i < n:
        ch = input[i]
        if ch.isspace():
            i += 1
            continue
        if ch in ("'", '"'):
            quote = ch
            i += 1
            buf = []
            while i < n and input[i] != quote:
                if input[i] == "\\" and i + 1 < n:
                    buf.append(input[i + 1])
                    i += 2
                    continue
                buf.append(input[i])
                i += 1
            if i < n:
                i += 1
            yield "".join(buf)
            continue
        if ch == "\\":
            buf = []
            while i < n and not input[i].isspace() and input[i] not in ("'", '"'):
                if input[i] == "\\" and i + 1 < n:
                    buf.append(input[i + 1])
                    i += 2
                    continue
                buf.append(input[i])
                i += 1
            yield "".join(buf)
            continue
        buf = []
        while i < n and not input[i].isspace() and input[i] not in ("'", '"'):
            if input[i] == "\\" and i + 1 < n:
                buf.append(input[i + 1])
                i += 2
                continue
            buf.append(input[i])
            i += 1
        yield "".join(buf)


def parse_flags_string(input: str) -> dict:
    """Parse a curl-like flag string into a curl-key options dict. No shell invocation."""
    tokens = list(_tokenize(input))
    flags: dict = {}
    headers: list = []
    queries: list = []
    url = ""

    i = 0
    while i < len(tokens):
        tok = tokens[i]
        mapped = FLAG_MAP.get(tok)
        if mapped is None:
            if not url:
                url = tok
                i += 1
                continue
            raise ValueError(f"Unexpected token: {tok}")
        if mapped == "ok":
            flags["ok"] = True
            i += 1
            continue
        if mapped in ("silent", "verbose", "location"):
            flags[mapped] = True
            i += 1
            continue
        if i + 1 >= len(tokens):
            raise ValueError(f"Missing value for flag {tok}")
        val = tokens[i + 1]
        i += 2
        if mapped == "header":
            headers.append(val)
        elif mapped == "query":
            queries.append(val)
        elif mapped == "user":
            parts = val.split(":", 1)
            flags["user"] = {"username": parts[0], "password": parts[1] if len(parts) > 1 else ""}
        elif mapped == "max-time":
            try:
                flags["max-time"] = float(val)
            except ValueError:
                flags["max-time"] = val
        elif mapped == "data":
            flags["data"] = val
        elif mapped == "output":
            flags["output"] = val

    if headers:
        h = {}
        for hdr in headers:
            idx = hdr.find(":")
            if idx == -1:
                raise ValueError(f"Invalid header: {hdr}")
            h[hdr[:idx].strip()] = hdr[idx + 1 :].strip()
        flags["header"] = h
        flags["headers"] = h
    if queries:
        p = {}
        for q in queries:
            idx = q.find("=")
            if idx == -1:
                p[q] = ""
            else:
                p[q[:idx]] = q[idx + 1 :]
        flags["query"] = p
        flags["params"] = p
    if "max-time" in flags:
        flags["timeout"] = flags["max-time"]
    if url:
        flags["url"] = url
    return flags


def normalize_flags(flags: dict) -> dict:
    """Convert curl-key flags into an internal request config dict."""
    cfg: dict[str, Any] = {}
    if "url" in flags:
        cfg["url"] = flags.pop("url")
    if "header" in flags or "H" in flags:
        raw = flags.get("header") or flags.get("H")
        h: dict = {}
        if isinstance(raw, dict):
            h = dict(raw)
        elif isinstance(raw, (list, tuple)):
            for hdr in raw:
                idx = str(hdr).find(":")
                if idx == -1:
                    raise ValueError(f"Invalid header: {hdr}")
                h[str(hdr)[:idx].strip()] = str(hdr)[idx + 1 :].strip()
        elif isinstance(raw, str):
            idx = raw.find(":")
            if idx == -1:
                raise ValueError(f"Invalid header: {raw}")
            h[raw[:idx].strip()] = raw[idx + 1 :].strip()
        cfg["headers"] = h
    if "query" in flags or "q" in flags:
        raw = flags.get("query") or flags.get("q")
        p: dict = {}
        if isinstance(raw, dict):
            p = dict(raw)
        elif isinstance(raw, (list, tuple)):
            for item in raw:
                idx = str(item).find("=")
                if idx == -1:
                    p[str(item)] = ""
                else:
                    p[str(item)[:idx]] = str(item)[idx + 1 :]
        elif isinstance(raw, str):
            idx = raw.find("=")
            if idx == -1:
                p[raw] = ""
            else:
                p[raw[:idx]] = raw[idx + 1 :]
        cfg["params"] = p
    if "user" in flags or "u" in flags:
        raw = flags.get("user") or flags.get("u")
        if isinstance(raw, str):
            parts = raw.split(":", 1)
            cfg["auth"] = {"username": parts[0], "password": parts[1] if len(parts) > 1 else ""}
        elif isinstance(raw, dict):
            cfg["auth"] = dict(raw)
    if "max-time" in flags or "m" in flags:
        cfg["timeout"] = flags.get("max-time", flags.get("m"))
    if "data" in flags or "d" in flags:
        cfg["data"] = flags.get("data", flags.get("d"))
    if "output" in flags or "o" in flags:
        cfg["output"] = flags.get("output", flags.get("o"))
    if flags.get("silent") or flags.get("s"):
        cfg["silent"] = True
    if flags.get("verbose") or flags.get("v"):
        cfg["verbose"] = True
    if flags.get("location") or flags.get("L"):
        cfg["redirect"] = "follow"
    if flags.get("ok"):
        cfg["validate_status"] = lambda status: True
    # carry over any remaining non-flag keys
    for k, v in flags.items():
        if k not in FLAG_MAP.values() and k not in ("url",):
            cfg.setdefault(k, v)
    return cfg


parse_flag_string = parse_flags_string
