"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

const COPY = {
  es: { copy: "Copiar", copied: "Copiado" },
  en: { copy: "Copy", copied: "Copied" },
} as const;

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const locale = useLocale();
  const copy = COPY[locale];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-primary hover:text-primary-hover font-medium px-2.5 py-1.5 rounded-lg hover:bg-primary-light transition-colors min-h-[44px] flex items-center gap-1"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {copy.copied}
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copy.copy}
        </>
      )}
    </button>
  );
}
