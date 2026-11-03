import { createDispatcher, request as rawRequest } from "./request";
import { mergeConfig } from "./config";
import { pipeable } from "./pipe";
import type { UsrConfig, UsrInstance, UsrResponse } from "./types";

interface TrapEntry {
  kind: "request" | "response";
  fn: (value: unknown) => unknown;
  synchronous?: boolean;
  runWhen?: (config: UsrConfig) => boolean;
}

class UsrClient implements UsrInstance {
  defaults: UsrConfig;
  private traps: TrapEntry[] = [];

  constructor(baseConfig: UsrConfig = {}) {
    this.defaults = { ...baseConfig };
  }

  private runRequestTraps(config: UsrConfig): UsrConfig | Promise<UsrConfig> {
    let result: UsrConfig = config;
    for (const t of this.traps) {
      if (t.kind !== "request") continue;
      if (t.runWhen && !t.runWhen(config)) continue;
      const out = t.fn(config);
      if (out !== undefined) result = out as UsrConfig;
    }
    return result;
  }

  private async runResponseTraps(response: UsrResponse): Promise<UsrResponse> {
    let result: UsrResponse = response;
    for (const t of this.traps) {
      if (t.kind !== "response") continue;
      const out = await Promise.resolve(t.fn(result));
      if (out !== undefined) result = out as UsrResponse;
    }
    return result;
  }

  cat = (url: string, options?: UsrConfig) => this._call("cat", url, undefined, options);
  touch = (url: string, data?: unknown, options?: UsrConfig) => this._call("touch", url, data, options);
  mv = (url: string, data?: unknown, options?: UsrConfig) => this._call("mv", url, data, options);
  sed = (url: string, data?: unknown, options?: UsrConfig) => this._call("sed", url, data, options);
  rm = (url: string, options?: UsrConfig) => this._call("rm", url, undefined, options);
  stat = (url: string, options?: UsrConfig) => this._call("stat", url, undefined, options);
  man = (url: string, options?: UsrConfig) => this._call("man", url, undefined, options);

  request = (config: UsrConfig & { method: string }): Promise<UsrResponse> => {
    const merged = mergeConfig(this.defaults, config) as UsrConfig & { method: string };
    return rawRequest(merged).then(async (r) => this.withPipe(await this.runResponseTraps(r)));
  };

  private _call(method: MethodLike, url: string, data: unknown, options?: UsrConfig): Promise<UsrResponse> {
    const base = mergeConfig(this.defaults, options ?? {});
    const dispatch = createDispatcher(base, method);
    const p = dispatch(url, data);
    return p.then(async (res) => this.withPipe(await this.runResponseTraps(res)));
  }

  private withPipe(res: UsrResponse): UsrResponse {
    const p = pipeable(res.data);
    (res as UsrResponse & { pipe: (stage: (input: unknown) => unknown) => unknown }).pipe = (stage) => p.pipe(stage);
    return res;
  }

  trap(kind: "request" | "response", fn: (value: unknown) => unknown, options: { synchronous?: boolean; runWhen?: (config: UsrConfig) => boolean } = {}): { eject: () => void } {
    const entry: TrapEntry = { kind, fn, synchronous: options.synchronous, runWhen: options.runWhen };
    this.traps.push(entry);
    return {
      eject: () => {
        const i = this.traps.indexOf(entry);
        if (i >= 0) this.traps.splice(i, 1);
      },
    };
  }

  untrap(handle: { eject: () => void }): void {
    handle.eject();
  }

  cd(baseUrl: string, options?: UsrConfig): UsrInstance {
    const next = new UsrClient(mergeConfig(this.defaults, { baseURL: baseUrl, ...options }));
    next.traps = [...this.traps];
    return next;
  }
}

export function cd(baseUrl: string, options?: UsrConfig): UsrInstance {
  return new UsrClient({ baseURL: baseUrl, ...options }).cd(baseUrl, options);
}

export const defaults: UsrConfig = {};

export function createUsr(): UsrInstance {
  const client = new UsrClient();
  return {
    cat: client.cat.bind(client),
    touch: client.touch.bind(client),
    mv: client.mv.bind(client),
    sed: client.sed.bind(client),
    rm: client.rm.bind(client),
    stat: client.stat.bind(client),
    man: client.man.bind(client),
    request: client.request.bind(client),
    trap: client.trap.bind(client),
    untrap: client.untrap.bind(client),
    cd: client.cd.bind(client),
    defaults,
  };
}

type MethodLike = "cat" | "touch" | "mv" | "sed" | "rm" | "stat" | "man";
