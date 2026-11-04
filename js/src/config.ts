import { invalidUrlError } from "./error";
import type { UsrConfig } from "./types";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mergeConfig(defaults: UsrConfig, config: UsrConfig): UsrConfig {
  const merged: UsrConfig = { ...defaults };
  for (const [key, value] of Object.entries(config)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (key === "headers" && isPlainObject(merged.headers) && isPlainObject(value)) {
      merged.headers = { ...merged.headers, ...value } as Record<string, string>;
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

export function validateStatusDefault(status: number): boolean {
  return status >= 200 && status < 300;
}

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

export function resolveURL(baseURL: string | undefined, url: string): string {
  if (!url) throw invalidUrlError("URL is required");
  try {
    const resolved = new URL(url, baseURL ?? undefined);
    if (!ALLOWED_SCHEMES.has(resolved.protocol)) {
      throw invalidUrlError(`Unsupported scheme: ${resolved.protocol}`);
    }
    return resolved.href;
  } catch (e) {
    if (e instanceof TypeError || (e as Error).name === "TypeError") {
      throw invalidUrlError(`Invalid URL: ${url}`);
    }
    throw e;
  }
}

export function buildQueryString(
  params: Record<string, string | number | boolean>,
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    parts.push(`${encodeURIComponent(String(k))}=${encodeURIComponent(String(v))}`);
  }
  return parts.join("&");
}

export function appendQuery(
  url: string,
  params?: Record<string, string | number | boolean>,
): string {
  if (!params || Object.keys(params).length === 0) return url;
  const qs = buildQueryString(params);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${qs}`;
}

export function normalizeHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (FORBIDDEN_KEYS.has(k)) continue;
    out[k] = String(v);
  }
  return out;
}

export function serializeBody(
  data: unknown,
  headers: Record<string, string>,
): { body: string | null; headers: Record<string, string> } {
  if (data === null || data === undefined) return { body: null, headers };
  if (typeof data === "string") {
    headers["content-type"] ??= "text/plain";
    return { body: data, headers };
  }
  if (isPlainObject(data)) {
    headers["content-type"] ??= "application/json";
    return { body: JSON.stringify(data), headers };
  }
  headers["content-type"] ??= "application/json";
  return { body: JSON.stringify(data), headers };
}
