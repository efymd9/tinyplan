// src/app/[lang]/(site)/layout.tsx
//
// NOTE: the language switcher used to float here (fixed top-right overlay),
// but on mobile the page headers span the full viewport width, so it covered
// their right-side actions (e.g. the landing "Build my plan" button). Each
// public page now renders <LanguageSwitcher /> inline in its own header
// instead — same pattern as the dashboard layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
