"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  type AdminDict,
  type AdminLang,
  DEFAULT_ADMIN_LANG,
  getAdminDict,
  isAdminLang,
} from "@/lib/admin-i18n/dictionary";

const STORAGE_KEY = "tinyplan_admin_lang";

interface AdminLangCtx {
  lang: AdminLang;
  dict: AdminDict;
  setLang: (lang: AdminLang) => void;
}

const Ctx = createContext<AdminLangCtx | null>(null);

// ── Tiny external store for the admin-language preference ──────────────────────
// Backed by `localStorage` and read via `useSyncExternalStore` so the value is
// sourced from the browser (an external system) without a setState-in-effect.
// `getServerSnapshot` returns the default, so the first client render matches
// the server output (no hydration mismatch); the stored value is adopted on the
// post-hydration pass. Scoped entirely to `/admin` — it never touches the public
// app's locale, routes, or cookies.
const listeners = new Set<() => void>();
let cached: AdminLang | null = null;

function readStored(): AdminLang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAdminLang(stored)) return stored;
  } catch {
    // localStorage unavailable (private mode etc.) — fall back to default.
  }
  return DEFAULT_ADMIN_LANG;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Keep tabs in sync when the preference changes elsewhere.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): AdminLang {
  if (cached === null) cached = readStored();
  return cached;
}

function getServerSnapshot(): AdminLang {
  return DEFAULT_ADMIN_LANG;
}

function persistLang(next: AdminLang): void {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore persistence failures; in-memory preference still applies.
  }
  for (const listener of listeners) listener();
}

/**
 * Admin-only language context. Scoped entirely to the `/admin` UI — it does NOT
 * touch the public app's locale, routes, cookies, or the `[lang]` segment. The
 * preference is persisted to `localStorage` so it survives reloads but never
 * leaves the browser.
 */
export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<AdminLangCtx>(
    () => ({ lang, dict: getAdminDict(lang), setLang: persistLang }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminLang(): AdminLangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminLang must be used within AdminLangProvider");
  return ctx;
}

export function useAdminDict(): AdminDict {
  return useAdminLang().dict;
}

/** EN/RU segmented toggle for the admin header. */
export function AdminLangSwitcher() {
  const { lang, setLang, dict } = useAdminLang();
  const options: AdminLang[] = ["en", "ru"];
  return (
    <div
      role="group"
      aria-label={dict.switchLanguage}
      className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs"
    >
      {options.map((opt) => {
        const active = opt === lang;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setLang(opt)}
            aria-pressed={active}
            className={`px-2.5 py-0.5 rounded-full font-medium uppercase transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
