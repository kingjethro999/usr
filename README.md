# unixsr (Unix Style Request)

[![npm version](https://img.shields.io/npm/v/unixsr.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/unixsr)
[![PyPI version](https://img.shields.io/pypi/v/unixsr.svg?style=flat-square&color=3775a9)](https://pypi.org/project/unixsr/)
[![CI](https://img.shields.io/github/actions/workflow/status/kingjethro999/usr/ci.yml?branch=main&style=flat-square)](https://github.com/kingjethro999/usr/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Axios with a Unix vocabulary.**
> HTTP client library for JavaScript and Python where making a request reads like typing in a terminal.

```js
import * as usr from "unixsr";
const users = await usr.cat("https://api.site.com/users");
```

```python
from unixsr import *
users = cat("https://api.site.com/users")
```

---

## Why unixsr?

- **Axios, but Unix.** Same ergonomic promise-based client you already know, reimagined with standard Unix terminal semantics.
- **Thin and boring underneath.** JS wraps native `fetch`. Python wraps `httpx`. Zero custom networking, zero bloated dependencies.
- **Two languages, one library.** Identical behavior, shared parity test suite, cross-platform consistency.
- **Never a shell.** `unixsr` never spawns a process, never invokes a shell, and never touches your local filesystem unless you explicitly pass `-o <file>`. `rm` deletes remote HTTP resources—never local files.

---

## Installation

### JavaScript / TypeScript (Node 20+, Deno, Bun, Browsers)

```bash
npm i unixsr
# or
pnpm add unixsr
# or
bun add unixsr
```

### Python 3.10+ (Sync & Async)

```bash
# Recommended: in a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install unixsr
```

---

## The Command Vocabulary

| Command | HTTP Verb | Mnemonic / Behavior | Request Body? | Safe? | Idempotent? |
|---|---|---|---|---|---|
| `cat` | **GET** | Read a remote resource | No | Yes | Yes |
| `touch` | **POST** | Create something new or submit | Yes | No | No |
| `mv` | **PUT** | Replace or move a resource | Yes | No | Yes |
| `sed` | **PATCH** | Edit a resource in place | Yes | No | No |
| `rm` | **DELETE** | Remove a remote resource | No | No | Yes |
| `stat` | **HEAD** | Metadata only (headers, no body) | No | Yes | Yes |
| `man` | **OPTIONS** | Discover allowed capabilities (`Allow`) | No | Yes | Yes |
| `request` | *CUSTOM* | Generic Axios-style escape hatch | Config | Config | Config |

> *Note:* `head` is reserved for the pipe stage that extracts the first N items. HTTP `HEAD` is `stat`.

---

## Import Conventions

`unixsr` supports all canonical import conventions in both ecosystems:

### JavaScript / TypeScript

```js
// 1. Namespace import (recommended)
import * as usr from "unixsr";
const users = await usr.cat("https://api.site.com/users");

// 2. Named imports (tree-shakable)
import { cat, touch, cd, trap, grep, head } from "unixsr";
const users = await cat("https://api.site.com/users");

// 3. Default instance import
import usr from "unixsr";
const users = await usr.cat("https://api.site.com/users");

// 4. CommonJS
const { cat, touch } = require("unixsr");
```

### Python 3.10+

```python
# 1. Star import (safe: explicit __all__, zero shadowed builtins)
from unixsr import *
users = cat("https://api.site.com/users")

# 2. Module namespace import
import unixsr
users = unixsr.cat("https://api.site.com/users")

# 3. Explicit named imports
from unixsr import cat, touch, cd, trap, grep, head
users = cat("https://api.site.com/users")

# 4. Asynchronous companion namespace
from unixsr import aio
users = await aio.cat("https://api.site.com/users")
```

---

## Flags: Structured & CLI String

Flags mirror curl options you already know. Every flag can be passed as an options object/kwargs or as a single command-line string:

| Flag | Long Form | Description |
|---|---|---|
| `-H` | `--header` | Add custom header (repeatable) |
| `-d` | `--data` | Request body payload |
| `-u` | `--user` | HTTP Basic Auth (`user:password`) |
| `-m` | `--max-time` | Timeout in seconds |
| `-L` | `--location` | Follow redirects |
| `-o` | `--output` | Save response body to local disk |
| `-q` | `--query` | Add URL query parameter (`k=v`, repeatable) |
| `-s` | `--silent` | Suppress log output |
| `-v` | `--verbose` | Log details (credentials redacted) |
| | `--ok` | Accept any status code (200–599) without throwing |

### JavaScript

```js
// Structured options object
await usr.cat("https://api.site.com/users", {
  "-H": "Authorization: Bearer SECRET",
  "-q": "active=true",
  "-m": 5,
});

// Command-line string syntax
await usr.cat("-H 'Authorization: Bearer SECRET' -q active=true -m 5 https://api.site.com/users");
```

### Python

```python
# Keyword arguments
cat("https://api.site.com/users", H="Authorization: Bearer SECRET", q="active=true", m=5)

# Command-line string syntax
cat("-H 'Authorization: Bearer SECRET' -q active=true -m 5 https://api.site.com/users")
```

---

## Response Pipeline

Transform returned response data with composable pipe stages. Stages never mutate input data and compose identically in both languages.

- **JS:** Uses `.pipe(stage)`
- **Python:** Uses the real `|` operator

| Stage | Behavior |
|---|---|
| `grep(match)` | Keep items matching a string, object attributes, or predicate function |
| `head(n)` / `tail(n)` | Keep first or last N elements |
| `sort([key])` | Order items alphabetically or by property |
| `uniq([key])` | Drop duplicate records |
| `cut(...keys)` | Project only listed object properties |
| `wc()` | Count items, lines, or keys |
| `tee(fn)` | Tap side effect (logging, debug) without altering data |
| `xargs(fn)` | Map concurrent child requests for each item |

```js
// JavaScript
const leaders = await usr
  .cat("https://api.site.com/users")
  .pipe(usr.grep({ active: true }))
  .pipe(usr.sort("name"))
  .pipe(usr.cut("id", "name", "role"))
  .pipe(usr.head(5));
```

```python
# Python
leaders = (
    cat("https://api.site.com/users")
    | grep(active=True)
    | sort("name")
    | cut("id", "name", "role")
    | head(5)
)
```

---

## Scoped Clients (`cd`) and Interceptors (`trap`)

Create isolated client instances with custom base URLs, headers, and interceptors:

```js
// JavaScript
const api = usr.cd("https://api.site.com", {
  "-H": "Authorization: Bearer TOKEN",
  "-m": 10,
});

// Register request/response traps
const h = api.trap("request", (config) => {
  config.headers["X-Request-ID"] = "req-123";
  return config;
});

const me = await api.cat("/me");

// Eject trap
api.untrap(h);
```

```python
# Python
api = cd("https://api.site.com", H="Authorization: Bearer TOKEN", m=10)

def inject_trace(config):
    config.setdefault("headers", {})["X-Request-ID"] = "req-123"
    return config

h = api.trap("request", inject_trace)
me = api.cat("/me")
api.untrap(h)
```

---

## Error Model

Requests resolving outside 200–299 reject with a typed `UsrError` carrying:
- `code`: Stable Axios-style error code (`ERR_BAD_REQUEST`, `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ETIMEDOUT`, `ERR_INVALID_URL`)
- `status`: HTTP response status code
- `response` / `request`: Axios-compatible payload details
- `toJSON()`: Serialized summary with credentials automatically redacted

---

## Monorepo Architecture

```
.
├── js/               # npm package (TypeScript, ESM & CJS builds, types)
├── py/               # PyPI package (Python 3.10+, py.typed, sync & async)
├── web/              # Next.js 16 app (Interactive Terminal REPL & Man Pages)
├── test-parity/      # Cross-language test scenarios executed against both JS & Py
├── scripts/          # bump-version.js & sync-version.js (Mechanical version counter)
├── .githooks/        # Pre-commit hook for automated commit-time version bumps
├── VERSION           # Root version file (vX.Y.Z)
└── version.json      # Single source of truth for name & version
```

---

## Versioning

Versioning follows a mechanical counter in `MAJOR.MINOR.PATCH` form (honoring both npm semver and PEP 440):

- Every commit triggers an automatic mechanical bump via `.githooks/pre-commit`.
- `PATCH` increments from 0 to 9. At 9, it resets to 0 and bumps `MINOR`.
- `MINOR` increments from 0 to 99. At `0.99.9`, it rolls over to `1.0.0`.

---

## License

[MIT](LICENSE)
