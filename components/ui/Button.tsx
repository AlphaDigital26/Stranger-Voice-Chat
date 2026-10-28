import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "neutral";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", pill = false, loading = false, className, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none active:translate-y-px";

    // Whiteboard style: solid marker colours, or a card-coloured button with a 2px outline
    const variants = {
      primary: "bg-primary text-on-primary border-2 border-primary hover:bg-primary-hover hover:border-primary-hover",
      secondary: "bg-surface text-ink border-2 border-outline hover:bg-paper-2",
      destructive: "bg-danger-strong text-white border-2 border-danger hover:bg-danger-hover hover:border-danger-hover",
      ghost: "bg-transparent text-ink border-2 border-transparent hover:bg-paper-2",
      neutral: "bg-ink text-paper border-2 border-ink hover:bg-muted hover:border-muted",
    };

    const sizes = {
      sm: "text-[13px] px-3 py-1.5 min-h-[36px]",
      md: "text-[14px] px-4 py-2 min-h-[44px]",
      lg: "text-[16px] px-6 py-3 min-h-[52px]",
    };

    // Flat and readable on the dark board (a faded primary fill was too low-contrast)
    const disabledStyles = "bg-paper-2! text-muted! border-line! cursor-not-allowed pointer-events-none";
    const radiusStyle = pill ? "rounded-full" : "rounded-[12px]";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          radiusStyle,
          (disabled || loading) && disabledStyles,
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
