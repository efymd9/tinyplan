// src/app/[lang]/(site)/layout.tsx
import { LanguageSwitcher } from "@/components/language-switcher";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-3 right-3 z-[60]">
        <LanguageSwitcher />
      </div>
      {children}
    </>
  );
}
