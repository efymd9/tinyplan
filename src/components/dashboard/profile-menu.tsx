"use client";

import { useState, useRef, useEffect } from "react";

export function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all rounded-xl px-3 py-2 hover:bg-muted/50 border border-transparent hover:border-border-whisper"
      >
        <span className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {email.charAt(0).toUpperCase()}
        </span>
        <span className="truncate max-w-[160px] hidden lg:inline">{email}</span>
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border-whisper rounded-2xl shadow-elevated py-1.5 z-50">
          <p className="text-xs text-muted-foreground px-4 py-2 truncate border-b border-border-whisper">
            {email}
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/logout"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg mx-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </a>
        </div>
      )}
    </div>
  );
}
