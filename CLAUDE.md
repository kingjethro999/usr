# USR: Unix Style Request

USR is a small HTTP client library that lets you make requests with Unix command names instead of HTTP verbs. It ships as two packages, one on npm (JavaScript/TypeScript) and one on PyPI (Python), plus a Next.js site with the landing page and docs.

It is Axios with a different vocabulary. It does nothing special. The whole point is that making a request reads like typing in a terminal:

```js
import * as usr from "usr";
const users = await usr.cat("https://api.site.com/users");
```

The name `usr` is a working name. The owner may publish as `lsr` instead (see Naming).

---

## How to think about this project

- **Axios, but with Unix names.** If a behaviour is unclear, do what Axios does, then rename the surface.
- **Thin and boring underneath.** JS wraps `fetch`. Python wraps `httpx`. No custom networking, no clever transport, no hidden retries.
- **Fun on the surface, serious in the engineering.** The API is playful. The code, tests, releases and docs are not.
- **Two languages, one library.** The JS and Python packages must behave the same. A request that works in one must work in the other with the same meaning, even where syntax differs.
- **Tiny.** Zero runtime dependencies in JS. One runtime dependency in Python (`httpx`). Resist adding more.
- **Never a shell.** USR never spawns a process, never calls a shell, and never touches the filesystem unless the user explicitly asks (for example `-o file`). `rm` deletes a remote resource over HTTP, not a local file. State this plainly anywhere a reader might worry.

---

## Naming

- The package name is `usr` or `lsr`. The owner decides after checking availability on both npm and PyPI.
- Short names are often taken. Scoped or hyphenated fallbacks (for example `@owner/usr`, `usr-http`) are acceptable if the owner chooses them.
- Until the name is final, treat it as a single value that every place reads from. Never hard-code the package name in scattered strings. Code examples, docs, the landing page, CI and both package manifests all take it from one source so a rename is a one-line change.
- The import conventions are fixed whatever the name ends up being:
  - JS: `import * as usr from "usr"` or named imports such as `import { cat, touch } from "usr"`. Note that `import * from "usr"` is not valid JavaScript.
  - Python: `from usr import *` or `import usr`.

---

## The three components

**`js/`: the npm package.** TypeScript source, published as both ESM and CommonJS with bundled type declarations. Runs anywhere a global `fetch` exists: modern browsers, Node 20+, Deno, Bun and edge runtimes. Named exports only, so `import * as usr` and tree-shaking both work. Zero runtime dependencies.

**`python/`: the PyPI package.** Typed (ships `py.typed`), targets Python 3.10+, built on `httpx`. Synchronous by default, with an async companion namespace for `await`-style use. `from usr import *` must be safe: define an explicit `__all__` and never export names that shadow Python builtins (`filter`, `map`, `open`, `input`, `sum`, `min`, `max`, `type`, `id` and so on).

**`web/`: the Next.js app.** The public landing page and the full documentation and usage guide. It reads the current version and package name from the same single source as the packages, so it never goes stale.

---

## What Axios is, and what we take from it

Axios is a promise-based HTTP client that works in the browser and in Node.js. It is the model for USR's ergonomics. This is what it does and how each part maps to USR.

**Method aliases.** Axios has `get`, `delete`, `head`, `options` (url, optional config) and `post`, `put`, `patch` (url, optional data, optional config), plus a generic `request(config)`. It also has form helpers such as `postForm`. USR keeps the same shape: verbs without a body take `(url, options)`, verbs with a body take `(url, data, options)`.

**Instances.** `axios.create(config)` returns an independent client with its own `baseURL`, `timeout` and `headers`. Instance methods merge the instance config with each call. USR's equivalent is `cd()`, which returns a scoped client.

**Config defaults and precedence.** Axios merges config in a fixed order: library defaults first, then the instance's `defaults`, then the per-request config, with the latter winning. USR copies this order exactly. Global defaults live on a `defaults` object, as in Axios.

**Interceptors.** Axios lets you register request and response interceptors with `use()` and remove them with `eject()`. Options include `synchronous` and `runWhen` (a function deciding whether the interceptor runs). Request interceptors can modify config or reject. Response interceptors see the response or the error. Interceptors can be attached to the global client or to an instance. USR calls these traps (see below).

**Error model.** Axios throws an `AxiosError` for any status outside the success range by default. The error carries `message`, `name`, `stack`, `config`, `code`, `status`, and (when relevant) `response` and `request`, plus `toJSON()` for a serialisable summary. It distinguishes three situations: the server answered with an error status, the request was sent but nothing came back, and something failed while building the request. Axios assigns stable string codes such as `ERR_NETWORK`, `ECONNABORTED`, `ETIMEDOUT`, `ERR_BAD_REQUEST`, `ERR_BAD_RESPONSE`, `ERR_CANCELED`, `ERR_INVALID_URL` and `ERR_FR_TOO_MANY_REDIRECTS`. USR adopts the same three-way split and the same style of codes.

**`validateStatus`.** The default rule is "status 200 to 299 resolves, anything else rejects". Users can replace the rule with their own function, or accept every status. USR keeps this behaviour and exposes it as an option and a flag.

**Response schema.** Axios resolves with `data`, `status`, `statusText`, `headers`, `config` and `request`. USR returns the same six fields.

**Request config surface.** The options users actually rely on: `baseURL`, `headers`, `params` (with a pluggable serializer), `data`, `timeout` (default `0`, meaning none), `auth` (basic), `responseType`, `withCredentials`, `maxRedirects`, `maxContentLength`, `maxBodyLength`, `proxy`, `decompress`, `signal`, plus `transformRequest` and `transformResponse` and XSRF cookie and header settings. USR supports the commonly used subset first. Do not implement the rest until there is a reason.

**Adapters.** Axios separates "the client API" from "how bytes move". It ships `xhr`, `http` and `fetch` adapters, can pick the first one supported by the environment from a list, and lets users supply a custom adapter, which is mainly how people mock requests in tests. USR keeps one transport per language (`fetch` and `httpx`), but the transport must sit behind a replaceable adapter boundary so tests and advanced users can swap it.

**Cancellation and timeouts.** Axios supports `AbortController` through `signal`. The older `CancelToken` is legacy. USR supports `AbortSignal` in JS and httpx's timeout and cancellation primitives in Python. USR does not implement `CancelToken`.

**Progress events.** Axios exposes `onUploadProgress` and `onDownloadProgress`. Treat these as a later addition, not part of the core.

**Automatic transforms.** Axios serialises plain objects to JSON for request bodies and parses JSON responses. USR does the same, and sets `Content-Type` accordingly unless the user set it.

**What we deliberately skip.** `axios.all` and `axios.spread` (deprecated upstream; use `Promise.all` and `asyncio.gather`), `CancelToken`, legacy browser support, built-in retry and caching (possible future opt-ins, not core), and any feature that exists only to paper over very old runtimes.

**Lessons from Axios's own bug history.** A recent Axios release fixed a denial-of-service issue where a `__proto__` key in a config object could break the config merge, and added input validation to its absolute-URL check. USR's config merge must ignore `__proto__`, `constructor` and `prototype` keys, and its URL handling must validate input rather than trust it.

---

## The command vocabulary

### Request commands

| Command | HTTP method | Mnemonic |
|---|---|---|
| `cat` | GET | read a resource |
| `touch` | POST | create something new |
| `mv` | PUT | replace or move |
| `sed` | PATCH | edit in place |
| `rm` | DELETE | remove |
| `stat` | HEAD | metadata only (headers, no body) |
| `man` | OPTIONS | "what can I do here?" |

`head` is reserved for the pipe stage that keeps the first N items. It is deliberately not the HTTP `HEAD` command, because the two would collide. HTTP `HEAD` is `stat`.

Signature shape, matching Axios:

- No body: `cat(url, options?)`, `rm(url, options?)`, `stat(url, options?)`, `man(url, options?)`
- With body: `touch(url, data?, options?)`, `mv(url, data?, options?)`, `sed(url, data?, options?)`

A generic escape hatch, like Axios's `request(config)`, exists for anything unusual (custom methods, full config object).

### Pipe stages

Responses are pipeable. A pipe stage receives the response data and returns transformed data. The set is intentionally small and Unix-recognisable:

| Stage | What it does |
|---|---|
| `grep` | keep items that match: a string (any field contains it), an object (fields equal), or a predicate function |
| `head(n)` / `tail(n)` | first or last N items |
| `sort` | sort items, optionally by a key |
| `uniq` | drop duplicates, optionally by a key |
| `cut(...fields)` | keep only the named fields |
| `wc` | count items |
| `tee(fn)` | run a side effect (logging, debugging) and pass the data through unchanged |
| `xargs(fn)` | for each item, run another request and collect the results |

Rules: stages never mutate their input, they compose in any order, and they behave identically in both languages. A stage that cannot apply to the data it receives (for example `cut` on a string) throws a clear `UsrError`, not a silent no-op.

Syntax differs by language because the languages differ:

- JS has no operator overloading, so pipes use `.pipe(stage)`.
- Python gets the real thing: `cat(url) | grep(active=True) | head(5)`, via `__or__`.

### Flags

Flags are Unix-style options. Where curl already has a flag, USR borrows curl's letter and curl's meaning, so developers already know it.

| Flag | Long form | Meaning |
|---|---|---|
| `-H` | `--header` | add a header (repeatable) |
| `-d` | `--data` | request body |
| `-u` | `--user` | basic auth, `user:password` |
| `-m` | `--max-time` | timeout in **seconds** (same as curl) |
| `-L` | `--location` | follow redirects |
| `-o` | `--output` | write the response body to a file (Node and Python only; the one place USR touches the filesystem) |
| `-s` | `--silent` | suppress logging |
| `-v` | `--verbose` | log request and response details (secrets redacted) |
| `-q` | `--query` | add a query parameter, `key=value` (repeatable) |
| | `--ok` | `validateStatus` shortcut: accept every status without throwing |

This table is the starting point. Any new flag goes through the same rule: reuse curl's meaning if one exists, otherwise pick a clear long form first and add a short form only if it is obvious.

Every flag can be given two ways, and both resolve to the same internal options object:

1. **Structured:** an options object (JS: `{ "-H": "Accept: application/json" }`, Python: single-letter keyword arguments such as `H="Accept: application/json"`).
2. **Command-line string:** a single string parsed with shell-like quoting rules, for example `cat("-H 'Accept: application/json' -m 5 https://api.site.com/users")`. This is parsing only. It must never invoke a shell. Both languages need the same tokenizer behaviour, and parity tests must prove it.

### Clients, defaults and traps

| USR | Axios equivalent | Purpose |
|---|---|---|
| `cd(baseUrl, options?)` | `axios.create({ baseURL, ... })` | scoped client with its own base URL and defaults |
| `defaults` | `axios.defaults` | global defaults |
| `trap("request", fn)` | `interceptors.request.use` | run before a request is sent |
| `trap("response", fn)` | `interceptors.response.use` | run on every response or error |
| `untrap(handle)` | `interceptors.*.eject` | remove a trap |

Traps honour the same `synchronous` and `runWhen` options as Axios interceptors. A scoped client from `cd()` has its own traps and defaults and exposes the same commands (`api.cat("/users")`).

---

## Usage

### JavaScript

```js
import * as usr from "usr";

// Basic requests
const res = await usr.cat("https://api.site.com/users");
console.log(res.status, res.data);

await usr.touch("https://api.site.com/users", { name: "Ada" });
await usr.sed("https://api.site.com/users/42", { active: false });
await usr.rm("https://api.site.com/users/42");

// Flags: structured and command-line string
await usr.cat("https://api.site.com/me", { "-H": "Authorization: Bearer TOKEN", "-m": 5 });
await usr.cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me");

// Pipes
const names = await usr
  .cat("https://api.site.com/users")
  .pipe(usr.grep({ active: true }))
  .pipe(usr.cut("name"))
  .pipe(usr.head(5));

// Scoped client
const api = usr.cd("https://api.site.com", { "-H": "Authorization: Bearer TOKEN" });
const me = await api.cat("/me");

// Trap (interceptor)
const handle = api.trap("response", (res) => { console.log(res.status); return res; });
api.untrap(handle);
```

### Python

```python
from usr import *

# Basic requests
res = cat("https://api.site.com/users")
print(res.status, res.data)

touch("https://api.site.com/users", {"name": "Ada"})
sed("https://api.site.com/users/42", {"active": False})
rm("https://api.site.com/users/42")

# Flags: keyword and command-line string
cat("https://api.site.com/me", H="Authorization: Bearer TOKEN", m=5)
cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me")

# Pipes, using the real pipe operator
names = cat("https://api.site.com/users") | grep(active=True) | cut("name") | head(5)

# Scoped client
api = cd("https://api.site.com", H="Authorization: Bearer TOKEN")
me = api.cat("/me")
```

Async use in Python goes through a companion namespace with the same command names (exact module name to be settled). Awaiting replaces the synchronous return. Nothing else changes.

---

## Responses and errors

Every request resolves to a response object with: `data`, `status`, `statusText`, `headers`, `config` and `request`.

By default, any status outside 200 to 299 throws a `UsrError`. The `--ok` flag or a custom `validateStatus` option changes that.

`UsrError` carries `message`, `name`, `code`, `status`, `config`, and `response` or `request` when they exist, plus `toJSON()`. It must tell apart the same three situations Axios does: server replied with an error status (`response` present), request sent but no reply (`request` present, no `response`), and failure before sending (neither). `toJSON()` and any verbose logging must redact `Authorization`, cookies and any header or flag value that looks like a credential.

Error codes follow Axios's naming style. The core set: `ERR_NETWORK`, `ETIMEDOUT`, `ERR_BAD_REQUEST`, `ERR_BAD_RESPONSE`, `ERR_CANCELED`, `ERR_INVALID_URL`, `ERR_TOO_MANY_REDIRECTS`, plus USR-specific ones for pipe and flag problems (for example `ERR_BAD_FLAG`, `ERR_BAD_PIPE`). The two languages share the same code strings.

---

## Security and safety rules

- Ignore `__proto__`, `constructor` and `prototype` keys when merging config objects (JS), and never merge untrusted keys into internal state in either language.
- Validate URLs before use. Reject malformed or unsupported schemes with `ERR_INVALID_URL`.
- Never log credentials. Redact in `toJSON()`, verbose output and error messages.
- The command-line string parser is a tokenizer, never a shell. No expansion, no substitution, no execution.
- `-o` is the only feature that writes to disk, and only to the exact path the user gave.
- Keep dependencies minimal and pinned through lockfiles. Treat every new dependency as a supply-chain decision.

---

## Packaging and distribution

- Both packages publish from one repository, under one shared version number (see Versioning).
- **npm:** ESM and CJS builds, type declarations, `exports` map, `sideEffects: false`, repository URL set correctly (required for provenance), `files` limited to build output, README, and license.
- **PyPI:** `pyproject.toml`-based build, source distribution plus wheel, typed package, README as long description.
- Package manifests carry accurate metadata: description, keywords, license, repository, homepage (the `web/` site), and links to the docs.
- Both READMEs show the Unix-to-HTTP mapping table, install command, and a minimal example in the first screen.

---

## Versioning

The version is a mechanical counter in `MAJOR.MINOR.PATCH` form. It is valid under both npm semver and Python's PEP 440.

- Every release bumps `PATCH` by one.
- `PATCH` only runs from 0 to 9. When `PATCH` is 9, the next release resets it to 0 and bumps `MINOR`.
- `MINOR` runs from 0 to 99 while pre-1.0. When the version is `0.99.9`, the next release is `1.0.0`.

| Current | Next |
|---|---|
| `0.0.0` | `0.0.1` |
| `0.0.9` | `0.1.0` |
| `0.1.9` | `0.2.0` |
| `0.98.9` | `0.99.0` |
| `0.99.9` | `1.0.0` |

After `1.0.0` the same rollover rule continues (patch to minor at 9, minor to major at 99) unless the owner changes it.

Because the bump is automatic and mechanical, the number is a release counter, not a compatibility promise. Breaking changes are called out in the changelog and in the commit history, not signalled by the version number.

Rules:

- **Lockstep.** The npm package, the PyPI package and the web app always carry the same version. There is exactly one source of truth for the current version, and everything else reads from it.
- **Never reuse a version.** npm and PyPI both refuse to republish an existing version, so a failed run leaves a gap and the next run simply moves forward. Never delete and re-tag a published version.
- Each release gets a git tag `vX.Y.Z`.

---

## CI/CD

Every commit that lands on the main branch is a release candidate for both registries. The pipeline's behaviour, as requirements:

- **Quality gate first.** Lint, type-check, test and build both packages and the web app. A red commit never publishes. Publishing is the reward for a green build.
- **Automatic version bump.** After the gate passes, the pipeline computes the next version by the rules above, writes it to the single source of truth, commits it back to main with a message like `chore(release): vX.Y.Z [skip ci]`, and tags it. The `[skip ci]` marker (or an equivalent guard) is mandatory so the bot's own commit cannot trigger another release.
- **Automatic publish to both stores.** The JS package goes to npm and the Python package goes to PyPI in the same run, at the same version. The web app deploys from the same trigger.
- **Idempotent.** A re-run of the same commit must not fail just because that version already exists. It detects the existing version and skips cleanly.
- **No race conditions.** Releases are serialised with a concurrency group, so two quick pushes never compute the same next version.
- **Passwordless publishing.** Use trusted publishing (OIDC) for both registries rather than long-lived tokens:
  - npm: the workflow needs `id-token: write`, the CLI must be new enough to support trusted publishing (npm 11.5.1 or later), and a trusted publisher is configured in each package's settings on npmjs.com. Publishing with provenance links each tarball to the exact workflow run.
  - PyPI: configure a trusted publisher (a "pending publisher" works for a project that does not exist yet) so uploads are authenticated by the workflow identity and carry attestations.
  - Expect a one-time manual bootstrap for the very first publish of each package name, because the trusted-publisher configuration is tied to a package. After that, no human touches a release.
- **Least privilege.** Workflow permissions are scoped per job. Only the release job gets `contents: write` and `id-token: write`.
- **Verification after publish.** The pipeline confirms the new version is visible on both registries and fails loudly if one store took the release and the other did not.
- **Parity check.** CI runs the shared cross-language test suite against both implementations in the same run.

---

## Git workflow for Claude

The owner wants a clean, readable history that tells the story of the project. Therefore:

- **Commit and push after every meaningful unit of work.** A new command, a new flag, a new pipe stage, a bug fix, a CI change, a docs page, a refactor, a dependency change: each gets its own commit and is pushed right away. Do not batch unrelated work into one commit, and do not let finished work sit uncommitted.
- Use **Conventional Commits** with a scope: `feat(js): add tail pipe stage`, `fix(python): handle empty body in sed`, `docs(web): add flags reference`, `ci: serialise releases`, `test(parity): cover quoted flag strings`, `chore(release): ...` (bot only).
- Commit messages say what changed and why, in plain language.
- **Pull with rebase before every push.** The release bot pushes version-bump commits to main, so the local branch is often behind. Never force-push main.
- Every push to main can publish to npm and PyPI. Run lint, types and tests locally first. Never push a build you know is broken.
- Never commit secrets, tokens or `.env` files. Never bypass hooks or skip checks to force a commit through. The only sanctioned skip is the bot's `[skip ci]` release commit.
- Never edit the version number by hand. The pipeline owns it.

---

## Testing and quality bar

- **Parity is the headline test.** A shared set of request, flag, pipe and error scenarios runs against both the JS and Python implementations and must produce equivalent results.
- Unit tests never touch the real internet. They run against a local mock HTTP server or a stubbed adapter.
- Every command, every flag (both the structured and the string form), every pipe stage, the config merge order, trap ordering, `validateStatus` behaviour and each error code has a test.
- Security regressions get permanent tests: prototype-key config merging, malformed URLs, credential redaction.
- Strict type-checking in TypeScript and a type checker in Python. Linting and formatting are enforced in CI.
- Keep the JS bundle small and track its size in CI. Treat meaningful growth as a bug.
- Documentation examples are real code. CI should run or type-check them so the docs cannot drift from the library.

---

## The web app (landing page and docs)

**Landing page.** Sells the joke and the utility in one screen: the tagline, the Unix-to-HTTP mapping, an install command with npm and pip tabs, and a short side-by-side "before and after" against raw `fetch` or Axios. A terminal aesthetic fits the theme (monospace type, prompt-style elements, a light animated demo), but it must stay readable, accessible and fast, and work well on phones.

**Docs and usage.** Cover, at minimum: installation for both languages, a quick start, the full command reference (every command with its HTTP equivalent), the flags reference, pipes and each stage, scoped clients and defaults, traps, response shape, errors and codes, a JS versus Python parity table, a security note ("USR never runs a shell"), an FAQ, and the changelog. Every page shows JS and Python examples together with a language switcher.

The site displays the current version and package name from the shared source of truth.

---

## Non-goals

- Not a new protocol. Everything is plain HTTP.
- Not a shell, a CLI, or a command runner. It is a library you call from code.
- Not trying to beat Axios on features. It is trying to be a delightful, equivalent-enough client with a distinctive vocabulary.
- No retries, caching or middleware ecosystem in the core.
- No support for legacy browsers or end-of-life runtimes.

---

## Decisions that belong to the owner

Do not decide these silently. Ask, or follow the owner's existing choice.

- Final package name (`usr` or `lsr`) after the availability check on npm and PyPI.
- License (MIT is the usual default for libraries like this).
- Where the web app is hosted.
- Whether the versioning rule keeps its patch-at-9 and minor-at-99 rollover after `1.0.0`.
- Exact naming of the Python async namespace.
- Whether `trap` and `cd` stay as the names for interceptors and scoped clients.

---

## Reference

Axios documentation, for behaviour questions: interceptors (`axios-http.com/docs/interceptors`), config defaults and precedence (`axios-http.com/docs/config_defaults`), request config (`axios-http.com/docs/req_config`), error handling (`axios-http.com/docs/handling_errors`).
