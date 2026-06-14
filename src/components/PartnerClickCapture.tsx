"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  PARTNER_AFFILIATE_FLAG_COOKIE,
  isValidClickId,
} from "@/lib/partner-click";

function hasAffiliateFlag() {
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${PARTNER_AFFILIATE_FLAG_COOKIE}=`));
}

// Decides whether to load the third-party partner SDK for this session. A
// partner's link routes through the network /r redirect, landing on
// tinyplan.org/?click_id=<id> (the locale proxy preserves the query string).
//
// The proxy now PERSISTS the click id server-side (HttpOnly pn_click, read by
// checkout) plus a readable pn_aff flag — so this client component no longer
// writes the cookie (which would be script-spoofable). It only decides SDK
// loading, and only for affiliate-attributed sessions (fresh click_id or the
// pn_aff flag) so the partner pixel never runs for organic users.
export function PartnerClickCapture() {
  const [shouldLoadSdk, setShouldLoadSdk] = useState(false);

  useEffect(() => {
    try {
      const cid = new URLSearchParams(window.location.search).get("click_id");
      const loadSdk = isValidClickId(cid) || hasAffiliateFlag();
      window.requestAnimationFrame(() => setShouldLoadSdk(loadSdk));
    } catch {
      /* ignore */
    }
  }, []);

  return shouldLoadSdk ? (
    <Script src="https://partnernetwork.space/sdk.js" strategy="afterInteractive" />
  ) : null;
}
