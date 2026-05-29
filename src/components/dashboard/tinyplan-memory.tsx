interface TinyPlanMemoryProps {
  goalDisplayText: string;
  bestMomentDisplay: string;
  planStyleDisplay: string;
  profileDisplayName: string;
  hardMomentDisplay?: string;
  feedbackCounts: Record<string, number>;
}

export function TinyPlanMemory({
  goalDisplayText,
  bestMomentDisplay,
  planStyleDisplay,
  profileDisplayName,
  hardMomentDisplay,
  feedbackCounts,
}: TinyPlanMemoryProps) {
  const done = feedbackCounts["done"] ?? 0;
  const tooHard = feedbackCounts["too_hard"] ?? 0;
  const total = Object.values(feedbackCounts).reduce((s, n) => s + n, 0);
  const remaining = Math.max(3 - total, 0);

  const bullets: string[] = [];

  if (goalDisplayText) {
    bullets.push(
      `Your main goal is ${goalDisplayText.charAt(0).toLowerCase() + goalDisplayText.slice(1)}`
    );
  }

  if (bestMomentDisplay) {
    bullets.push(`${bestMomentDisplay} is your easiest moment`);
  }

  if (planStyleDisplay) {
    bullets.push(`${planStyleDisplay} fits your family`);
  }

  if (profileDisplayName) {
    bullets.push(`Your play style is ${profileDisplayName}`);
  }

  if (hardMomentDisplay) {
    bullets.push(`${hardMomentDisplay} is the moment that feels hardest`);
  }

  if (done > 0) {
    bullets.push("Activities that 'felt right' keep the same energy");
  }

  if (tooHard > 0) {
    bullets.push("Some activities felt too hard -- we'll adjust");
  }

  return (
    <div className="bg-card border border-border-whisper rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-light to-secondary/5 shadow-xs flex items-center justify-center shrink-0">
          <svg
            className="w-4.5 h-4.5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold">TinyPlan Memory</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 ml-[42px]">
        So far we know:
      </p>

      <ul className="space-y-2.5 mb-4">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
            <span className="text-muted-foreground leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <p className="text-xs text-muted-foreground/80 bg-muted/50 rounded-xl px-4 py-3">
          {`Complete ${remaining} more ${remaining === 1 ? "activity" : "activities"} and we'll start spotting stronger patterns.`}
        </p>
      )}
    </div>
  );
}
