# unixsr

[![npm version](https://img.shields.io/npm/v/unixsr.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/unixsr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Unix Style Request (UNIXSR) — Axios with a Unix vocabulary HTTP client for JavaScript & TypeScript.

Runs on Node 20+, modern browsers, Deno, Bun, and edge runtimes. Zero runtime dependencies. Ships both ESM and CommonJS with bundled type declarations.

## Install

```sh
npm install unixsr
# or
pnpm add unixsr
# or
bun add unixsr
```

## Quick Start

```js
// 1. Namespace import
import * as usr from "unixsr";
const res = await usr.cat("https://api.site.com/users");
console.log(res.status, res.data);

// 2. Named imports
import { cat, touch, sed, rm } from "unixsr";
await touch("https://api.site.com/users", { name: "Ada" });
await sed("https://api.site.com/users/42", { active: false });
await rm("https://api.site.com/users/42");
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

Flags borrow curl's syntax. Pass structured options or a CLI string:

```js
// CLI string
await usr.cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me");

// Structured options
await usr.cat("https://api.site.com/me", {
  "-H": "Authorization: Bearer TOKEN",
  "-m": 5,
});
```

## Response Pipes

```js
import { cat, grep, cut, head } from "unixsr";

const names = await cat("https://api.site.com/users")
  .pipe(grep({ active: true }))
  .pipe(cut("name"))
  .pipe(head(5));
```

## Scoped Client (`cd`) & Traps (`trap`)

```js
import { cd } from "unixsr";

const api = cd("https://api.site.com", {
  "-H": "Authorization: Bearer TOKEN",
});

const handle = api.trap("response", (res) => {
  console.log("Status:", res.status);
  return res;
});

const me = await api.cat("/me");
api.untrap(handle);
```

## License

MIT
