const { execSync } = require("child_process");
const { copyFileSync, rmSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const tsc = join(root, "node_modules", ".bin", "tsc");
execSync(`"${tsc}" -p "${join(root, "tsconfig.cjs.json")}" --outDir "${join(root, "dist/cjs")}"`, { stdio: "inherit" });

const cjs = join(root, "dist/cjs");
copyFileSync(join(cjs, "index.js"), join(root, "dist/index.cjs"));
copyFileSync(join(root, "dist/index.d.ts"), join(root, "dist/index.cjs.d.ts"));
rmSync(cjs, { recursive: true, force: true });

console.log("Built dist/index.cjs and dist/index.cjs.d.ts");
