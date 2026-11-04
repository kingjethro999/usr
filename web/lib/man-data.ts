export interface ManCommand {
  cmd: string;
  section: number;
  summary: string;
  httpMethod: string;
  safe: boolean;
  idempotent: boolean;
  synopsis: {
    js: string;
    python: string;
  };
  description: string;
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
    summary: "read a remote resource over HTTP (GET)",
    httpMethod: "GET",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "cat(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "cat(url: str, **flags) -> Response",
    },
    description:
      "cat issues an HTTP GET request to retrieve a remote resource representation. It automatically serializes query parameters, resolves relative URLs if called on a scoped client, and parses JSON responses.",
    options: [
      { flag: "-H, --header <k:v>", desc: "Add a custom header to the request (repeatable)." },
      { flag: "-m, --max-time <sec>", desc: "Request timeout in seconds (default none)." },
      { flag: "-q, --query <k=v>", desc: "Append a URL query parameter (repeatable)." },
      { flag: "--ok", desc: "Accept any status code (200-599) without throwing UsrError." },
    ],
    examples: [
      {
        title: "Basic GET request",
        js: 'const res = await usr.cat("https://api.site.com/users");\nconsole.log(res.data);',
        python: 'res = cat("https://api.site.com/users")\nprint(res.data)',
      },
      {
        title: "With query parameters and timeout",
        js: 'const res = await usr.cat("https://api.site.com/users", {\n  "-q": "active=true",\n  "-m": 5\n});',
        python: 'res = cat("https://api.site.com/users", q="active=true", m=5)',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "HTTP 4xx client error returned from server." },
      { code: "ERR_NETWORK", desc: "Network socket failure, DNS resolution failure, or connection refused." },
      { code: "ETIMEDOUT", desc: "Request exceeded max-time timeout limit." },
    ],
    seeAlso: ["touch", "sed", "stat", "rm"],
  },
  touch: {
    cmd: "touch",
    section: 1,
    summary: "create something new over HTTP (POST)",
    httpMethod: "POST",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "touch(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "touch(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "touch sends an HTTP POST request to create a resource or submit data. Plain objects are serialized to JSON with Content-Type: application/json.",
    options: [
      { flag: "-d, --data <json|body>", desc: "Request body payload to transmit." },
      { flag: "-H, --header <k:v>", desc: "Add a custom header to the request." },
      { flag: "-u, --user <u:p>", desc: "Basic authentication credentials." },
      { flag: "--ok", desc: "Do not throw on 4xx/5xx responses." },
    ],
    examples: [
      {
        title: "Create a resource",
        js: 'const res = await usr.touch("https://api.site.com/users", { name: "Ada", role: "admin" });',
        python: 'res = touch("https://api.site.com/users", {"name": "Ada", "role": "admin"})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Validation error or 4xx status from server." },
      { code: "ERR_NETWORK", desc: "Connection failure." },
    ],
    seeAlso: ["cat", "mv", "sed"],
  },
  mv: {
    cmd: "mv",
    section: 1,
    summary: "replace or move a resource over HTTP (PUT)",
    httpMethod: "PUT",
    safe: false,
    idempotent: true,
    synopsis: {
      js: "mv(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "mv(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "mv issues an HTTP PUT request to replace the resource entirely with the provided payload.",
    options: [
      { flag: "-d, --data <body>", desc: "Replacement representation for the remote resource." },
      { flag: "-H, --header <k:v>", desc: "Add a request header." },
    ],
    examples: [
      {
        title: "Replace an item",
        js: 'await usr.mv("https://api.site.com/users/42", { name: "Alan", active: true });',
        python: 'mv("https://api.site.com/users/42", {"name": "Alan", "active": True})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "404 or bad representation error." },
    ],
    seeAlso: ["sed", "touch", "rm"],
  },
  sed: {
    cmd: "sed",
    section: 1,
    summary: "edit a resource in place over HTTP (PATCH)",
    httpMethod: "PATCH",
    safe: false,
    idempotent: false,
    synopsis: {
      js: "sed(url: string, data?: unknown, options?: UsrConfig): Promise<UsrResponse>",
      python: "sed(url: str, data: Any = None, **flags) -> Response",
    },
    description:
      "sed issues an HTTP PATCH request to apply a partial modification to a resource.",
    options: [
      { flag: "-d, --data <patch>", desc: "Partial fields to update." },
      { flag: "-H, --header <k:v>", desc: "Request headers." },
    ],
    examples: [
      {
        title: "Partial update",
        js: 'await usr.sed("https://api.site.com/users/42", { active: false });',
        python: 'sed("https://api.site.com/users/42", {"active": False})',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Server rejected the patch." },
    ],
    seeAlso: ["mv", "touch", "cat"],
  },
  rm: {
    cmd: "rm",
    section: 1,
    summary: "remove a remote resource over HTTP (DELETE)",
    httpMethod: "DELETE",
    safe: false,
    idempotent: true,
    synopsis: {
      js: "rm(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "rm(url: str, **flags) -> Response",
    },
    description:
      "rm deletes a remote HTTP resource. Never touches the local filesystem.",
    options: [
      { flag: "-H, --header <k:v>", desc: "Add headers." },
      { flag: "--ok", desc: "Accept 404 or other statuses without throwing." },
    ],
    examples: [
      {
        title: "Delete a resource",
        js: 'await usr.rm("https://api.site.com/users/42");',
        python: 'rm("https://api.site.com/users/42")',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Resource already deleted or permission denied." },
    ],
    seeAlso: ["cat", "touch"],
  },
  stat: {
    cmd: "stat",
    section: 1,
    summary: "retrieve metadata and headers over HTTP (HEAD)",
    httpMethod: "HEAD",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "stat(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "stat(url: str, **flags) -> Response",
    },
    description:
      "stat issues an HTTP HEAD request. Returns headers and status metadata without downloading the body.",
    options: [
      { flag: "-H, --header <k:v>", desc: "Headers." },
      { flag: "-m, --max-time <sec>", desc: "Timeout." },
    ],
    examples: [
      {
        title: "Inspect headers",
        js: 'const res = await usr.stat("https://api.site.com/large-archive.tar.gz");\nconsole.log(res.headers["content-length"]);',
        python: 'res = stat("https://api.site.com/large-archive.tar.gz")\nprint(res.headers.get("content-length"))',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "4xx status." },
    ],
    seeAlso: ["cat", "man"],
  },
  man: {
    cmd: "man",
    section: 1,
    summary: "query allowed options and capabilities (OPTIONS)",
    httpMethod: "OPTIONS",
    safe: true,
    idempotent: true,
    synopsis: {
      js: "man(url: string, options?: UsrConfig): Promise<UsrResponse>",
      python: "man(url: str, **flags) -> Response",
    },
    description:
      "man issues an HTTP OPTIONS request to ask 'what can I do here?' and inspect the Allow header.",
    options: [
      { flag: "-H, --header <k:v>", desc: "Headers." },
    ],
    examples: [
      {
        title: "Check capabilities",
        js: 'const res = await usr.man("https://api.site.com/users");\nconsole.log(res.headers["allow"]);',
        python: 'res = man("https://api.site.com/users")\nprint(res.headers.get("allow"))',
      },
    ],
    errors: [
      { code: "ERR_BAD_REQUEST", desc: "Endpoint does not support OPTIONS." },
    ],
    seeAlso: ["cat", "stat"],
  },
};

export const COMMAND_LIST = Object.keys(MAN_COMMANDS);
