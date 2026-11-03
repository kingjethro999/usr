"""USR Python package tests against a local mock HTTP server."""

import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

from usr import cat, touch, mv, sed, rm, stat, man, UsrError, cd, grep, head, cut, pipeable, wc
from usr import aio


class Handler(BaseHTTPRequestHandler):
    def _respond(self, status=200, body=None):
        if body is None:
            body = {"ok": True}
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        self._respond(404 if self.path == "/missing" else 200, {"method": "GET", "path": self.path, "headers": dict(self.headers)})

    def do_POST(self):
        length = int(self.headers.get("content-length", 0))
        self.rfile.read(length)
        self._respond(200, {"method": "POST", "path": self.path, "headers": dict(self.headers)})

    def do_PUT(self):
        length = int(self.headers.get("content-length", 0))
        self.rfile.read(length)
        self._respond(200, {"method": "PUT", "path": self.path, "headers": dict(self.headers)})

    def do_PATCH(self):
        length = int(self.headers.get("content-length", 0))
        self.rfile.read(length)
        self._respond(200, {"method": "PATCH", "path": self.path, "headers": dict(self.headers)})

    def do_DELETE(self):
        self._respond(200, {"method": "DELETE", "path": self.path})

    def do_HEAD(self):
        self.send_response(404 if self.path == "/missing" else 200)
        self.end_headers()

    def do_OPTIONS(self):
        self._respond(200, {"method": "OPTIONS", "path": self.path})

    def log_message(self, *args):  # silence
        pass


class USRTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), Handler)
        cls.port = cls.server.server_address[1]
        cls.base = f"http://127.0.0.1:{cls.port}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def test_get_post_put_patch_delete_head_options(self):
        cases = [
            ("cat", "GET"),
            ("touch", "POST"),
            ("mv", "PUT"),
            ("sed", "PATCH"),
            ("rm", "DELETE"),
            ("stat", "HEAD"),
            ("man", "OPTIONS"),
        ]
        for cmd, method in cases:
            fn = {"cat": cat, "touch": touch, "mv": mv, "sed": sed,
                  "rm": rm, "stat": stat, "man": man}[cmd]
            data = {"a": 1} if cmd in ("touch", "mv", "sed") else None
            r = fn(f"{self.base}/x", data)
            self.assertEqual(r.status, 200)
            if method != "HEAD":
                self.assertEqual(r.data["method"], method)

    def test_404_error_code(self):
        with self.assertRaises(UsrError) as ctx:
            cat(f"{self.base}/missing")
        self.assertEqual(ctx.exception.code, "ERR_BAD_REQUEST")
        self.assertEqual(ctx.exception.status, 404)
        self.assertIsNotNone(ctx.exception.to_json())

    def test_scoped_client_headers(self):
        api = cd(self.base, options={"headers": {"X-Tok": "abc"}})
        r = api.cat(f"{self.base}/x")
        hdrs = {str(k).lower(): v for k, v in r.data.get("headers", {}).items()}
        self.assertEqual(hdrs.get("x-tok"), "abc")

    def test_traps(self):
        api = cd(self.base)
        req_calls, res_calls = [], []
        api.trap("request", lambda cfg: (req_calls.append(cfg), cfg)[1])
        api.trap("response", lambda res: (res_calls.append(res["status"]), res)[1])
        r = api.cat(f"{self.base}/x")
        self.assertEqual(len(req_calls), 1)
        self.assertEqual(len(res_calls), 1)
        self.assertEqual(r.status, 200)

    def test_pipe_operator(self):
        items = [{"name": "Ada", "active": True}, {"name": "Bob", "active": False}]
        p = pipeable(items) | grep({"active": True}) | cut("name") | head(5)
        self.assertEqual(p.data, [{"name": "Ada"}])

    def test_wc(self):
        self.assertEqual((pipeable([1, 2, 3]) | wc()).data, 3)

    def test_flag_string_parse(self):
        from usr._flags import parse_flags_string, normalize_flags
        f = parse_flags_string("-H 'X-Tok: abc' -m 5 -q a=1 -q b=2 https://api.site.com/x")
        self.assertEqual(f["url"], "https://api.site.com/x")
        cfg = normalize_flags(f)
        self.assertEqual(cfg["headers"], {"X-Tok": "abc"})
        self.assertEqual(cfg["timeout"], 5)
        self.assertEqual(cfg["params"], {"a": "1", "b": "2"})

    def test_async(self):
        async def main():
            client = await aio.cd(self.base)
            r = await client.cat(f"{self.base}/x")
            return r.status, r.data.get("method")
        status, method = __import__("asyncio").run(main())
        self.assertEqual(status, 200)
        self.assertEqual(method, "GET")

    def test_flag_ok(self):
        from usr._flags import normalize_flags
        cfg = normalize_flags({"ok": True, "url": "https://x.com"})
        self.assertTrue(cfg["validate_status"](500))


if __name__ == "__main__":
    unittest.main()
