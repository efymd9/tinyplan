import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { localizeHref } from "@/lib/i18n/href";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getTermsContent, termsMeta, type Inline } from "./terms-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const meta = termsMeta[resolveLocale(lang)];
  return { title: meta.title, description: meta.description };
}

/** Render a run of inline content (text, bold, links) preserving order. */
function renderInline(parts: Inline[]) {
  return parts.map((part, i) => {
    if (typeof part === "string") {
      return <Fragment key={i}>{part}</Fragment>;
    }
    if ("bold" in part) {
      return (
        <strong key={i} className="text-foreground">
          {part.bold}
        </strong>
      );
    }
    return (
      <a
        key={i}
        href={part.href}
        {...(part.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="text-primary underline"
      >
        {part.text}
      </a>
    );
  });
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang) as Locale;
  const c = getTermsContent(locale);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={localizeHref("/", locale)} aria-label={c.homeAriaLabel}>
            <BrandLogo width={130} />
          </Link>
          <Link
            href={localizeHref("/", locale)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {c.backToHome}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {c.lastUpdatedLabel} {c.lastUpdated}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          {c.sections.map((section, i) => {
            if (section.kind === "callout") {
              return (
                <section key={i}>
                  <h2 className="text-lg font-semibold mb-2">
                    {section.heading}
                  </h2>
                  <div className="bg-card rounded-2xl border border-border p-4 text-muted-foreground">
                    <p className="mb-2">{renderInline(section.intro)}</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.list.map((item, j) => (
                        <li key={j}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            }
            return (
              <section key={i}>
                <h2 className="text-lg font-semibold mb-2">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((para, j) => (
                  <p key={j} className="text-muted-foreground">
                    {renderInline(para)}
                  </p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {section.list.map((item, j) => (
                      <li key={j}>{renderInline(item)}</li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{c.copyright}</p>
          <div className="flex gap-6">
            <Link
              href={localizeHref("/privacy", locale)}
              className="hover:text-foreground transition-colors"
            >
              {c.footerPrivacy}
            </Link>
            <span className="text-foreground font-medium">
              {c.footerTerms}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
