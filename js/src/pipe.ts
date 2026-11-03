import { UsrError } from "./error";
import type { UsrResponse } from "./types";

export class PipeError extends UsrError {
  constructor(message: string) {
    super(message, { code: "ERR_BAD_PIPE" });
    this.name = "PipeError";
  }
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function asArray(input: unknown): unknown[] {
  if (!isArray(input)) throw new PipeError("pipe stage requires an array of items");
  return input;
}

function matchItem(item: unknown, match: unknown): boolean {
  if (typeof match === "function") return Boolean((match as Function)(item));
  if (typeof match === "string") {
    const s = JSON.stringify(item);
    return s.includes(match);
  }
  if (isPlainObject(match)) {
    const m = match as Record<string, unknown>;
    if (!isPlainObject(item)) return false;
    return Object.entries(m).every(([k, v]) => (item as Record<string, unknown>)[k] === v);
  }
  return String(item) === String(match);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function grep(match: unknown) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    return arr.filter((item) => matchItem(item, match));
  };
}

export function head(n: number) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    return arr.slice(0, n);
  };
}

export function tail(n: number) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    return arr.slice(-n);
  };
}

export function sort(key?: string | ((a: unknown, b: unknown) => number)) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    const copy = [...arr];
    if (typeof key === "function") {
      return copy.sort(key as (a: unknown, b: unknown) => number);
    }
    if (typeof key === "string") {
      return copy.sort((a, b) => {
        const av = (a as Record<string, unknown>)[key];
        const bv = (b as Record<string, unknown>)[key];
        const sa = av === undefined ? "" : String(av);
        const sb = bv === undefined ? "" : String(bv);
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        return 0;
      });
    }
    return copy.sort();
  };
}

export function uniq(key?: string) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    const seen = new Set<unknown>();
    return arr.filter((item) => {
      const k = key !== undefined ? (item as Record<string, unknown>)[key] : item;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
}

export function cut(...fields: string[]) {
  return (input: unknown): unknown => {
    const arr = asArray(input);
    return arr.map((item) => {
      if (!isPlainObject(item)) throw new PipeError("cut requires objects");
      const out: Record<string, unknown> = {};
      for (const f of fields) out[f] = (item as Record<string, unknown>)[f];
      return out;
    });
  };
}

export function wc() {
  return (input: unknown): number => {
    const arr = asArray(input);
    return arr.length;
  };
}

export function tee(fn: (data: unknown) => void) {
  return (input: unknown): unknown => {
    fn(input);
    return input;
  };
}

export function xargs(fn: (item: unknown) => unknown) {
  return async (input: unknown): Promise<unknown[]> => {
    const arr = asArray(input);
    const results: unknown[] = [];
    for (const item of arr) {
      results.push(await Promise.resolve(fn(item)));
    }
    return results;
  };
}

export function pipeable<T>(data: T) {
  let value: unknown = data;
  return {
    pipe(stage: (input: unknown) => unknown): Pipeable {
      value = stage(value);
      return this;
    },
    get data(): unknown {
      return value;
    },
    [Symbol.toPrimitive]() {
      return value;
    },
  };
}

interface Pipeable {
  pipe(stage: (input: unknown) => unknown): Pipeable;
  data: unknown;
}
