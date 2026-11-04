import { dispatch } from "./adapter";
import { mergeConfig, validateStatusDefault } from "./config";
import type { UsrConfig, UsrResponse } from "./types";

const NO_BODY_METHODS = new Set(["cat", "rm", "stat", "man"]);

export { NO_BODY_METHODS, METHOD_BY_COMMAND };

const METHOD_BY_COMMAND: Record<MethodLike, string> = {
  cat: "GET",
  touch: "POST",
  mv: "PUT",
  sed: "PATCH",
  rm: "DELETE",
  stat: "HEAD",
  man: "OPTIONS",
};

export function createDispatcher(baseConfig: UsrConfig, method: MethodLike) {
  return async (
    url: string,
    data?: unknown,
    options?: UsrConfig,
  ): Promise<UsrResponse> => {
    const config = mergeConfig(baseConfig, options ?? {}) as UsrConfig & {
      url: string;
      method: string;
    };
    config.url = url;
    config.method = METHOD_BY_COMMAND[method];
    if (data !== undefined && !NO_BODY_METHODS.has(method)) {
      config.data = data;
    }
    config.validateStatus = config.validateStatus ?? validateStatusDefault;
    return dispatch(config);
  };
}

type MethodLike = "cat" | "touch" | "mv" | "sed" | "rm" | "stat" | "man";

export function request(config: UsrConfig & { method: string }): Promise<UsrResponse> {
  return dispatch(mergeConfig({}, config));
}
