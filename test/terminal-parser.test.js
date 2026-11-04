import { describe, it } from "node:test";
import assert from "node:assert";
import { parseTerminalLine } from "../web/lib/terminal-parser.ts";

describe("terminal parser", () => {
  it("splits simple command", () => {
    const res = parseTerminalLine("cat /users");
    assert.strictEqual(res.command, "cat");
    assert.deepStrictEqual(res.args, ["/users"]);
    assert.strictEqual(res.pipes.length, 0);
  });

  it("handles pipes", () => {
    const res = parseTerminalLine("cat /users | grep Ada | head 1");
    assert.strictEqual(res.command, "cat");
    assert.deepStrictEqual(res.args, ["/users"]);
    assert.strictEqual(res.pipes.length, 2);
    assert.strictEqual(res.pipes[0].stage, "grep");
    assert.deepStrictEqual(res.pipes[0].args, ["Ada"]);
    assert.strictEqual(res.pipes[1].stage, "head");
    assert.deepStrictEqual(res.pipes[1].args, ["1"]);
  });

  it("handles quoted arguments with spaces", () => {
    const res = parseTerminalLine("touch /users -d '{\"name\":\"Ada Lovelace\"}'");
    assert.strictEqual(res.command, "touch");
    assert.deepStrictEqual(res.args, ["/users", "-d", '{"name":"Ada Lovelace"}']);
  });

  it("handles flags and url", () => {
    const res = parseTerminalLine("cat -H 'X-Test: 1' -m 5 /posts");
    assert.strictEqual(res.command, "cat");
    assert.deepStrictEqual(res.args, ["-H", "X-Test: 1", "-m", "5", "/posts"]);
  });
});
