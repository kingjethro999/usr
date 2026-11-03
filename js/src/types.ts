export type Method =
  | "cat"
  | "touch"
  | "mv"
  | "sed"
  | "rm"
  | "stat"
  | "man"
  | "request";

export interface UsrConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  auth?: { username: string; password: string };
  responseType?: "json" | "text";
  withCredentials?: boolean;
  maxRedirects?: number;
  maxContentLength?: number;
  maxBodyLength?: number;
  signal?: AbortSignal;
  validateStatus?: (status: number) => boolean;
  transformRequest?: (data: unknown, headers: Record<string, string>) => unknown;
  transformResponse?: (data: string, headers: Record<string, string>) => unknown;
  [key: string]: unknown;
}

export interface UsrResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: UsrConfig;
  request: unknown;
}

export interface PipeStage<T = unknown, U = unknown> {
  (input: T): U;
}

export interface UsrInstance {
  cat: (url: string, options?: UsrConfig) => Promise<UsrResponse>;
  touch: (url: string, data?: unknown, options?: UsrConfig) => Promise<UsrResponse>;
  mv: (url: string, data?: unknown, options?: UsrConfig) => Promise<UsrResponse>;
  sed: (url: string, data?: unknown, options?: UsrConfig) => Promise<UsrResponse>;
  rm: (url: string, options?: UsrConfig) => Promise<UsrResponse>;
  stat: (url: string, options?: UsrConfig) => Promise<UsrResponse>;
  man: (url: string, options?: UsrConfig) => Promise<UsrResponse>;
  request: (config: UsrConfig & { method: string }) => Promise<UsrResponse>;
  trap: (kind: "request" | "response", fn: Function) => { eject: () => void };
  untrap: (handle: { eject: () => void }) => void;
  cd: (baseUrl: string, options?: UsrConfig) => UsrInstance;
  defaults: UsrConfig;
}
