"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] glass-bar shadow-sticky border-t border-border-whisper transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href="/quiz"
        className="flex h-[52px] w-full items-center justify-center rounded-full bg-primary text-[17px] font-semibold text-white cta-glow active:scale-[0.98]"
      >
        Build my free plan
      </Link>
    </div>
  );
}
