import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full h-12 px-4 text-base bg-card border-[1.5px] rounded-xl transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary-glow shadow-inner-subtle ${
            error ? "border-destructive" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
