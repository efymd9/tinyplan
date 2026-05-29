import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { localizeHref } from "@/lib/i18n/href";
import type { Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Privacy Policy — TinyPlan",
  description:
    "How TinyPlan collects, uses, and protects your data. We collect minimal information and never store child personal data.",
};

export default async function PrivacyPolicyPage({
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: 27 May 2025
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">What TinyPlan is</h2>
            <p className="text-muted-foreground">
              TinyPlan is a personalized play and routine planning service for
              parents of children aged 2&ndash;6. Parents complete a quiz, receive
              a play profile, and get a 7-day activity plan. The app is
              parent-facing&mdash;children do not interact with it directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data we collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Email address</strong> &mdash;
                used for account login (magic link), subscription management, and
                essential service communications.
              </li>
              <li>
                <strong className="text-foreground">Quiz answers</strong> &mdash;
                your responses to the play profile quiz, used to generate your
                personalized plan. These include general preferences, parenting
                goals, and your child&apos;s age range (e.g. 2&ndash;3, 4&ndash;5).
              </li>
              <li>
                <strong className="text-foreground">Activity log data</strong>{" "}
                &mdash; which activities you mark as complete, used to track your
                progress and improve plan recommendations.
              </li>
              <li>
                <strong className="text-foreground">Basic analytics events</strong>{" "}
                &mdash; page views and feature usage, stored in our own database.
                No third-party tracking scripts are loaded by default.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Data we do not collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                No child names, photos, birthdates, or location data. Child age is
                stored only as a broad range.
              </li>
              <li>
                No payment card numbers. All payment processing is handled by
                Stripe&mdash;TinyPlan never sees or stores your card details.
              </li>
              <li>
                No data is collected from children. This app is designed for and
                used by parents only.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>To generate and deliver your personalized play plan.</li>
              <li>To authenticate your account via magic link emails.</li>
              <li>To manage your subscription and process payments through Stripe.</li>
              <li>
                To improve the service based on aggregate, anonymized usage
                patterns.
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We do not sell your data. We do not use your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Third parties</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Stripe</strong> &mdash;
                processes payments and manages subscriptions. Stripe receives your
                email and payment details under their own{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> &mdash;
                delivers transactional emails (magic links). Resend receives your
                email address for delivery purposes only.
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We do not share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Cookies and sessions</h2>
            <p className="text-muted-foreground">
              We use a single httpOnly session cookie to keep you logged in. We
              also use localStorage to save quiz progress so you can resume if you
              leave the page. We do not use third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data retention</h2>
            <p className="text-muted-foreground">
              Your account data (email, quiz answers, activity logs) is retained
              for as long as your account is active. If you cancel your
              subscription and request deletion, we will delete your data within 30
              days. Stripe may retain payment records independently as required by
              law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Your rights</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Access</strong> &mdash; you can
                request a copy of the data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Deletion</strong> &mdash; you
                can request that we delete your account and all associated data.
              </li>
              <li>
                <strong className="text-foreground">Correction</strong> &mdash; you
                can request corrections to any inaccurate data.
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              To exercise any of these rights, email us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              Children&apos;s privacy (COPPA)
            </h2>
            <p className="text-muted-foreground">
              TinyPlan is a parent-facing service. Children do not create accounts,
              interact with the app, or provide any data. We do not knowingly
              collect personal information from children under 13. If you believe a
              child has provided us with personal information, please contact us and
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Changes to this policy</h2>
            <p className="text-muted-foreground">
              We may update this policy from time to time. If we make material
              changes, we will notify you by email. The &ldquo;last updated&rdquo;
              date at the top of this page reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or requests, email{" "}
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
            <span className="text-foreground font-medium">Privacy Policy</span>
            <Link
              href={localizeHref("/terms", lang as Locale)}
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
