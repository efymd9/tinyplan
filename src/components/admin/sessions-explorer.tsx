"use client";

import { useState } from "react";
import type { SessionSummary } from "@/lib/analytics/admin-sessions";
import { useAdminDict } from "@/components/admin/admin-lang-provider";

/**
 * Admin "Sessions" behavioral log.
 *
 * Renders the recent anonymous sessions derived server-side (first-party only)
 * as an expandable list. Each row collapses to a one-line summary; expanding it
 * reveals session metadata and a chronological event timeline. All display
 * strings (timestamps, relative ages) are precomputed on the server and passed
 * as props, so this component never touches `Date` — keeping render output
 * deterministic and free of hydration drift.
 */
export function SessionsExplorer({ sessions }: { sessions: SessionSummary[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const dict = useAdminDict();

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-sm text-muted-foreground">{dict.empty.sessions}</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
      {sessions.map((s) => {
        const isOpen = expanded === s.sessionId;
        const panelId = `session-panel-${s.sessionId}`;
        return (
          <div key={s.sessionId}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setExpanded(isOpen ? null : s.sessionId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
            >
              {/* Identity indicator: filled if the session became logged-in. */}
              <span
                className={`shrink-0 w-2 h-2 rounded-full ${
                  s.userId ? "bg-success" : "bg-muted-foreground/40"
                }`}
                aria-hidden="true"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-foreground">
                    {s.sessionId.slice(0, 8)}…
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {s.source}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{s.device}</span>
                  <span className="text-[10px] text-muted-foreground/70">· {s.agoLabel}</span>
                  {s.userId && (
                    <span className="text-[10px] text-success font-medium">
                      {dict.sessions.userPrefix} {s.userId.slice(0, 8)}…
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground min-w-0">
                  <span className="tabular-nums">
                    {s.eventCount} {dict.sessions.eventsWord}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{s.durationLabel}</span>
                  {s.pathTrail.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate font-mono" title={s.pathTrail.join(" → ")}>
                        {s.pathTrail.join(" → ")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span className="shrink-0 hidden sm:block font-mono text-[10px] text-muted-foreground/70 whitespace-nowrap">
                {s.lastEventName}
              </span>
              <ChevronIcon open={isOpen} />
            </button>

            {isOpen && (
              <div
                id={panelId}
                className="px-4 pb-4 pt-1 border-t border-border-whisper bg-muted/20"
              >
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 py-3 text-xs">
                  <Meta label={dict.sessions.started} value={s.startedLabel} />
                  <Meta label={dict.sessions.lastActivity} value={s.lastActivityLabel} />
                  <Meta label={dict.sessions.events} value={String(s.eventCount)} />
                  <Meta label={dict.sessions.device} value={s.device} />
                  <Meta label={dict.sessions.source} value={s.source} />
                  <Meta
                    label={dict.sessions.user}
                    value={s.userId ? `${s.userId.slice(0, 8)}…` : dict.sessions.anonymous}
                  />
                  {s.lastQuizStep != null && (
                    <Meta
                      label={dict.sessions.quizStep}
                      value={
                        s.lastQuizStage
                          ? `${s.lastQuizStep} · ${s.lastQuizStage}`
                          : String(s.lastQuizStep)
                      }
                    />
                  )}
                  {s.referrer && <Meta label={dict.sessions.referrer} value={s.referrer} mono wide />}
                </dl>

                <div className="mt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {dict.sessions.eventTimeline}
                  </p>
                  <ol>
                    {s.timeline.map((ev, i) => {
                      const isLast = i === s.timeline.length - 1;
                      return (
                        <li key={ev.id} className="flex gap-3">
                          <div className="flex flex-col items-center w-3 shrink-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                isLast ? "bg-primary" : "bg-muted-foreground/40"
                              }`}
                              aria-hidden="true"
                            />
                            {!isLast && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
                          </div>
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-foreground">
                                {ev.eventName.replace(/_/g, " ")}
                              </span>
                              {ev.detail && (
                                <span className="text-[11px] text-primary">{ev.detail}</span>
                              )}
                              {ev.path && (
                                <span className="text-[10px] font-mono text-muted-foreground/70 truncate">
                                  {ev.path}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                              {ev.timeLabel}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  {s.lastPath && (
                    <p className="text-[11px] italic text-muted-foreground/70 mt-1 ml-6">
                      {dict.sessions.endedOn}{" "}
                      <span className="font-mono not-italic">{s.lastPath}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Meta({
  label,
  value,
  mono = false,
  wide = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-3 min-w-0" : "min-w-0"}>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className={`text-foreground truncate ${mono ? "font-mono text-[11px]" : ""}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M4.5 6.75 9 11.25l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
