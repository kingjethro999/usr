import { createUsr, defaults, cd } from "./client";
import { UsrError } from "./error";
import { parseFlagString } from "./flags";
import { grep, head, tail, sort, uniq, cut, wc, tee, xargs, pipeable, PipeError } from "./pipe";
import type { UsrConfig, UsrInstance, UsrResponse, PipeStage } from "./types";

const usr: UsrInstance = createUsr();

export { usr, defaults, cd, UsrError, parseFlagString, pipeable, PipeError };
export { grep, head, tail, sort, uniq, cut, wc, tee, xargs };
export type { UsrConfig, UsrResponse, UsrInstance, PipeStage };

export default usr;
