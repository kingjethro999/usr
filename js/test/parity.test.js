import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as usr from "../dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosPath = path.resolve(__dirname, "../../test-parity/scenarios.json");
const scenarios = JSON.parse(fs.readFileSync(scenariosPath, "utf8"));

describe("cross-language parity (JS)", () => {
  it("flag strings parity", () => {
    for (const testCase of scenarios.flag_strings) {
      const parsed = usr.parseFlagString(testCase.input);
      assert.strictEqual(parsed.url, testCase.expected_url);
      if (testCase.expected_headers) {
        assert.deepStrictEqual(parsed.headers, testCase.expected_headers);
      }
      if (testCase.expected_timeout !== undefined) {
        assert.strictEqual(parsed.timeout, testCase.expected_timeout);
      }
      if (testCase.expected_params) {
        assert.deepStrictEqual(parsed.params, testCase.expected_params);
      }
    }
  });

  it("pipes parity", () => {
    for (const p of scenarios.pipe_tests) {
      let stageFn;
      if (p.stage === "grep") {
        stageFn = usr.grep(p.arg);
      } else if (p.stage === "head") {
        stageFn = usr.head(p.arg);
      } else if (p.stage === "tail") {
        stageFn = usr.tail(p.arg);
      } else if (p.stage === "sort") {
        stageFn = usr.sort(p.arg);
      } else if (p.stage === "uniq") {
        stageFn = usr.uniq(p.arg);
      } else if (p.stage === "cut") {
        stageFn = usr.cut(...p.arg);
      } else if (p.stage === "wc") {
        stageFn = usr.wc();
      }

      const res = usr.pipeable(p.input).pipe(stageFn);
      assert.deepStrictEqual(res.data, p.expected, `Failed on pipe stage: ${p.name}`);
    }
  });

  it("pipe error on non-array", () => {
    assert.throws(
      () => usr.pipeable("not-an-array").pipe(usr.wc()),
      (err) => err instanceof usr.UsrError && err.code === "ERR_BAD_PIPE",
    );
  });
});
