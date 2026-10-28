import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] font-medium text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2.5 text-[15px] text-ink bg-surface",
            "border-2 rounded-[12px] outline-none transition-all duration-150",
            "placeholder:text-muted",
            error
              ? "border-danger focus:ring-2 focus:ring-danger/30"
              : "border-line focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-danger mt-0.5" role="alert">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-[12px] text-muted mt-0.5">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
