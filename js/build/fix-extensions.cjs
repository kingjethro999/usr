const { readdirSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const dist = join(__dirname, "..", "dist");
const EXT_RE = /\.(js|mjs|cjs|ts|tsx|json)($|\?)/;

function fix(spec) {
  if (!spec.startsWith(".")) return spec;
  if (EXT_RE.test(spec)) return spec;
  const base = spec.split("?")[0].split("#")[0];
  if (/\.[^\/]+$/.test(base)) return spec;
  return spec + ".js";
}

const files = readdirSync(dist).filter((f) => f.endsWith(".js") && !f.endsWith(".cjs"));
for (const f of files) {
  const p = join(dist, f);
  let src = readFileSync(p, "utf8");
  const out = src.replace(
    /(from|import)\s+['"](\.\.?\/[^'"]*)['"]/g,
    (m, keyword, spec) => `${keyword} '${fix(spec)}'`
  );
  if (out !== src) writeFileSync(p, out, "utf8");
}
console.log("Fixed relative import extensions in", files.length, "ESM file(s)");
