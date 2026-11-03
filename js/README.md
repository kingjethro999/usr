# usr

USR: Unix Style Request — Axios with a Unix vocabulary HTTP client.

## Install

```sh
npm install usr
```

## Quick start

```js
import * as usr from "usr";

const res = await usr.cat("https://api.site.com/users");
console.log(res.status, res.data);

await usr.touch("https://api.site.com/users", { name: "Ada" });
await usr.sed("https://api.site.com/users/42", { active: false });
await usr.rm("https://api.site.com/users/42");
```

## Commands

| Command | HTTP | Body? |
|---|---|---|
| cat | GET | no |
| touch | POST | yes |
| mv | PUT | yes |
| sed | PATCH | yes |
| rm | DELETE | no |
| stat | HEAD | no |
| man | OPTIONS | no |

## Flags

Structured or command-line string form:

```js
await usr.cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me");
// or
await usr.cat("https://api.site.com/me", { "-H": "Authorization: Bearer TOKEN", "-m": 5 });
```

## Pipes

```js
const names = await usr
  .cat("https://api.site.com/users")
  .pipe(usr.grep({ active: true }))
  .pipe(usr.cut("name"))
  .pipe(usr.head(5));
```

## Scoped client & traps

```js
const api = usr.cd("https://api.site.com", { "-H": "Authorization: Bearer TOKEN" });
const me = await api.cat("/me");

const handle = api.trap("response", (res) => { console.log(res.status); return res; });
api.untrap(handle);
```
