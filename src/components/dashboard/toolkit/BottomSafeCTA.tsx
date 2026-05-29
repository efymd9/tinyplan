interface BottomSafeCTAProps {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function BottomSafeCTA({
  label,
  sublabel,
  onClick,
  href,
  disabled = false,
  variant = "primary",
}: BottomSafeCTAProps) {
  const baseClass =
    "w-full flex items-center justify-center gap-2 rounded-full text-base font-semibold py-4 px-6 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-primary text-white cta-glow"
      : "bg-card border border-border text-foreground hover:border-primary/40";

  const content = (
    <>
      <span>{label}</span>
      {sublabel && <span className="text-xs font-normal opacity-70">{sublabel}</span>}
    </>
  );

  return (
    <div className="sticky bottom-0 glass-bar border-t border-border-whisper px-4 pt-3 pb-safe-bottom">
      {href ? (
        <a href={href} className={`${baseClass} ${variantClass}`}>
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`${baseClass} ${variantClass}`}
        >
          {content}
        </button>
      )}
    </div>
  );
}
