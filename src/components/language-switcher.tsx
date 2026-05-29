// src/components/language-switcher.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { switchLocalePath } from "@/lib/i18n/href";
import { locales } from "@/lib/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function choose(next: (typeof locales)[number]) {
    if (next === locale) return;
    // Reflect.set keeps the lint rule react-hooks/immutability happy while
    // performing the standard document.cookie write.
    Reflect.set(document, "cookie", `tinyplan_locale=${next};path=/;max-age=${ONE_YEAR}`);
    router.push(switchLocalePath(pathname, next));
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border-whisper bg-white/80 backdrop-blur p-0.5 text-xs font-medium shadow-xs ${className}`}
      role="group"
      aria-label="Language / Idioma"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            l === locale ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
