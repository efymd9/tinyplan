import type { Locale } from "@/lib/i18n/config";
import { SOS_SCRIPTS_EN } from "./sos-scripts.en";
import { SOS_SCRIPTS_ES } from "./sos-scripts.es";

export interface SosScript {
  id: string;
  title: string;
  icon: string;
  situation: string;
  firstThirtySeconds: string;
  whatToSay: string;
  whatNotToDo: string;
  afterCalm: string;
  tinyNextStep: string;
}

/** Returns the SOS scripts for the given locale (Spanish by default). */
export function getSosScripts(locale: Locale): SosScript[] {
  return locale === "es" ? SOS_SCRIPTS_ES : SOS_SCRIPTS_EN;
}

/** Back-compat: original export, points to the English scripts. */
export const sosScripts: SosScript[] = SOS_SCRIPTS_EN;

export { SOS_SCRIPTS_EN, SOS_SCRIPTS_ES };
