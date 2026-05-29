"use client";

import { useState } from "react";
import Image from "next/image";
import { sosScripts, type SosScript } from "@/data/sos-scripts";
import { AskTinyPlan } from "@/components/dashboard/ask-tinyplan";

const iconMap: Record<string, React.ReactNode> = {
  phone: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  moon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  people: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  hand: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925M14.325 4.575v1.5m0-1.5a1.575 1.575 0 013.15 0v8.175a6.15 6.15 0 01-6.15 6.15H10.2a6.15 6.15 0 01-5.775-4.05L3.9 13.5a1.575 1.575 0 012.55-1.838l.862 1.151V4.575" />
    </svg>
  ),
  battery: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  arrow: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
};

function CardGrid({
  scripts,
  onSelect,
}: {
  scripts: SosScript[];
  onSelect: (script: SosScript) => void;
}) {
  const accentColors = [
    "from-primary-light to-primary-light/50 text-primary",
    "from-accent-light to-accent-light/50 text-accent-dark",
    "from-secondary-light to-secondary-light/50 text-secondary",
    "from-primary-light to-primary-light/50 text-primary",
    "from-accent-light to-accent-light/50 text-accent-dark",
    "from-secondary-light to-secondary-light/50 text-secondary",
    "from-primary-light to-primary-light/50 text-primary",
    "from-accent-light to-accent-light/50 text-accent-dark",
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {scripts.map((script, idx) => (
        <button
          key={script.id}
          onClick={() => onSelect(script)}
          className="premium-card rounded-2xl p-4 text-left active:scale-[0.97] transition-all hover:shadow-card-hover"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColors[idx % accentColors.length]} flex items-center justify-center mb-3 shadow-xs`}>
            {iconMap[script.icon]}
          </div>
          <h3 className="font-semibold text-sm leading-tight mb-1">
            {script.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {script.situation}
          </p>
        </button>
      ))}
    </div>
  );
}

const SCRIPT_SECTIONS: { key: keyof SosScript; label: string; accent: string }[] = [
  { key: "firstThirtySeconds", label: "First 30 seconds", accent: "from-primary-light to-primary-light/50 text-primary" },
  { key: "whatToSay", label: "What to say", accent: "from-primary-light/80 to-primary-light/40 text-primary" },
  { key: "whatNotToDo", label: "What not to do", accent: "from-accent-light to-accent-light/50 text-accent-dark" },
  { key: "afterCalm", label: "After calm", accent: "from-secondary-light to-secondary-light/50 text-secondary" },
  { key: "tinyNextStep", label: "Tiny next step", accent: "from-secondary-light/80 to-secondary-light/40 text-secondary" },
];

function ScriptActionButtons() {
  const [saved, setSaved] = useState<string | null>(null);

  if (saved) {
    return (
      <p className="text-xs text-muted-foreground italic pt-1">
        Got it — {saved.toLowerCase()}.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {["Save this as pattern", "Adjust tomorrow"].map((label) => (
        <button
          key={label}
          onClick={() => setSaved(label)}
          className="px-3 py-1.5 text-xs font-medium rounded-xl border border-border-whisper bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.97] transition-all"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ScriptDetail({
  script,
  onBack,
}: {
  script: SosScript;
  onBack: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto animate-fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary-light/50 text-primary flex items-center justify-center shrink-0 shadow-xs">
          {iconMap[script.icon]}
        </div>
        <h2 className="text-xl font-bold">{script.title}</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">{script.situation}</p>

      <div className="space-y-3 mb-4">
        {SCRIPT_SECTIONS.map(({ key, label, accent }) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${accent} rounded-2xl p-5 shadow-card`}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-1.5">
              {label}
            </h3>
            <p className="text-sm leading-relaxed">{script[key] as string}</p>
          </div>
        ))}
      </div>

      <ScriptActionButtons />

      <button
        onClick={onBack}
        className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border-whisper hover:border-border rounded-2xl transition-all shadow-xs hover:shadow-card mt-4"
      >
        Back to all situations
      </button>
    </div>
  );
}

export default function SosPage() {
  const [selectedScript, setSelectedScript] = useState<SosScript | null>(null);

  if (selectedScript) {
    return (
      <div className="max-w-2xl mx-auto">
        <ScriptDetail
          script={selectedScript}
          onBack={() => setSelectedScript(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-accent-light/30 to-transparent">
          <Image
            src="/images/illustrations/tinyplan-calm-support.png"
            alt="Calm support for difficult parenting moments"
            width={1448}
            height={1086}
            className="w-full max-w-xs mx-auto h-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
          SOS / calm command center
        </h1>
        <p className="text-muted-foreground text-sm mb-5">
          Describe what&rsquo;s happening and get a personalised reset.
        </p>

        <AskTinyPlan inline />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold">Quick situations</h2>
          <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-0.5 rounded-full">
            {sosScripts.length} scripts
          </span>
        </div>
        <CardGrid scripts={sosScripts} onSelect={setSelectedScript} />
      </div>

      <p className="text-[11px] text-muted-foreground text-center leading-snug pb-4">
        TinyPlan is not a medical professional. For serious concerns, please
        consult your paediatrician.
      </p>
    </div>
  );
}
