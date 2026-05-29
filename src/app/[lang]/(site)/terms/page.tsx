import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { localizeHref } from "@/lib/i18n/href";
import type { Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Terms of Service — TinyPlan",
  description:
    "Terms of Service for TinyPlan, a personalized play and routine planning service for parents.",
};

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={localizeHref("/", lang as Locale)} aria-label="TinyPlan home">
            <BrandLogo width={130} />
          </Link>
          <Link
            href={localizeHref("/", lang as Locale)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: 27 May 2025
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">About TinyPlan</h2>
            <p className="text-muted-foreground">
              TinyPlan provides personalized play and routine plans for parents of
              children aged 2&ndash;6. After completing a quiz about your parenting
              goals, schedule, and child&apos;s age range, you receive a 7-day
              activity plan with parent scripts, materials lists, and step-by-step
              guidance. By using TinyPlan, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Account and access</h2>
            <p className="text-muted-foreground">
              You log in using a magic link sent to your email address. You are
              responsible for maintaining access to your email account. Each account
              is for personal, non-commercial use by a single household.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Subscription and payment
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                TinyPlan costs <strong className="text-foreground">$1 for the first 7 days</strong>, then{" "}
                <strong className="text-foreground">$14.99 per month</strong>{" "}
                thereafter.
              </li>
              <li>
                Your subscription renews automatically each month until you cancel.
              </li>
              <li>
                You can cancel anytime. Cancellation takes effect at the end of
                your current billing period&mdash;you keep access until then.
              </li>
              <li>
                Payments are processed by Stripe. TinyPlan does not store your
                payment card details.
              </li>
              <li>
                Refunds are handled on a case-by-case basis. If you&apos;re
                unhappy, contact us and we&apos;ll try to make it right.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Not medical advice or therapy
            </h2>
            <div className="bg-card rounded-2xl border border-border p-4 text-muted-foreground">
              <p className="mb-2">
                TinyPlan is a play-based enrichment tool. It is{" "}
                <strong className="text-foreground">
                  not a substitute for professional medical, therapeutic, or
                  developmental advice
                </strong>
                .
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Activities are general play ideas, not therapy or treatment
                  programs.
                </li>
                <li>
                  TinyPlan does not diagnose, treat, or claim to address any
                  developmental condition.
                </li>
                <li>
                  SOS scripts provide general parenting guidance for common
                  situations, not professional advice.
                </li>
                <li>
                  If you have concerns about your child&apos;s development or
                  well-being, consult a qualified healthcare professional.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Your responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                You are responsible for supervising your child during any
                activities suggested by TinyPlan.
              </li>
              <li>
                You should use your own judgment about what is safe and appropriate
                for your child. Activity safety notes are provided as guidance, not
                guarantees.
              </li>
              <li>
                You agree not to share your account or redistribute TinyPlan
                content commercially.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Content and intellectual property
            </h2>
            <p className="text-muted-foreground">
              All activity plans, scripts, and content provided through TinyPlan
              are owned by TinyPlan. Your subscription gives you a personal,
              non-transferable license to use this content for your own family. You
              may not reproduce, distribute, or sell TinyPlan content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Limitation of liability
            </h2>
            <p className="text-muted-foreground">
              TinyPlan is provided &ldquo;as is&rdquo; without warranties of any
              kind, express or implied. To the fullest extent permitted by law,
              TinyPlan shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of the service. Our total
              liability is limited to the amount you have paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Service availability</h2>
            <p className="text-muted-foreground">
              We aim to keep TinyPlan available and reliable, but we cannot
              guarantee uninterrupted access. We may update, modify, or
              discontinue features with reasonable notice. If we discontinue the
              service entirely, we will provide at least 30 days&apos; notice and
              refund any prepaid amounts for unused service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Termination</h2>
            <p className="text-muted-foreground">
              You may close your account at any time by canceling your subscription
              and requesting account deletion. We may terminate or suspend your
              account if you violate these terms, with notice where reasonably
              possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Changes to these terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. If we make material
              changes, we will notify you by email at least 14 days before they
              take effect. Continued use of TinyPlan after changes take effect
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground">
              Questions about these terms? Email{" "}
              <a
                href="mailto:hello@tinyplan.app"
                className="text-primary underline"
              >
                hello@tinyplan.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 TinyPlan. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href={localizeHref("/privacy", lang as Locale)}
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-foreground font-medium">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
