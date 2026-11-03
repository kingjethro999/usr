import type { UsrConfig, UsrResponse } from "./types";

const CREDENTIAL_KEYS = /^(authorization|cookie|x-api-key|proxy-authorization|set-cookie)$/i;

function redact(obj: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = CREDENTIAL_KEYS.test(k) ? "[REDACTED]" : String(v);
  }
  return out;
}

export class UsrError extends Error {
  name = "UsrError";
  code: string;
  status?: number;
  config?: UsrConfig;
  response?: UsrResponse;
  request?: unknown;
  isAxiosError = false;
  toJSON: () => Record<string, unknown>;

  constructor(message: string, opts: {
    code?: string;
    config?: UsrConfig;
    response?: UsrResponse;
    request?: unknown;
    status?: number;
  } = {}) {
    super(message);
    this.code = opts.code ?? "ERR_UNKNOWN";
    this.status = opts.status;
    this.config = opts.config;
    this.response = opts.response;
    this.request = opts.request;
    this.name = "UsrError";
    Object.setPrototypeOf(this, UsrError.prototype);

    this.toJSON = () => ({
      message: this.message,
      name: this.name,
      code: this.code,
      status: this.status,
      config: opts.config ? { ...opts.config, headers: redact(opts.config.headers ?? {}) } : undefined,
      response: opts.response
        ? { data: opts.response.data, status: opts.response.status, statusText: opts.response.statusText, headers: redact(opts.response.headers), config: opts.response.config, request: opts.response.request }
        : undefined,
      request: opts.request,
    });
  }
}

function networkError(message: string, config?: UsrConfig, request?: unknown): UsrError {
  return new UsrError(message, { code: "ERR_NETWORK", config, request });
}

function timeoutError(config?: UsrConfig, request?: unknown): UsrError {
  return new UsrError("Request timed out", { code: "ETIMEDOUT", config, request });
}

function badRequestError(message: string, config?: UsrConfig, response?: UsrResponse): UsrError {
  return new UsrError(message, { code: "ERR_BAD_REQUEST", config, response, status: response?.status });
}

function badResponseError(message: string, config?: UsrConfig, response?: UsrResponse): UsrError {
  return new UsrError(message, { code: "ERR_BAD_RESPONSE", config, response, status: response?.status });
}

function canceledError(config?: UsrConfig, request?: unknown): UsrError {
  return new UsrError("Request canceled", { code: "ERR_CANCELED", config, request });
}

function invalidUrlError(message: string, config?: UsrConfig): UsrError {
  return new UsrError(message, { code: "ERR_INVALID_URL", config });
}

function tooManyRedirectsError(config?: UsrConfig, response?: UsrResponse): UsrError {
  return new UsrError("Too many redirects", { code: "ERR_TOO_MANY_REDIRECTS", config, response, status: response?.status });
}

export { networkError, timeoutError, badRequestError, badResponseError, canceledError, invalidUrlError, tooManyRedirectsError, redact };
