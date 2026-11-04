import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { getNextVersion, nextVersion } from "../scripts/bump-version.js";

describe("version rollover rules", () => {
  it("increments patch from 0.0.0 to 0.0.1", () => {
    assert.strictEqual(getNextVersion("0.0.0"), "0.0.1");
    assert.strictEqual(nextVersion("v0.0.0"), "0.0.1");
  });
  it("rolls over patch 9 to minor: 0.0.9 -> 0.1.0", () => {
    assert.strictEqual(getNextVersion("0.0.9"), "0.1.0");
    assert.strictEqual(nextVersion("v0.0.9"), "0.1.0");
  });
  it("increments patch: 0.1.0 -> 0.1.1", () => {
    assert.strictEqual(getNextVersion("0.1.0"), "0.1.1");
  });
  it("rolls over patch 9 to minor: 0.1.9 -> 0.2.0", () => {
    assert.strictEqual(getNextVersion("0.1.9"), "0.2.0");
  });
  it("rolls over minor 99 to major: 0.99.9 -> 1.0.0", () => {
    assert.strictEqual(getNextVersion("0.99.9"), "1.0.0");
  });
  it("continues rollover after 1.0.0: 1.0.9 -> 1.1.0", () => {
    assert.strictEqual(getNextVersion("1.0.9"), "1.1.0");
  });
  it("continues rollover after 1.0.0: 1.99.9 -> 2.0.0", () => {
    assert.strictEqual(getNextVersion("1.99.9"), "2.0.0");
  });
  it("root VERSION file matches version.json with v prefix", () => {
    const rootDir = path.resolve(import.meta.dirname, "..");
    const versionJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, "version.json"), "utf8"),
    );
    const versionFile = fs.readFileSync(path.join(rootDir, "VERSION"), "utf8").trim();
    assert.strictEqual(versionFile, `v${versionJson.version}`);
  });
});
