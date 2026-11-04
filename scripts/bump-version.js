#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncVersion } from "./sync-version.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const versionJsonPath = path.join(rootDir, "version.json");

export function getNextVersion(currentVersion) {
  const parts = currentVersion.trim().split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${currentVersion}`);
  }
  let [major, minor, patch] = parts;
  if (patch < 9) {
    patch += 1;
  } else {
    patch = 0;
    if (minor < 99) {
      minor += 1;
    } else {
      minor = 0;
      major += 1;
    }
  }
  return `${major}.${minor}.${patch}`;
}

export function nextVersion(currentVersion) {
  const clean = currentVersion.trim().replace(/^v/, "");
  return getNextVersion(clean);
}

export function bumpVersionFile() {
  const raw = fs.readFileSync(versionJsonPath, "utf8");
  const data = JSON.parse(raw);
  const next = getNextVersion(data.version);
  data.version = next;
  fs.writeFileSync(versionJsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  syncVersion();
  return next;
}

if (process.argv[1] === __filename) {
  const next = bumpVersionFile();
  console.log(`Bumped version to ${next}`);
}
