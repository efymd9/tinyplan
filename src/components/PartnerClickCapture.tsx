"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

function hasPartnerCookie() {
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith("pn_click="));
}

// Captures the affiliate-network click_id into a 60-day cookie. A partner's link
// routes through the network /r redirect, landing on tinyplan.org/?click_id=<id>
// (the locale proxy preserves the query string). The checkout route reads this
// cookie and attaches it to the Stripe subscription metadata.
//
// Privacy hardening: do not load the third-party partner SDK for organic users.
// Only affiliate-attributed sessions (fresh click_id or existing pn_click cookie)
// load it so the partner's PageView pixel can run for those visitors.
export function PartnerClickCapture() {
  const [shouldLoadSdk, setShouldLoadSdk] = useState(false);

  useEffect(() => {
    try {
      const cid = new URLSearchParams(window.location.search).get("click_id");
      if (cid && /^[\w.-]{1,128}$/.test(cid)) {
        document.cookie = `pn_click=${encodeURIComponent(cid)}; Max-Age=5184000; Path=/; SameSite=Lax`;
        window.requestAnimationFrame(() => setShouldLoadSdk(true));
        return;
      }

      const loadSdk = hasPartnerCookie();
      window.requestAnimationFrame(() => setShouldLoadSdk(loadSdk));
    } catch {
      /* ignore */
    }
  }, []);

  return shouldLoadSdk ? (
    <Script src="https://partnernetwork.space/sdk.js" strategy="afterInteractive" />
  ) : null;
}
