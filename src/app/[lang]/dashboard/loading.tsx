// Skeleton shown while a dashboard route segment streams in. Server component,
// no params/data — mirrors the dashboard's card aesthetic (premium-card, rounded
// surfaces) with simple muted pulse blocks. No new deps.
function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div
      className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 max-w-5xl mx-auto animate-pulse"
      role="status"
      aria-label="Loading"
    >
      {/* Main column */}
      <div className="min-w-0">
        {/* Hero card */}
        <div className="hero-card p-6 mb-5">
          <Block className="h-3 w-24 mb-4" />
          <Block className="h-6 w-3/4 mb-3" />
          <Block className="h-4 w-full mb-2" />
          <Block className="h-4 w-5/6" />
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-6 px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-muted" />
          ))}
          <Block className="h-3 w-16 ml-1.5" />
        </div>

        {/* Accordion card placeholders */}
        <div className="space-y-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <Block className="h-3 w-20 mb-2" />
                  <Block className="h-4 w-2/3" />
                </div>
                <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="premium-card rounded-2xl p-5">
            <Block className="h-3 w-24 mb-3" />
            <Block className="h-4 w-3/4 mb-2" />
            <Block className="h-3 w-1/2" />
          </div>
        ))}
      </aside>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
