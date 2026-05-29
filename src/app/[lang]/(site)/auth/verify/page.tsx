"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const token = params.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error"
  );

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push(localizeHref("/dashboard", locale)), 1500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, router, locale]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-sm w-full text-center shadow-hero animate-fade-up">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="font-medium">Verifying your link...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success/10 to-success/5 shadow-elevated flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-success">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-1">You&apos;re in!</h2>
            <p className="text-muted-foreground text-sm">
              Redirecting to your dashboard...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-xl font-bold mb-2">Link expired or invalid</h2>
            <p className="text-muted-foreground text-sm mb-4">
              This link may have expired. Please request a new one.
            </p>
            <Link href={localizeHref("/auth/login", locale)}>
              <Button>Request new link</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Verifying...</div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
