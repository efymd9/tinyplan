// src/lib/i18n/index.ts
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { type Locale, defaultLocale } from "./config";

export * from "./config";

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** Back-compat alias. */
export function t(locale: Locale = defaultLocale): Dictionary {
  return getDictionary(locale);
}

export type { Dictionary };
