"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  stageLabel?: string;
}

export function ProgressBar({ current, total, stageLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full">
      {stageLabel && (
        <p className="text-[11px] text-muted-foreground mb-1.5 font-medium tracking-wide">
          {stageLabel}
        </p>
      )}
      <div className="w-full h-[6px] bg-muted rounded-full overflow-hidden shadow-inner-subtle">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary-hover rounded-full transition-all duration-500 ease-out relative overflow-hidden progress-shine"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
