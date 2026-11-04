#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const versionJsonPath = path.join(rootDir, "version.json");

export function syncVersion() {
  const versionInfo = JSON.parse(fs.readFileSync(versionJsonPath, "utf8"));
  const { name, version } = versionInfo;

  // 1. js/package.json
  const jsPkgPath = path.join(rootDir, "js", "package.json");
  if (fs.existsSync(jsPkgPath)) {
    const jsPkg = JSON.parse(fs.readFileSync(jsPkgPath, "utf8"));
    jsPkg.name = name;
    jsPkg.version = version;
    fs.writeFileSync(jsPkgPath, JSON.stringify(jsPkg, null, 2) + "\n", "utf8");
  }

  // 2. web/package.json
  const webPkgPath = path.join(rootDir, "web", "package.json");
  if (fs.existsSync(webPkgPath)) {
    const webPkg = JSON.parse(fs.readFileSync(webPkgPath, "utf8"));
    webPkg.version = version;
    fs.writeFileSync(webPkgPath, JSON.stringify(webPkg, null, 2) + "\n", "utf8");
  }

  // 3. py/pyproject.toml
  const pyProjectPath = path.join(rootDir, "py", "pyproject.toml");
  if (fs.existsSync(pyProjectPath)) {
    let pyContent = fs.readFileSync(pyProjectPath, "utf8");
    pyContent = pyContent.replace(/^name\s*=\s*".*"/m, `name = "${name}"`);
    pyContent = pyContent.replace(/^version\s*=\s*".*"/m, `version = "${version}"`);
    fs.writeFileSync(pyProjectPath, pyContent, "utf8");
  }

  return versionInfo;
}

if (process.argv[1] === __filename) {
  const res = syncVersion();
  console.log(`Synced version ${res.version} and name ${res.name} across workspaces.`);
}
