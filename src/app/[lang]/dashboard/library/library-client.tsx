"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SpotIcon } from "@/components/illustrations/activity-illustrations";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";
import { sosScripts } from "@/data/sos-scripts";
import type { SosScript } from "@/data/sos-scripts";
import { PARENT_GROWTH_PATH } from "@/data/parent-growth-path";
import { ToolkitAccordionCard } from "@/components/dashboard/toolkit/ToolkitAccordionCard";
import { SkillLessonContent } from "@/components/dashboard/toolkit/SkillLessonContent";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LibraryActivity {
  id: string;
  title: string;
  description: string | null;
  time_minutes: number | null;
  energy_level: string | null;
  category: string | null;
  materials: string | null;
  parent_script: string | null;
  steps_json: string | null;
  why_it_works: string | null;
  easier_version: string | null;
  bestFor: string | null;
  age_min: number | null;
  age_max: number | null;
  dayNumber: number | null;
}

interface LibraryClientProps {
  planActivities: LibraryActivity[];
  moreActivities: LibraryActivity[];
  recommendedActivities: LibraryActivity[];
  todayActivityId: string | null;
  completedIds: string[];
}

// ── Tabs ───────────────────────────────────────────────────────────────────

type LibraryTab =
  | "activities"
  | "parent-skills"
  | "sos-scripts"
  | "resets"
  | "routines"
  | "saved";

const TABS: { id: LibraryTab; label: string }[] = [
  { id: "activities", label: "Activities" },
  { id: "parent-skills", label: "Parent Skills" },
  { id: "sos-scripts", label: "SOS Scripts" },
  { id: "resets", label: "3-Min Resets" },
  { id: "routines", label: "Routines" },
  { id: "saved", label: "Saved" },
];

// ── Filter chips (Activities tab only) ────────────────────────────────────

const FILTER_CHIPS = [
  "All",
  "No prep",
  "3 min",
  "Bedtime",
  "Outside",
  "Low energy",
  "Refuses",
  "Screen-free",
] as const;

type FilterChip = (typeof FILTER_CHIPS)[number];

function matchesChip(activity: LibraryActivity, chip: FilterChip): boolean {
  if (chip === "All") return true;
  const cat = (activity.category ?? "").toLowerCase();
  const energy = (activity.energy_level ?? "").toLowerCase();
  const materials = (activity.materials ?? "").toLowerCase();
  const title = activity.title.toLowerCase();
  const desc = (activity.description ?? "").toLowerCase();
  const bestFor = (activity.bestFor ?? "").toLowerCase();

  switch (chip) {
    case "No prep":
      return (
        !materials ||
        materials === "none" ||
        materials === "nothing" ||
        materials.trim() === ""
      );
    case "3 min":
      return activity.time_minutes != null && activity.time_minutes <= 3;
    case "Bedtime":
      return (
        cat.includes("bedtime") ||
        bestFor.includes("bedtime") ||
        title.includes("bedtime")
      );
    case "Outside":
      return (
        cat.includes("outdoor") ||
        title.includes("outdoor") ||
        desc.includes("outdoor") ||
        desc.includes("outside")
      );
    case "Low energy":
      return energy === "low" || energy.includes("low");
    case "Refuses":
      return (
        cat.includes("refusal") ||
        bestFor.includes("refuses") ||
        cat.includes("cooperation") ||
        bestFor.includes("cooperation") ||
        title.includes("refuses") ||
        title.includes("refusal")
      );
    case "Screen-free":
      return (
        cat.includes("screen-free") ||
        cat.includes("screenless") ||
        bestFor.includes("screen-free")
      );
    default:
      return true;
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────

function mergeUnique(
  primary: LibraryActivity[],
  secondary: LibraryActivity[],
): LibraryActivity[] {
  const seen = new Set(primary.map((a) => a.id));
  return [...primary, ...secondary.filter((a) => !seen.has(a.id))];
}

// ── Small icons ────────────────────────────────────────────────────────────

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-muted-foreground shrink-0 ml-3 mt-1 transition-transform ${
        expanded ? "rotate-180" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v14l7-3 7 3V5a2 2 0 00-2-2H5z" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3a2 2 0 00-2 2v14l7-3 7 3V5a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}

// ── Activity Card ──────────────────────────────────────────────────────────

function ActivityCard({
  activity,
  isExpanded,
  onToggle,
  isToday,
  isCompleted,
  showSwap,
  isSaved,
  onToggleSave,
}: {
  activity: LibraryActivity;
  isExpanded: boolean;
  onToggle: () => void;
  isToday?: boolean;
  isCompleted?: boolean;
  showSwap?: boolean;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  const locale = useLocale();
  const steps: string[] = activity.steps_json
    ? (JSON.parse(activity.steps_json) as string[])
    : [];

  const spotType = (activity.category ?? "").toLowerCase().includes("bonding")
    ? "profile"
    : (activity.category ?? "").toLowerCase().includes("routine")
      ? "routine"
      : "activity";

  const snippet =
    activity.description
      ? activity.description.length > 60
        ? activity.description.slice(0, 60).trimEnd() + "..."
        : activity.description
      : null;

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all ${
        isToday
          ? "premium-card border-primary/20 bg-primary-light/20"
          : isCompleted
            ? "premium-card border-secondary/15 bg-secondary-light/20"
            : "premium-card"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <SpotIcon type={spotType} className="w-10 h-10 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-sm">{activity.title}</h3>
              {isToday && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                  Today
                </span>
              )}
              {isCompleted && !isToday && (
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                  Done
                </span>
              )}
              {activity.dayNumber != null && !isToday && !isCompleted && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                  Day {activity.dayNumber}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {activity.time_minutes && (
                <span className="text-xs text-muted-foreground">
                  {activity.time_minutes} min
                </span>
              )}
              {activity.energy_level && (
                <span className="text-xs text-muted-foreground">
                  &middot; {activity.energy_level} energy
                </span>
              )}
              {(!activity.materials ||
                activity.materials.trim() === "" ||
                activity.materials === "none") && (
                <span className="text-xs text-primary font-medium">
                  &middot; No prep
                </span>
              )}
            </div>
            {!isExpanded && snippet && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {snippet}
              </p>
            )}
            {!isExpanded && (
              <div className="flex gap-2 mt-2">
                {isToday ? (
                  <Link
                    href={localizeHref("/dashboard/today", locale)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-medium px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    Open
                  </Link>
                ) : (
                  showSwap && (
                    <Link
                      href={localizeHref("/dashboard/today", locale)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-medium px-3 py-1 rounded-full border border-primary/20 bg-primary-light text-primary hover:bg-primary/10 transition-colors"
                    >
                      Swap into today
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center shrink-0">
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(activity.id);
              }}
              aria-label={isSaved ? "Unsave activity" : "Save activity"}
              className={`p-1.5 rounded-full transition-colors ${
                isSaved
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <BookmarkIcon filled={!!isSaved} />
            </button>
          )}
          <ChevronIcon expanded={isExpanded} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border-whisper pt-4 space-y-4">
          {activity.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          )}

          {activity.bestFor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                className="w-4 h-4 text-secondary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
              <span>
                Best for{" "}
                <span className="font-medium text-foreground">
                  {activity.bestFor}
                </span>
              </span>
            </div>
          )}

          {activity.easier_version && (
            <div className="bg-gradient-to-br from-accent-light to-accent-light/50 border border-accent/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-accent-dark mb-1">
                Quick version
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activity.easier_version}
              </p>
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Steps</h4>
              <ol className="space-y-1.5">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shadow-xs">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5 leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activity.parent_script && (
            <div className="bg-gradient-to-br from-primary-light/80 to-primary-light/40 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-primary mb-1">
                What to say
              </h4>
              <p className="text-sm italic leading-relaxed">
                &ldquo;{activity.parent_script}&rdquo;
              </p>
            </div>
          )}

          {activity.materials &&
            activity.materials.trim() !== "" &&
            activity.materials !== "none" && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Materials</h4>
                <p className="text-sm text-muted-foreground">
                  {activity.materials}
                </p>
              </div>
            )}

          {activity.why_it_works && (
            <div className="bg-gradient-to-br from-secondary-light to-secondary-light/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-secondary mb-1">
                Why it works
              </h4>
              <p className="text-sm text-muted-foreground">
                {activity.why_it_works}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {showSwap && !isToday && (
              <button
                onClick={() => {
                  window.location.href = localizeHref("/dashboard/today", locale);
                }}
                className="text-xs font-medium px-4 py-2.5 rounded-full border border-primary/20 bg-primary-light text-primary hover:bg-primary/10 transition-colors"
              >
                Swap into today
              </button>
            )}
            {isToday && (
              <Link
                href={localizeHref("/dashboard/today", locale)}
                className="text-xs font-medium px-4 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
              >
                Open today&apos;s activity
              </Link>
            )}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(activity.id)}
                className={`text-xs font-medium px-4 py-2.5 rounded-full border transition-colors ${
                  isSaved
                    ? "border-primary/20 bg-primary-light text-primary"
                    : "border-border-whisper bg-muted text-muted-foreground hover:border-primary/20 hover:text-primary"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SOS Script icons ───────────────────────────────────────────────────────

const SOS_ICON_MAP: Record<string, React.ReactNode> = {
  phone: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3"
      />
    </svg>
  ),
  heart: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  moon: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  ),
  people: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  ),
  hand: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.251 5.251 0 001.538-3.712V10.5a1.575 1.575 0 00-3.15 0v1.575"
      />
    </svg>
  ),
  battery: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 10.5h.375a.375.375 0 01.375.375v2.25a.375.375 0 01-.375.375H21m-9 3.75h9.375a.375.375 0 00.375-.375V7.125a.375.375 0 00-.375-.375H12m-9 7.5v-4.5m0 4.5a3 3 0 010-4.5m0 4.5h9m-9-4.5h9"
      />
    </svg>
  ),
  users: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  ),
  arrow: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
      />
    </svg>
  ),
};

// ── SOS Script card ────────────────────────────────────────────────────────

function SosScriptItem({ script }: { script: SosScript }) {
  return (
    <ToolkitAccordionCard
      label="SOS Script"
      title={script.title}
      summary={script.situation}
      accent="sos"
      icon={SOS_ICON_MAP[script.icon] ?? SOS_ICON_MAP.heart}
    >
      <div className="space-y-3 pt-4">
        <div className="rounded-xl p-3 tk-tint-play">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            First 30 seconds
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {script.firstThirtySeconds}
          </p>
        </div>

        <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary-light/80 to-primary-light/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            What to say
          </p>
          <p className="text-sm italic leading-relaxed text-foreground">
            &ldquo;{script.whatToSay}&rdquo;
          </p>
        </div>

        <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Avoid this
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {script.whatNotToDo}
          </p>
        </div>

        <div className="rounded-xl p-3 tk-tint-sage">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            After calm
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {script.afterCalm}
          </p>
        </div>

        <div className="rounded-xl p-3 tk-tint-yellow">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Tiny next step
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {script.tinyNextStep}
          </p>
        </div>
      </div>
    </ToolkitAccordionCard>
  );
}

// ── Activities Tab ─────────────────────────────────────────────────────────

function ActivitiesTab({
  planActivities,
  moreActivities,
  recommendedActivities,
  todayActivityId,
  completedIds,
  savedIds,
  onToggleSave,
  search,
  setSearch,
}: {
  planActivities: LibraryActivity[];
  moreActivities: LibraryActivity[];
  recommendedActivities: LibraryActivity[];
  todayActivityId: string | null;
  completedIds: string[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const [activeChip, setActiveChip] = useState<FilterChip>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedSet = new Set(completedIds);
  const savedSet = new Set(savedIds);

  function filterList(list: LibraryActivity[]): LibraryActivity[] {
    return list.filter((a) => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.category ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesSearch && matchesChip(a, activeChip);
    });
  }

  const filteredPlan = filterList(planActivities);
  const filteredMore = filterList(moreActivities);
  const filteredRecommended = filterList(recommendedActivities);
  const noResults =
    filteredPlan.length === 0 &&
    filteredMore.length === 0 &&
    filteredRecommended.length === 0;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`text-xs px-3.5 py-2 rounded-full font-medium transition-all min-h-[36px] ${
              activeChip === chip
                ? "bg-primary text-white shadow-button"
                : "bg-card border border-border-whisper shadow-xs hover:shadow-card hover:border-primary/20 text-muted-foreground"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {noResults && (
        <div className="text-center py-12 text-muted-foreground animate-fade-up">
          <p className="mb-2">No activities match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveChip("All");
            }}
            className="text-primary text-sm font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredRecommended.length > 0 && (
        <section className="mb-8">
          <div className="hero-card p-4 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <SpotIcon type="insight" className="w-6 h-6" />
              <h2 className="text-lg font-bold">Recommended for You</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Low-prep activities picked for your family.
            </p>
          </div>
          <div className="space-y-3">
            {filteredRecommended.map((activity) => (
              <ActivityCard
                key={`rec-${activity.id}`}
                activity={activity}
                isExpanded={expandedId === `rec-${activity.id}`}
                onToggle={() =>
                  setExpandedId(
                    expandedId === `rec-${activity.id}`
                      ? null
                      : `rec-${activity.id}`,
                  )
                }
                isToday={activity.id === todayActivityId}
                isCompleted={completedSet.has(activity.id)}
                showSwap={!!todayActivityId}
                isSaved={savedSet.has(activity.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </section>
      )}

      {filteredPlan.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center shadow-xs">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold">Your Current Plan</h2>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full shadow-xs">
              {filteredPlan.length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredPlan.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isExpanded={expandedId === activity.id}
                onToggle={() =>
                  setExpandedId(
                    expandedId === activity.id ? null : activity.id,
                  )
                }
                isToday={activity.id === todayActivityId}
                isCompleted={completedSet.has(activity.id)}
                showSwap={!!todayActivityId}
                isSaved={savedSet.has(activity.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </section>
      )}

      {filteredMore.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary-light to-secondary-light/50 flex items-center justify-center shadow-xs">
              <svg
                className="w-4 h-4 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold">More Ideas</h2>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full shadow-xs">
              {filteredMore.length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredMore.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isExpanded={expandedId === activity.id}
                onToggle={() =>
                  setExpandedId(
                    expandedId === activity.id ? null : activity.id,
                  )
                }
                showSwap={!!todayActivityId}
                isSaved={savedSet.has(activity.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ── Parent Skills Tab ──────────────────────────────────────────────────────

function ParentSkillsTab({ search }: { search: string }) {
  const filtered = PARENT_GROWTH_PATH.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.whenToUse.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No skills match your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hero-card p-4 mb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Seven evidence-based parenting skills, one per day. Each includes
          scripts, examples, and a tiny win to practise today.
        </p>
      </div>
      <div className="space-y-3 mb-8">
        {filtered.map((skill) => (
          <ToolkitAccordionCard
            key={skill.id}
            label={`Day ${skill.dayNumber}`}
            title={skill.title}
            summary={skill.whenToUse}
            accent={skill.accent}
          >
            <SkillLessonContent skill={skill} />
          </ToolkitAccordionCard>
        ))}
      </div>
    </>
  );
}

// ── SOS Scripts Tab ────────────────────────────────────────────────────────

function SosScriptsTab({ search }: { search: string }) {
  const filtered = sosScripts.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.situation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="hero-card p-4 mb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Step-by-step scripts for the hardest parenting moments. Tap any card
          to see the full approach.
        </p>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No scripts match your search.</p>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {filtered.map((script) => (
          <SosScriptItem key={script.id} script={script} />
        ))}
      </div>
    </>
  );
}

// ── 3-Minute Resets Tab ────────────────────────────────────────────────────

function ThreeMinResetsTab({
  planActivities,
  moreActivities,
  todayActivityId,
  completedIds,
  savedIds,
  onToggleSave,
  search,
}: {
  planActivities: LibraryActivity[];
  moreActivities: LibraryActivity[];
  todayActivityId: string | null;
  completedIds: string[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  search: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedSet = new Set(completedIds);
  const savedSet = new Set(savedIds);

  const resets = mergeUnique(planActivities, moreActivities).filter((a) => {
    const isReset = a.time_minutes != null && a.time_minutes <= 3;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(search.toLowerCase());
    return isReset && matchesSearch;
  });

  if (resets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-up">
        <p className="mb-1">No 3-minute resets in your library yet.</p>
        <p className="text-xs">Activities that take 3 minutes or less appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hero-card p-4 mb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Activities that take 3 minutes or less — perfect for transitions,
          quick breaks, and low-time moments.
        </p>
      </div>
      <div className="space-y-3 mb-8">
        {resets.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isExpanded={expandedId === activity.id}
            onToggle={() =>
              setExpandedId(expandedId === activity.id ? null : activity.id)
            }
            isToday={activity.id === todayActivityId}
            isCompleted={completedSet.has(activity.id)}
            showSwap={!!todayActivityId}
            isSaved={savedSet.has(activity.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </>
  );
}

// ── Routines Tab ───────────────────────────────────────────────────────────

function RoutinesTab({
  planActivities,
  moreActivities,
  todayActivityId,
  completedIds,
  savedIds,
  onToggleSave,
  search,
}: {
  planActivities: LibraryActivity[];
  moreActivities: LibraryActivity[];
  todayActivityId: string | null;
  completedIds: string[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  search: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedSet = new Set(completedIds);
  const savedSet = new Set(savedIds);

  const routines = mergeUnique(planActivities, moreActivities).filter((a) => {
    const cat = (a.category ?? "").toLowerCase();
    const bestFor = (a.bestFor ?? "").toLowerCase();
    const title = a.title.toLowerCase();
    const isRoutine =
      cat.includes("routine") ||
      cat.includes("bedtime") ||
      cat.includes("morning") ||
      bestFor.includes("routine") ||
      bestFor.includes("bedtime") ||
      title.includes("bedtime") ||
      title.includes("routine") ||
      title.includes("morning");
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(search.toLowerCase());
    return isRoutine && matchesSearch;
  });

  if (routines.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-up">
        <p className="mb-1">No routine activities in your library yet.</p>
        <p className="text-xs">
          Bedtime, morning, and transition activities appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hero-card p-4 mb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Activities designed to build predictable routines for mornings,
          bedtimes, and daily transitions.
        </p>
      </div>
      <div className="space-y-3 mb-8">
        {routines.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isExpanded={expandedId === activity.id}
            onToggle={() =>
              setExpandedId(expandedId === activity.id ? null : activity.id)
            }
            isToday={activity.id === todayActivityId}
            isCompleted={completedSet.has(activity.id)}
            showSwap={!!todayActivityId}
            isSaved={savedSet.has(activity.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </>
  );
}

// ── Saved Tab ──────────────────────────────────────────────────────────────

function SavedTab({
  planActivities,
  moreActivities,
  savedIds,
  onToggleSave,
  todayActivityId,
  completedIds,
  search,
}: {
  planActivities: LibraryActivity[];
  moreActivities: LibraryActivity[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  todayActivityId: string | null;
  completedIds: string[];
  search: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedSet = new Set(completedIds);
  const savedSet = new Set(savedIds);

  if (savedIds.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 3H7a2 2 0 00-2 2v14l7-3 7 3V5a2 2 0 00-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium mb-1">No saved activities yet</p>
        <p className="text-xs">
          Tap the bookmark on any activity to save it here.
        </p>
      </div>
    );
  }

  const saved = mergeUnique(planActivities, moreActivities).filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(search.toLowerCase());
    return savedSet.has(a.id) && matchesSearch;
  });

  if (saved.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No saved activities match your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      {saved.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isExpanded={expandedId === activity.id}
          onToggle={() =>
            setExpandedId(expandedId === activity.id ? null : activity.id)
          }
          isToday={activity.id === todayActivityId}
          isCompleted={completedSet.has(activity.id)}
          showSwap={!!todayActivityId}
          isSaved={savedSet.has(activity.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

// ── Main client component ──────────────────────────────────────────────────

export function LibraryClient({
  planActivities,
  moreActivities,
  recommendedActivities,
  todayActivityId,
  completedIds,
}: LibraryClientProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("activities");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(
        localStorage.getItem("tinyplan-saved") ?? "[]",
      ) as string[];
    } catch {
      return [];
    }
  });

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem("tinyplan-saved", JSON.stringify(next));
      return next;
    });
  }

  const searchPlaceholder: Record<LibraryTab, string> = {
    activities: "Search activities...",
    "parent-skills": "Search skills...",
    "sos-scripts": "Search scripts...",
    resets: "Search resets...",
    routines: "Search routines...",
    saved: "Search saved...",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-primary-light/30 to-transparent">
          <Image
            src="/images/illustrations/tinyplan-activity-library.png"
            alt="Browse screen-free activities matched to your child"
            width={1448}
            height={1086}
            className="w-full max-w-xs mx-auto h-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">
          Toolkit Hub
        </h1>
        <p className="text-muted-foreground text-sm">
          Activities, skills, and scripts for every moment.
        </p>
      </div>

      {/* Scrollable tabs */}
      <div className="-mx-4 px-4 overflow-x-auto no-scrollbar mb-5">
        <div className="flex gap-1 bg-muted/60 p-1 rounded-2xl w-max min-w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch("");
              }}
              className={`text-xs sm:text-sm font-medium py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <SearchIcon />
        <input
          type="text"
          placeholder={searchPlaceholder[activeTab]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-2xl border-[1.5px] border-border bg-card text-sm shadow-inner-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-glow transition-all"
        />
      </div>

      {/* Tab content */}
      {activeTab === "activities" && (
        <ActivitiesTab
          planActivities={planActivities}
          moreActivities={moreActivities}
          recommendedActivities={recommendedActivities}
          todayActivityId={todayActivityId}
          completedIds={completedIds}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          search={search}
          setSearch={setSearch}
        />
      )}
      {activeTab === "parent-skills" && <ParentSkillsTab search={search} />}
      {activeTab === "sos-scripts" && <SosScriptsTab search={search} />}
      {activeTab === "resets" && (
        <ThreeMinResetsTab
          planActivities={planActivities}
          moreActivities={moreActivities}
          todayActivityId={todayActivityId}
          completedIds={completedIds}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          search={search}
        />
      )}
      {activeTab === "routines" && (
        <RoutinesTab
          planActivities={planActivities}
          moreActivities={moreActivities}
          todayActivityId={todayActivityId}
          completedIds={completedIds}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          search={search}
        />
      )}
      {activeTab === "saved" && (
        <SavedTab
          planActivities={planActivities}
          moreActivities={moreActivities}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          todayActivityId={todayActivityId}
          completedIds={completedIds}
          search={search}
        />
      )}
    </div>
  );
}
