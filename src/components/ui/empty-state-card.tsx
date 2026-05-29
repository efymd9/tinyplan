interface EmptyStateCardProps {
  icon?: React.ReactNode;
  message: string;
  subMessage?: string;
  className?: string;
}

export function EmptyStateCard({ icon, message, subMessage, className = "" }: EmptyStateCardProps) {
  return (
    <div className={`text-center py-5 px-4 bg-muted/40 rounded-xl ${className}`}>
      {icon && (
        <div className="flex justify-center mb-3">{icon}</div>
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
      {subMessage && (
        <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{subMessage}</p>
      )}
    </div>
  );
}
