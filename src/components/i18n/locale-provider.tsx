// src/components/i18n/locale-provider.tsx
"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";

type Ctx = { locale: Locale; dict: Dictionary };
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const c = useContext(LocaleContext);
  if (!c) throw new Error("useLocale must be used within LocaleProvider");
  return c.locale;
}

export function useT(): Dictionary {
  const c = useContext(LocaleContext);
  if (!c) throw new Error("useT must be used within LocaleProvider");
  return c.dict;
}
