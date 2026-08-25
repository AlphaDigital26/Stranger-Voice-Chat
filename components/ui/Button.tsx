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
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2 select-none active:scale-95";

    const variants = {
      primary: "bg-[#7C5CFC] text-white hover:bg-[#6547E0] hover:shadow-glow shadow-sm",
      secondary: "bg-white text-[#18181B] border border-[#E5E5E8] hover:bg-[#FAFAFA] hover:shadow-card",
      destructive: "bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#DC2626]",
      ghost: "bg-transparent text-[#18181B] hover:bg-[#F4F4F5] active:bg-[#E5E5E8]",
      neutral: "bg-[#64748B] text-white hover:bg-[#475569] active:bg-[#475569]",
    };

    const sizes = {
      sm: "text-[12px] px-3 py-1.5 min-h-[32px]",
      md: "text-[14px] px-4 py-2 min-h-[40px]",
      lg: "text-[16px] px-6 py-3 min-h-[48px]",
    };

    const disabledStyles = "opacity-40 cursor-not-allowed pointer-events-none";
    const radiusStyle = pill ? "rounded-full" : "rounded-[8px]";

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
