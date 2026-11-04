import { describe, it } from "node:test";
import { createServer } from "node:http";
import assert from "node:assert";
import * as usr from "../dist/index.js";
import { dispatch } from "../dist/adapter.js";

async function withServer(fn) {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      const status = req.url === "/missing" ? 404 : 200;
      res.statusCode = status;
      res.end(JSON.stringify({ method: req.method, url: req.url, body, status }));
    });
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  try {
    return await fn(base);
  } finally {
    server.close();
  }
}

describe("commands map to HTTP methods", async (t) => {
  await withServer(async (base) => {
    const c = usr.cd(base);
    const cases = [
      ["cat", "GET"],
      ["touch", "POST"],
      ["mv", "PUT"],
      ["sed", "PATCH"],
      ["rm", "DELETE"],
      ["stat", "HEAD"],
      ["man", "OPTIONS"],
    ];
    for (const [cmd, method] of cases) {
      const body = ["touch", "mv", "sed"].includes(cmd) ? { a: 1 } : undefined;
      const res = await c[cmd](`${base}/x`, body);
      assert.strictEqual(res.status, 200);
      if (method !== "HEAD") assert.strictEqual(res.data.method, method);
    }
  });
});

describe("flags string form parses headers/query/timeout", () => {
  const flags = usr.parseFlagString(
    "-H 'X-Tok: abc' -m 5 -q a=1 -q b=2 https://api.site.com/x",
  );
  it("url", () => assert.strictEqual(flags.url, "https://api.site.com/x"));
  it("headers", () => assert.deepStrictEqual(flags.headers, { "X-Tok": "abc" }));
  it("timeout", () => assert.strictEqual(flags.timeout, 5));
  it("params", () => assert.deepStrictEqual(flags.params, { a: "1", b: "2" }));
});

describe("pipes compose", () => {
  const p = usr
    .pipeable([
      { name: "Ada", active: true },
      { name: "Bob", active: false },
    ])
    .pipe(usr.grep({ active: true }))
    .pipe(usr.cut("name"))
    .pipe(usr.head(5));
  it("result", () => assert.deepStrictEqual(p.data, [{ name: "Ada" }]));
});

describe("wc counts items", () => {
  const n = usr.pipeable([1, 2, 3]).pipe(usr.wc()).data;
  it("count", () => assert.strictEqual(n, 3));
});

describe("tee passes through and runs side effect", () => {
  let seen = null;
  const p = usr
    .pipeable([1, 2])
    .pipe(usr.tee((d) => (seen = d)))
    .pipe(usr.head(1));
  it("passes through", () => assert.deepStrictEqual(p.data, [1]));
  it("side effect", () => assert.deepStrictEqual(seen, [1, 2]));
});

describe("UsrError carries code/status/response", () => {
  it("404 throws ERR_BAD_REQUEST", async () => {
    await withServer(async (base) => {
      const c = usr.cd(base);
      try {
        await c.cat(`${base}/missing`);
        assert.fail("should have thrown");
      } catch (e) {
        assert.strictEqual(e.code, "ERR_BAD_REQUEST");
        assert.strictEqual(e.status, 404);
        assert.ok(e.response);
        assert.ok(e.toJSON);
      }
    });
  });
});

describe("dispatch maps 404 to ERR_BAD_REQUEST", () => {
  it("error mapping", async () => {
    const server = createServer((req, res) => {
      res.statusCode = 404;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: false }));
    });
    await new Promise((r) => server.listen(0, r));
    const port = server.address().port;
    try {
      try {
        await dispatch({ url: `http://127.0.0.1:${port}/missing`, method: "GET" });
        assert.fail("should have thrown");
      } catch (e) {
        assert.strictEqual(e.code, "ERR_BAD_REQUEST");
        assert.strictEqual(e.status, 404);
      }
    } finally {
      server.close();
    }
  });
});

describe("request/response traps run", async () => {
  await withServer(async (base) => {
    const c = usr.cd(base);
    const reqCalls = [];
    const resCalls = [];
    c.trap("request", (cfg) => {
      reqCalls.push(cfg);
      cfg.headers = { ...cfg.headers, "X-Trap": "yes" };
      return cfg;
    });
    c.trap("response", (res) => {
      resCalls.push(res.status);
      return res;
    });
    const r = await c.cat(`${base}/x`);
    assert.strictEqual(reqCalls.length, 1);
    assert.strictEqual(resCalls.length, 1);
    assert.strictEqual(r.status, 200);
  });
});
