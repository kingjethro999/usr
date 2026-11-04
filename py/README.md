# unixsr

[![PyPI version](https://img.shields.io/pypi/v/unixsr.svg?style=flat-square&color=3775a9)](https://pypi.org/project/unixsr/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Unix Style Request (UNIXSR) — Axios with a Unix vocabulary HTTP client for Python 3.10+.

Built on top of `httpx`. Fully typed (`py.typed`). Supports both synchronous operations and an async companion namespace (`aio`).

## Install

```bash
# Recommended: in a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install unixsr
```

## Quick Start

```python
from unixsr import *

# Basic HTTP requests
res = cat("https://api.site.com/users")
print(res.status, res.data)

touch("https://api.site.com/users", {"name": "Ada"})
sed("https://api.site.com/users/42", {"active": False})
rm("https://api.site.com/users/42")
```

## Commands Reference

| Command   | HTTP Verb | Description                       | Body?  |
| --------- | --------- | --------------------------------- | ------ |
| `cat`     | GET       | Read a remote resource            | no     |
| `touch`   | POST      | Create or submit                  | yes    |
| `mv`      | PUT       | Replace or move                   | yes    |
| `sed`     | PATCH     | Edit in place                     | yes    |
| `rm`      | DELETE    | Remove remote resource            | no     |
| `stat`    | HEAD      | Metadata only (headers)           | no     |
| `man`     | OPTIONS   | Query capabilities                | no     |
| `request` | CUSTOM    | Generic Axios config escape hatch | config |

## Flags

Structured keyword form or curl-like command-line string:

```python
# Structured keyword arguments
cat("https://api.site.com/me", H="Authorization: Bearer TOKEN", m=5)

# Command-line string
cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me")
```

## Response Pipes (real `|` operator)

```python
from unixsr import cat, grep, cut, head

names = cat("https://api.site.com/users") | grep(active=True) | cut("name") | head(5)
```

## Scoped Client (`cd`) & Traps (`trap`)

```python
from unixsr import cd

api = cd("https://api.site.com", H="Authorization: Bearer TOKEN")

def log_request(config):
    print("Requesting:", config.get("url"))
    return config

h = api.trap("request", log_request)
me = api.cat("/me")
api.untrap(h)
```

## Asynchronous Support

```python
from unixsr import aio

res = await aio.cat("https://api.site.com/users")
print(res.data)
```

## License

MIT
