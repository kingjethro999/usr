import { describe, it } from "node:test";
import assert from "node:assert";
import { getNextVersion } from "../scripts/bump-version.js";

describe("version rollover rules", () => {
  it("increments patch from 0.0.0 to 0.0.1", () => {
    assert.strictEqual(getNextVersion("0.0.0"), "0.0.1");
  });
  it("rolls over patch 9 to minor: 0.0.9 -> 0.1.0", () => {
    assert.strictEqual(getNextVersion("0.0.9"), "0.1.0");
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
});
