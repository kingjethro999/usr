export interface ManCommand {
  cmd: string;
  section: number;
  category: "request" | "client" | "trap" | "pipe";
  summary: string;
  httpMethod: string;
  safe: boolean;
  idempotent: boolean;
  synopsis: {
    js: string;
    python: string;
  };
  description: string;
  imports: {
    js: string[];
    python: string[];
  };
  options: {
    flag: string;
    desc: string;
  }[];
  examples: {
    title: string;
    js: string;
    python: string;
  }[];
  errors: {
    code: string;
    desc: string;
  }[];
  seeAlso: string[];
}

export const MAN_COMMANDS: Record<string, ManCommand> = {
  cat: {
    cmd: "cat",
    section: 1,
    category: "request",
    summary: "read a remote resource over HTTP (GET)",
    httpMethod: "GET",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "cat(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "cat(url: str, **flags) -> Response",
    },
    description:
      "cat issues an HTTP GET request to retrieve a remote resource representation. It automatically serializes query parameters, resolves relative paths against scoped clients (cd), and parses JSON response bodies.",
    imports: {
      js: [
        'import * as usr from "usr";\nconst res = await usr.cat("https://api.site.com/users");',
        'import { cat } from "usr";\nconst res = await cat("https://api.site.com/users");',
        'import usr from "usr";\nconst res = await usr.cat("https://api.site.com/users");',
        'const { cat } = require("usr");\nconst res = await cat("https://api.site.com/users");',
      ],
      python: [
        'from usr import *\nres = cat("https://api.site.com/users")',
        'import usr\nres = usr.cat("https://api.site.com/users")',
        'from usr import cat\nres = cat("https://api.site.com/users")',
      ],
    },
    options: [
      { flag: "-H, --header <k:v>", desc: "Add a custom request header (repeatable)." },
      { flag: "-m, --max-time <sec>", desc: "Request timeout in seconds (default none)." },
      { flag: "-q, --query <k=v>", desc: "Append a URL query parameter (repeatable)." },
      { flag: "-u, --user <u:p>", desc: "HTTP Basic authentication, username:password." },
      { flag: "-L, --location", desc: "Follow HTTP 3xx redirects." },
      { flag: "-o, --output <file>", desc: "Stream response body to a local file." },
      { flag: "--ok", desc: "Accept any status code (200-599) without throwing UsrError." },
    ],
    examples: [
      {
        title: "Basic GET request",
        js: '// Named import\nimport { cat } from "usr";\n\nconst res = await cat("https://api.site.com/users");\nconsole.log(res.status, res.data);',
        python: '# Star import\nfrom usr import *\n\nres = cat("https://api.site.com/users")\nprint(res.status, res.data)',
      },
      {
        title: "Structured flags and query params",
        js: 'import * as usr from "usr";\n\nconst res = await usr.cat("https://api.site.com/users", {\n  "-H": "Accept: application/json",\n  "-q": "role=engineer",\n  "-m": 10\n});',
        python: 'import usr\n\nres = usr.cat(\n    "https://api.site.com/users",\n    H="Accept: application/json",\n    q="role=engineer",\n    m=10\n)',
      },
      {
        title: "Unix command-line string invocation",
        js: 'import { cat } from "usr";\n\nconst res = await cat("-H \'Authorization: Bearer SECRET\' -m 5 https://api.site.com/me");',
        python: 'from usr import cat\n\nres = cat("-H \'Authorization: Bearer SECRET\' -m 5 https://api.site.com/me")',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "HTTP 4xx response code from remote server." },
      { code: "ERR_BAD_RESPONSE", desc: "HTTP 5xx server failure returned." },
      { code: "ERR_NETWORK", desc: "TCP connection failure, DNS resolution error, or refused." },
      { code: "ETIMEDOUT", desc: "Request exceeded -m / --max-time timeout threshold." },
      { code: "ERR_INVALID_URL", desc: "Malformed URL or unsupported protocol scheme." },
    ],
    seeAlso: ["touch", "sed", "stat", "rm", "cd"],
  },
  touch: {
    cmd: "touch",
    section: 1,
    category: "request",
    summary: "create something new over HTTP (POST)",
    httpMethod: "POST",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "touch(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "touch(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "touch sends an HTTP POST request to create a new resource or execute a remote operation. JavaScript objects and Python dictionaries are serialized to JSON with Content-Type: application/json.",
    imports: {
      js: [
        'import * as usr from "usr";\nawait usr.touch("https://api.site.com/users", { name: "Ada" });',
        'import { touch } from "usr";\nawait touch("https://api.site.com/users", { name: "Ada" });',
      ],
      python: [
        'from usr import *\ntouch("https://api.site.com/users", {"name": "Ada"})',
        'from usr import touch\ntouch("https://api.site.com/users", {"name": "Ada"})',
      ],
    },
    options: [
      { flag: "-d, --data <json|body>", desc: "Request payload to transmit." },
      { flag: "-H, --header <k:v>", desc: "Add request header (e.g. Content-Type, Authorization)." },
      { flag: "-u, --user <u:p>", desc: "HTTP Basic auth username:password." },
      { flag: "--ok", desc: "Do not throw on 4xx/5xx responses." },
    ],
    examples: [
      {
        title: "Create a resource with JSON payload",
        js: 'import { touch } from "usr";\n\nconst res = await touch("https://api.site.com/users", {\n  name: "Grace Hopper",\n  role: "pioneer"\n});\nconsole.log("Created ID:", res.data.id);',
        python: 'from usr import touch\n\nres = touch("https://api.site.com/users", {\n    "name": "Grace Hopper",\n    "role": "pioneer"\n})\nprint("Created ID:", res.data.get("id"))',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "4xx status code (e.g. 400 validation error, 409 conflict)." },
      { code: "ERR_NETWORK", desc: "Connection failed before server responded." },
    ],
    seeAlso: ["cat", "mv", "sed", "rm"],
  },
  mv: {
    cmd: "mv",
    section: 1,
    category: "request",
    summary: "replace or move a resource over HTTP (PUT)",
    httpMethod: "PUT",
    safe: false,
    idempotent: true,
    synopsis: {
      js: "mv(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "mv(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "mv issues an HTTP PUT request to replace the destination resource entirely with the provided payload representation.",
    imports: {
      js: [
        'import * as usr from "usr";\nawait usr.mv("https://api.site.com/users/42", { name: "Ada" });',
        'import { mv } from "usr";\nawait mv("https://api.site.com/users/42", { name: "Ada" });',
      ],
      python: [
        'from usr import *\nmv("https://api.site.com/users/42", {"name": "Ada"})',
        'from usr import mv\nmv("https://api.site.com/users/42", {"name": "Ada"})',
      ],
    },
    options: [
      { flag: "-d, --data <body>", desc: "Full replacement representation." },
      { flag: "-H, --header <k:v>", desc: "Add request header." },
      { flag: "-m, --max-time <sec>", desc: "Request timeout in seconds." },
    ],
    examples: [
      {
        title: "Full document replacement",
        js: 'import { mv } from "usr";\n\nawait mv("https://api.site.com/users/42", {\n  name: "Alan Turing",\n  active: true\n});',
        python: 'from usr import mv\n\nmv("https://api.site.com/users/42", {\n    "name": "Alan Turing",\n    "active": True\n})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "404 not found or 400 invalid schema." },
    ],
    seeAlso: ["sed", "touch", "rm"],
  },
  sed: {
    cmd: "sed",
    section: 1,
    category: "request",
    summary: "edit a resource in place over HTTP (PATCH)",
    httpMethod: "PATCH",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "sed(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "sed(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "sed issues an HTTP PATCH request to apply a partial modification or delta update to an existing resource.",
    imports: {
      js: [
        'import * as usr from "usr";\nawait usr.sed("https://api.site.com/users/42", { active: false });',
        'import { sed } from "usr";\nawait sed("https://api.site.com/users/42", { active: false });',
      ],
      python: [
        'from usr import *\nsed("https://api.site.com/users/42", {"active": False})',
        'from usr import sed\nsed("https://api.site.com/users/42", {"active": False})',
      ],
    },
    options: [
      { flag: "-d, --data <patch>", desc: "Partial fields to update." },
      { flag: "-H, --header <k:v>", desc: "Custom request headers." },
    ],
    examples: [
      {
        title: "Partial status update",
        js: 'import { sed } from "usr";\n\nawait sed("https://api.site.com/users/42", { active: false });',
        python: 'from usr import sed\n\nsed("https://api.site.com/users/42", {"active": False})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Server rejected patch instruction or invalid attribute." },
    ],
    seeAlso: ["mv", "touch", "cat"],
  },
  rm: {
    cmd: "rm",
    section: 1,
    category: "request",
    summary: "remove a remote resource over HTTP (DELETE)",
    httpMethod: "DELETE",
    safe: false,
    idempotent: true,
    synopsis: {
      js: "rm(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "rm(url: str, **flags) -> Response",
    },
    description:
      "rm deletes a remote resource over HTTP. Crucially, rm NEVER touches your local filesystem—it is an HTTP client operation, not a shell call.",
    imports: {
      js: [
        'import * as usr from "usr";\nawait usr.rm("https://api.site.com/users/42");',
        'import { rm } from "usr";\nawait rm("https://api.site.com/users/42");',
      ],
      python: [
        'from usr import *\nrm("https://api.site.com/users/42")',
        'from usr import rm\nrm("https://api.site.com/users/42")',
      ],
    },
    options: [
      { flag: "-H, --header <k:v>", desc: "Request headers." },
      { flag: "--ok", desc: "Do not throw if already deleted (e.g. 404/204)." },
    ],
    examples: [
      {
        title: "Delete user record",
        js: 'import { rm } from "usr";\n\nawait rm("https://api.site.com/users/42");',
        python: 'from usr import rm\n\nrm("https://api.site.com/users/42")',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "404 Not Found or 403 Forbidden." },
    ],
    seeAlso: ["cat", "touch"],
  },
  stat: {
    cmd: "stat",
    section: 1,
    category: "request",
    summary: "retrieve metadata and headers over HTTP (HEAD)",
    httpMethod: "HEAD",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "stat(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "stat(url: str, **flags) -> Response",
    },
    description:
      "stat issues an HTTP HEAD request. It returns headers and status metadata without downloading the body payload. (Note: head is reserved for pipe truncation).",
    imports: {
      js: [
        'import * as usr from "usr";\nconst res = await usr.stat("https://api.site.com/asset.zip");',
        'import { stat } from "usr";\nconst res = await stat("https://api.site.com/asset.zip");',
      ],
      python: [
        'from usr import *\nres = stat("https://api.site.com/asset.zip")',
        'from usr import stat\nres = stat("https://api.site.com/asset.zip")',
      ],
    },
    options: [
      { flag: "-H, --header <k:v>", desc: "Request headers." },
      { flag: "-m, --max-time <sec>", desc: "Request timeout." },
    ],
    examples: [
      {
        title: "Inspect content-length before download",
        js: 'import { stat } from "usr";\n\nconst res = await stat("https://api.site.com/large-archive.tar.gz");\nconsole.log("Size:", res.headers["content-length"]);',
        python: 'from usr import stat\n\nres = stat("https://api.site.com/large-archive.tar.gz")\nprint("Size:", res.headers.get("content-length"))',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Resource not found or bad gateway." },
    ],
    seeAlso: ["cat", "man"],
  },
  man: {
    cmd: "man",
    section: 1,
    category: "request",
    summary: "query allowed options and capabilities (OPTIONS)",
    httpMethod: "OPTIONS",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "man(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "man(url: str, **flags) -> Response",
    },
    description:
      "man issues an HTTP OPTIONS request to discover what methods and capabilities the remote endpoint supports, returning the Allow header.",
    imports: {
      js: [
        'import * as usr from "usr";\nconst res = await usr.man("https://api.site.com/users");',
        'import { man } from "usr";\nconst res = await man("https://api.site.com/users");',
      ],
      python: [
        'from usr import *\nres = man("https://api.site.com/users")',
        'from usr import man\nres = man("https://api.site.com/users")',
      ],
    },
    options: [
      { flag: "-H, --header <k:v>", desc: "Request headers." },
    ],
    examples: [
      {
        title: "Discover allowed verbs",
        js: 'import { man } from "usr";\n\nconst res = await man("https://api.site.com/users");\nconsole.log("Allow:", res.headers["allow"]);',
        python: 'from usr import man\n\nres = man("https://api.site.com/users")\nprint("Allow:", res.headers.get("allow"))',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Endpoint rejected OPTIONS." },
    ],
    seeAlso: ["cat", "stat"],
  },
  request: {
    cmd: "request",
    section: 1,
    category: "request",
    summary: "generic HTTP request escape hatch (Axios request)",
    httpMethod: "CUSTOM",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "request(config: UsrConfig): Promise<UsrResponse>",
      python: "request(config: dict) -> Response",
    },
    description:
      "request provides a full configuration-based escape hatch (identical to axios.request), allowing arbitrary custom HTTP methods, headers, body streams, and settings.",
    imports: {
      js: [
        'import * as usr from "usr";\nconst res = await usr.request({ method: "LINK", url: "..." });',
        'import { request } from "usr";\nconst res = await request({ method: "REPORT", url: "..." });',
      ],
      python: [
        'from usr import *\nres = request({"method": "PURGE", "url": "..."})',
        'from usr import request\nres = request({"method": "PURGE", "url": "..."})',
      ],
    },
    options: [
      { flag: "config.method", desc: "HTTP verb (GET, POST, PURGE, etc.)." },
      { flag: "config.url", desc: "Target URL or relative path." },
      { flag: "config.headers", desc: "Key-value headers map." },
      { flag: "config.timeout", desc: "Timeout in milliseconds (or seconds via -m)." },
    ],
    examples: [
      {
        title: "Custom HTTP method",
        js: 'import { request } from "usr";\n\nconst res = await request({\n  method: "PURGE",\n  url: "https://api.site.com/cache/catalog"\n});',
        python: 'from usr import request\n\nres = request({\n    "method": "PURGE",\n    "url": "https://api.site.com/cache/catalog"\n})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Server returned error status." },
    ],
    seeAlso: ["cat", "touch", "cd"],
  },
  cd: {
    cmd: "cd",
    section: 1,
    category: "client",
    summary: "create a scoped client instance with base URL (Axios create)",
    httpMethod: "CLIENT",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "cd(baseUrl: string, options?: UsrConfig): UsrInstance",
      python: "cd(base_url: str, **flags) -> UsrClient",
    },
    description:
      "cd creates an independent scoped client instance (equivalent to axios.create({ baseURL })) with its own baseURL, default headers, and interceptor traps.",
    imports: {
      js: [
        'import * as usr from "usr";\nconst api = usr.cd("https://api.site.com");',
        'import { cd } from "usr";\nconst api = cd("https://api.site.com");',
      ],
      python: [
        'from usr import *\napi = cd("https://api.site.com")',
        'from usr import cd\napi = cd("https://api.site.com")',
      ],
    },
    options: [
      { flag: "-H, --header <k:v>", desc: "Default headers applied to all requests." },
      { flag: "-m, --max-time <sec>", desc: "Default timeout for all requests." },
      { flag: "-u, --user <u:p>", desc: "Default basic auth." },
    ],
    examples: [
      {
        title: "Scoped client with Authorization header",
        js: 'import { cd } from "usr";\n\nconst api = cd("https://api.site.com", {\n  "-H": "Authorization: Bearer SECRET_TOKEN"\n});\n\nconst users = await api.cat("/users");\nconst me = await api.cat("/me");',
        python: 'from usr import cd\n\napi = cd("https://api.site.com", H="Authorization: Bearer SECRET_TOKEN")\nusers = api.cat("/users")\nme = api.cat("/me")',
      },
    ],
    errors: [
      { code: "ERR_INVALID_URL", desc: "Base URL is invalid." },
    ],
    seeAlso: ["cat", "trap", "untrap"],
  },
  trap: {
    cmd: "trap",
    section: 1,
    category: "trap",
    summary: "register request or response interceptors (Axios interceptors)",
    httpMethod: "HOOK",
    safe: true,
    idempotent: false,
    synopsis: {
      js: "trap(phase: 'request' | 'response', fn: Function, options?: TrapOptions): Handle",
      python: "trap(phase: str, fn: Callable, options: dict = None) -> Handle",
    },
    description:
      "trap registers an interceptor handler on either the global client or a scoped cd() client. Request traps modify outbound config; response traps process returned responses or errors.",
    imports: {
      js: [
        'import * as usr from "usr";\nconst h = usr.trap("request", (cfg) => cfg);',
        'import { trap } from "usr";\nconst h = trap("response", (res) => res);',
      ],
      python: [
        'from usr import *\nh = trap("request", lambda cfg: cfg)',
        'from usr import trap\nh = trap("response", lambda res: res)',
      ],
    },
    options: [
      { flag: "runWhen", desc: "Predicate deciding whether this trap executes." },
      { flag: "synchronous", desc: "Execute immediately if trap has no async delay." },
    ],
    examples: [
      {
        title: "Logging and auth injection trap",
        js: 'import { trap } from "usr";\n\nconst h = trap("request", (config) => {\n  console.log(`[REQ] ${config.method} ${config.url}`);\n  config.headers = config.headers || {};\n  config.headers["X-Trace-Id"] = "trace-123";\n  return config;\n});',
        python: 'from usr import trap\n\ndef log_req(cfg):\n    print(f"[REQ] {cfg.get(\'method\')} {cfg.get(\'url\')}")\n    return cfg\n\nh = trap("request", log_req)',
      },
    ],
    errors: [
      { code: "ERR_BAD_ARG", desc: "Invalid phase specified (must be 'request' or 'response')." },
    ],
    seeAlso: ["untrap", "cd"],
  },
  untrap: {
    cmd: "untrap",
    section: 1,
    category: "trap",
    summary: "eject a registered interceptor trap (Axios eject)",
    httpMethod: "HOOK",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "untrap(handle: Handle): void",
      python: "untrap(handle: Handle) -> None",
    },
    description:
      "untrap unregisters and removes a previously attached trap handle.",
    imports: {
      js: [
        'import { trap, untrap } from "usr";\nconst h = trap("request", fn);\nuntrap(h);',
      ],
      python: [
        'from usr import trap, untrap\nh = trap("request", fn)\nuntrap(h)',
      ],
    },
    options: [],
    examples: [
      {
        title: "Ejecting a temporary trap",
        js: 'import { trap, untrap } from "usr";\n\nconst handle = trap("response", (res) => {\n  console.log("Status:", res.status);\n  return res;\n});\n\n// Later, remove the trap:\nuntrap(handle);',
        python: 'from usr import trap, untrap\n\nhandle = trap("response", lambda r: r)\nuntrap(handle)',
      },
    ],
    errors: [],
    seeAlso: ["trap", "cd"],
  },
  grep: {
    cmd: "grep",
    section: 1,
    category: "pipe",
    summary: "filter response records matching string, object, or predicate",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "grep(filter: string | object | Function): PipeStage",
      python: "grep(*args, **kwargs) -> PipeStage",
    },
    description:
      "grep filters an array of records. If given a string, keeps items where any field contains that substring. If given an object or keyword arguments, matches exact field equality. If given a function, uses it as a predicate.",
    imports: {
      js: [
        'import { cat, grep } from "usr";\nawait cat("/users").pipe(grep({ active: true }));',
      ],
      python: [
        'from usr import cat, grep\ncat("/users") | grep(active=True)',
      ],
    },
    options: [],
    examples: [
      {
        title: "Field equality match",
        js: 'import { cat, grep } from "usr";\n\nconst active = await cat("https://api.site.com/users")\n  .pipe(grep({ active: true }));',
        python: 'from usr import cat, grep\n\nactive = cat("https://api.site.com/users") | grep(active=True)',
      },
      {
        title: "Substring text search across all attributes",
        js: 'import { cat, grep } from "usr";\n\nconst engineers = await cat("https://api.site.com/users")\n  .pipe(grep("engineer"));',
        python: 'from usr import cat, grep\n\nengineers = cat("https://api.site.com/users") | grep("engineer")',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["head", "cut", "sort"],
  },
  head: {
    cmd: "head",
    section: 1,
    category: "pipe",
    summary: "slice the first N items from a response stream",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "head(n: number = 10): PipeStage",
      python: "head(n: int = 10) -> PipeStage",
    },
    description:
      "head takes the first N elements of an array. Note: HTTP HEAD is named 'stat' in USR to prevent naming collisions.",
    imports: {
      js: [
        'import { cat, head } from "usr";\nawait cat("/users").pipe(head(5));',
      ],
      python: [
        'from usr import cat, head\ncat("/users") | head(5)',
      ],
    },
    options: [],
    examples: [
      {
        title: "Take top 5 items",
        js: 'import { cat, head } from "usr";\n\nconst top5 = await cat("https://api.site.com/users")\n  .pipe(head(5));',
        python: 'from usr import cat, head\n\ntop5 = cat("https://api.site.com/users") | head(5)',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["tail", "grep", "wc"],
  },
  tail: {
    cmd: "tail",
    section: 1,
    category: "pipe",
    summary: "slice the last N items from a response stream",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "tail(n: number = 10): PipeStage",
      python: "tail(n: int = 10) -> PipeStage",
    },
    description:
      "tail extracts the final N elements from an array of records.",
    imports: {
      js: [
        'import { cat, tail } from "usr";\nawait cat("/logs").pipe(tail(10));',
      ],
      python: [
        'from usr import cat, tail\ncat("/logs") | tail(10)',
      ],
    },
    options: [],
    examples: [
      {
        title: "Latest 10 log entries",
        js: 'import { cat, tail } from "usr";\n\nconst recent = await cat("https://api.site.com/logs")\n  .pipe(tail(10));',
        python: 'from usr import cat, tail\n\nrecent = cat("https://api.site.com/logs") | tail(10)',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["head", "grep", "wc"],
  },
  cut: {
    cmd: "cut",
    section: 1,
    category: "pipe",
    summary: "project only the specified fields from each record",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "cut(...fields: string[]): PipeStage",
      python: "cut(*fields: str) -> PipeStage",
    },
    description:
      "cut transforms each record object in an array by retaining only the listed property keys, discarding all others.",
    imports: {
      js: [
        'import { cat, cut } from "usr";\nawait cat("/users").pipe(cut("id", "email"));',
      ],
      python: [
        'from usr import cat, cut\ncat("/users") | cut("id", "email")',
      ],
    },
    options: [],
    examples: [
      {
        title: "Select specific fields",
        js: 'import { cat, cut } from "usr";\n\nconst directory = await cat("https://api.site.com/users")\n  .pipe(cut("id", "name", "email"));',
        python: 'from usr import cat, cut\n\ndirectory = cat("https://api.site.com/users") | cut("id", "name", "email")',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array of objects." },
    ],
    seeAlso: ["grep", "sort", "uniq"],
  },
  sort: {
    cmd: "sort",
    section: 1,
    category: "pipe",
    summary: "sort items in ascending or keyed order",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "sort(keyOrFn?: string | Function): PipeStage",
      python: "sort(key: str | Callable = None, reverse: bool = False) -> PipeStage",
    },
    description:
      "sort orders an array of primitive values or objects by a specified property key or comparison function.",
    imports: {
      js: [
        'import { cat, sort } from "usr";\nawait cat("/users").pipe(sort("name"));',
      ],
      python: [
        'from usr import cat, sort\ncat("/users") | sort("name")',
      ],
    },
    options: [],
    examples: [
      {
        title: "Sort alphabetically by name",
        js: 'import { cat, sort } from "usr";\n\nconst alphabetical = await cat("https://api.site.com/users")\n  .pipe(sort("name"));',
        python: 'from usr import cat, sort\n\nalphabetical = cat("https://api.site.com/users") | sort("name")',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["uniq", "grep", "head"],
  },
  uniq: {
    cmd: "uniq",
    section: 1,
    category: "pipe",
    summary: "drop duplicate values or records",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "uniq(key?: string): PipeStage",
      python: "uniq(key: str = None) -> PipeStage",
    },
    description:
      "uniq eliminates duplicate elements from an array, optionally comparing by a specified property key.",
    imports: {
      js: [
        'import { cat, uniq } from "usr";\nawait cat("/tags").pipe(uniq());',
      ],
      python: [
        'from usr import cat, uniq\ncat("/tags") | uniq()',
      ],
    },
    options: [],
    examples: [
      {
        title: "Deduplicate unique roles",
        js: 'import { cat, cut, uniq } from "usr";\n\nconst roles = await cat("https://api.site.com/users")\n  .pipe(cut("role"))\n  .pipe(uniq("role"));',
        python: 'from usr import cat, cut, uniq\n\nroles = cat("https://api.site.com/users") | cut("role") | uniq("role")',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["sort", "grep", "wc"],
  },
  wc: {
    cmd: "wc",
    section: 1,
    category: "pipe",
    summary: "count records, lines, or characters",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "wc(): PipeStage",
      python: "wc() -> PipeStage",
    },
    description:
      "wc returns the number of items in an array, lines in a string, or keys in an object.",
    imports: {
      js: [
        'import { cat, grep, wc } from "usr";\nconst count = await cat("/users").pipe(grep({ active: true })).pipe(wc());',
      ],
      python: [
        'from usr import cat, grep, wc\ncount = cat("/users") | grep(active=True) | wc()',
      ],
    },
    options: [],
    examples: [
      {
        title: "Count matching active users",
        js: 'import { cat, grep, wc } from "usr";\n\nconst count = await cat("https://api.site.com/users")\n  .pipe(grep({ active: true }))\n  .pipe(wc());\nconsole.log("Total active users:", count);',
        python: 'from usr import cat, grep, wc\n\ncount = cat("https://api.site.com/users") | grep(active=True) | wc()\nprint("Total active users:", count)',
      },
    ],
    errors: [],
    seeAlso: ["head", "tail", "grep"],
  },
  tee: {
    cmd: "tee",
    section: 1,
    category: "pipe",
    summary: "tap side effects (logging, debugging) while passing data through unchanged",
    httpMethod: "PIPE",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "tee(fn: (data: any) => void): PipeStage",
      python: "tee(fn: Callable[[Any], None]) -> PipeStage",
    },
    description:
      "tee intercepts the pipeline to execute a side-effect function (such as console logging, metrics recording, or debugging inspection) and returns the data untouched.",
    imports: {
      js: [
        'import { cat, tee } from "usr";\nawait cat("/users").pipe(tee(data => console.log(data)));',
      ],
      python: [
        'from usr import cat, tee\ncat("/users") | tee(lambda d: print(d))',
      ],
    },
    options: [],
    examples: [
      {
        title: "Debugging intermediary pipe step",
        js: 'import { cat, grep, tee, head } from "usr";\n\nconst res = await cat("https://api.site.com/users")\n  .pipe(grep({ active: true }))\n  .pipe(tee((items) => console.log("Filtered count:", items.length)))\n  .pipe(head(3));',
        python: 'from usr import cat, grep, tee, head\n\nres = (\n    cat("https://api.site.com/users")\n    | grep(active=True)\n    | tee(lambda items: print("Filtered count:", len(items)))\n    | head(3)\n)',
      },
    ],
    errors: [],
    seeAlso: ["xargs", "grep"],
  },
  xargs: {
    cmd: "xargs",
    section: 1,
    category: "pipe",
    summary: "for each item, run another request and collect the results",
    httpMethod: "PIPE",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "xargs(fn: (item: any) => Promise<any>): PipeStage",
      python: "xargs(fn: Callable[[Any], Any]) -> PipeStage",
    },
    description:
      "xargs maps an array of items concurrently through a sub-request callback function, collecting all child responses into a single combined array.",
    imports: {
      js: [
        'import { cat, xargs } from "usr";\nawait cat("/users").pipe(xargs(u => cat(`/profiles/${u.id}`)));',
      ],
      python: [
        'from usr import cat, xargs\ncat("/users") | xargs(lambda u: cat(f"/profiles/{u[\'id\']}"))',
      ],
    },
    options: [],
    examples: [
      {
        title: "Fan-out detail lookups for each parent item",
        js: 'import { cat, cut, head, xargs } from "usr";\n\nconst profiles = await cat("https://api.site.com/users")\n  .pipe(head(5))\n  .pipe(xargs(async (user) => {\n    const detail = await cat(`https://api.site.com/profiles/${user.id}`);\n    return detail.data;\n  }));',
        python: 'from usr import cat, head, xargs\n\nprofiles = (\n    cat("https://api.site.com/users")\n    | head(5)\n    | xargs(lambda user: cat(f"https://api.site.com/profiles/{user[\'id\']}").data)\n)',
      },
    ],
    errors: [
      { code: "ERR_BAD_PIPE", desc: "Input data is not an array." },
    ],
    seeAlso: ["tee", "grep"],
  },
};

export const COMMAND_LIST = Object.keys(MAN_COMMANDS);
