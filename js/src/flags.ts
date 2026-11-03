const FLAG_MAP: Record<string, string> = {
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
};

function* tokenize(input: string): Generator<string> {
  let i = 0;
  const n = input.length;
  while (i < n) {
    const ch = input[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      let buf = "";
      while (i < n && input[i] !== quote) {
        if (input[i] === "\\" && i + 1 < n) { buf += input[i + 1]; i += 2; continue; }
        buf += input[i]; i++;
      }
      if (i < n) i++; // skip closing quote
      yield buf;
      continue;
    }
    if (ch === "\\") {
      let buf = "";
      while (i < n && !/\s/.test(input[i]) && input[i] !== "'" && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < n) { buf += input[i + 1]; i += 2; continue; }
        buf += input[i]; i++;
      }
      yield buf;
      continue;
    }
    let buf = "";
    while (i < n && !/\s/.test(input[i]) && input[i] !== "'" && input[i] !== '"') {
      if (input[i] === "\\" && i + 1 < n) { buf += input[i + 1]; i += 2; continue; }
      buf += input[i]; i++;
    }
    yield buf;
  }
}

function parseKV(str: string): [string, string] {
  const idx = str.indexOf("=");
  if (idx === -1) return [str, ""];
  return [str.slice(0, idx), str.slice(idx + 1)];
}

export function parseFlagString(input: string): Record<string, unknown> {
  const tokens = [...tokenize(input)];
  const flags: Record<string, unknown> = {};
  const headers: string[] = [];
  const queries: string[] = [];
  let url = "";

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const mapped = FLAG_MAP[tok];
    if (!mapped) {
      if (!url) { url = tok; continue; }
      throw new Error(`Unexpected token: ${tok}`);
    }
    if (mapped === "ok") { flags.validateStatus = () => true; continue; }
    if (mapped === "silent") { flags.silent = true; continue; }
    if (mapped === "verbose") { flags.verbose = true; continue; }
    if (mapped === "location") { flags.redirect = "follow"; continue; }
    if (i + 1 >= tokens.length) throw new Error(`Missing value for flag ${tok}`);
    const val = tokens[++i];
    if (mapped === "header") { headers.push(val); continue; }
    if (mapped === "query") { queries.push(val); continue; }
    if (mapped === "user") {
      const [user, pass] = val.split(":");
      flags.auth = { username: user, password: pass ?? "" };
      continue;
    }
    if (mapped === "max-time") { flags.timeout = Number(val); continue; }
    if (mapped === "data") { flags.data = val; continue; }
    if (mapped === "output") { flags.output = val; continue; }
  }

  if (headers.length) {
    const h: Record<string, string> = {};
    for (const hdr of headers) {
      const idx = hdr.indexOf(":");
      if (idx === -1) throw new Error(`Invalid header: ${hdr}`);
      h[hdr.slice(0, idx).trim()] = hdr.slice(idx + 1).trim();
    }
    flags.headers = h;
  }
  if (queries.length) {
    const p: Record<string, string> = {};
    for (const q of queries) {
      const [k, v] = parseKV(q);
      p[k] = v;
    }
    flags.params = p;
  }
  if (url) flags.url = url;
  return flags;
}
