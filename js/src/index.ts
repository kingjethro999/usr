import { createUsr, defaults, cd } from "./client";
import { UsrError } from "./error";
import { parseFlagString } from "./flags";
import {
  grep,
  head,
  tail,
  sort,
  uniq,
  cut,
  wc,
  tee,
  xargs,
  pipeable,
  PipeError,
} from "./pipe";
import type { UsrConfig, UsrInstance, UsrResponse, PipeStage } from "./types";

const usr: UsrInstance = createUsr();

export const cat = usr.cat.bind(usr);
export const touch = usr.touch.bind(usr);
export const mv = usr.mv.bind(usr);
export const sed = usr.sed.bind(usr);
export const rm = usr.rm.bind(usr);
export const stat = usr.stat.bind(usr);
export const man = usr.man.bind(usr);
export const request = usr.request.bind(usr);
export const trap = usr.trap.bind(usr);
export const untrap = usr.untrap.bind(usr);

export {
  usr,
  defaults,
  cd,
  UsrError,
  parseFlagString,
  pipeable,
  PipeError,
  grep,
  head,
  tail,
  sort,
  uniq,
  cut,
  wc,
  tee,
  xargs,
};
export type { UsrConfig, UsrResponse, UsrInstance, PipeStage };

export default usr;
