import { networkError, timeoutError, badRequestError, canceledError, tooManyRedirectsError } from "./error";
import { resolveURL, appendQuery, normalizeHeaders, serializeBody, validateStatusDefault } from "./config";
import type { UsrConfig, UsrResponse } from "./types";
import { UsrError } from "./error";

function headersToObj(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v: string, k: string) => {
    out[k] = v;
  });
  return out;
}

export async function dispatch(config: UsrConfig): Promise<UsrResponse> {
  const url = appendQuery(resolveURL(config.baseURL, String(config.url)), config.params);
  const headers = normalizeHeaders({ "accept": "application/json", ...config.headers });
  const { body, headers: bodyHeaders } = serializeBody(config.data, headers);

  const controller = new AbortController();
  const signal = config.signal ?? controller.signal;
  let abortReject: ((reason: unknown) => void) | null = null;
  signal.addEventListener("abort", () => {
    if (abortReject) abortReject(canceledError(config));
    controller.abort();
  });

  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_res, rej) => {
    abortReject = rej;
    if (config.timeout && config.timeout > 0) {
      timer = setTimeout(() => rej(timeoutError(config)), config.timeout * 1000);
    }
  });

  const fetchPromise = fetch(url, {
    method: config.method as string,
    headers: bodyHeaders,
    body,
    signal,
    redirect: config.maxRedirects !== undefined ? "manual" : "follow",
  });

  let response: Response;
  try {
    response = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (e) {
    if (timer) clearTimeout(timer);
    if (e instanceof UsrError) throw e;
    throw networkError((e as Error).message, config);
  }
  if (timer) clearTimeout(timer);

  if (config.maxRedirects !== undefined && response.redirected) {
    throw tooManyRedirectsError(config, {
      data: await response.text().catch(() => ""),
      status: response.status,
      statusText: response.statusText,
      headers: headersToObj(response.headers),
      config,
      request: response,
    } as UsrResponse);
  }

  const status = response.status;
  const validateStatus = config.validateStatus ?? validateStatusDefault;
  let data: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  const isJSON = contentType.includes("application/json");
  const text = await response.text();

  try {
    data = isJSON ? JSON.parse(text) : text;
  } catch {
    data = text;
  }

  const res: UsrResponse = {
    data,
    status,
    statusText: response.statusText,
    headers: headersToObj(response.headers),
    config,
    request: response,
  };

  if (config.transformResponse) {
    try { res.data = config.transformResponse(String(res.data), res.headers); } catch { /* keep raw */ }
  }

  if (!validateStatus(status)) {
    throw badRequestError(`Request failed with status ${status}`, config, res);
  }

  return res;
}
