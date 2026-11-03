# usr

USR: Unix Style Request — Axios with a Unix vocabulary HTTP client.

## Install

```sh
pip install usr
```

## Quick start

```python
from usr import *

res = cat("https://api.site.com/users")
print(res.status, res.data)

touch("https://api.site.com/users", {"name": "Ada"})
sed("https://api.site.com/users/42", {"active": False})
rm("https://api.site.com/users/42")
```

## Flags

Structured keyword form or a curl-like command-line string:

```python
cat("https://api.site.com/me", H="Authorization: Bearer TOKEN", m=5)
# or
cat("-H 'Authorization: Bearer TOKEN' -m 5 https://api.site.com/me")
```

## Pipes (real ``|`` operator)

```python
names = cat("https://api.site.com/users") | grep(active=True) | cut("name") | head(5)
```

## Scoped client

```python
api = cd("https://api.site.com", H="Authorization: Bearer TOKEN")
me = api.cat("/me")
```

## Async

```python
from usr import aio

res = await aio.cat("https://api.site.com/users")
```
