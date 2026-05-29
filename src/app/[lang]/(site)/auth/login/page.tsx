"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto">
          <Link href="/" aria-label="TinyPlan home">
            <BrandLogo width={130} priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full shadow-hero animate-fade-up">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success/10 to-success/5 shadow-elevated flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-success">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We sent a magic link to <strong>{email}</strong>. Click it to
                sign in. It expires in 15 minutes.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Sign in to TinyPlan</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we&apos;ll send you a magic link.
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                error={error}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button
                onClick={handleSubmit}
                loading={loading}
                className="w-full mt-4"
                size="lg"
              >
                Send magic link
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                No password needed. We&apos;ll email you a secure link.
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
