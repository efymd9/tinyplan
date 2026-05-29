interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  onAction,
}: EmptyStateCardProps) {
  return (
    <div className="tk-card flex flex-col items-center text-center px-6 py-10 gap-3">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {description}
        </p>
      )}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full cta-glow"
        >
          {action}
        </button>
      )}
    </div>
  );
}
