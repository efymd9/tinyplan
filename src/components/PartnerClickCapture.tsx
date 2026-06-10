"use client";
import { useEffect } from "react";

// Captures the affiliate-network click_id into a 60-day cookie. A partner's link
// routes through the network /r redirect, landing on tinyplan.org/?click_id=<id>
// (the locale proxy preserves the query string). The checkout route reads this
// cookie and attaches it to the Stripe subscription metadata. No-op if absent.
export function PartnerClickCapture() {
  useEffect(() => {
    try {
      const cid = new URLSearchParams(window.location.search).get("click_id");
      if (cid && /^[\w.-]{1,128}$/.test(cid)) {
        document.cookie = `pn_click=${encodeURIComponent(cid)}; Max-Age=5184000; Path=/; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
