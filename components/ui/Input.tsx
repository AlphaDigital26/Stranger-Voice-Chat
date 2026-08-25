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
            className="text-[14px] font-medium text-[#18181B]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2.5 text-[14px] text-[#18181B] bg-white",
            "border rounded-[8px] outline-none transition-all duration-150",
            "placeholder:text-[#71717A]",
            error
              ? "border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/30"
              : "border-[#E5E5E8] focus:ring-2 focus:ring-[#7C5CFC]/40 focus:border-[#7C5CFC]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[#EF4444] mt-0.5" role="alert">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-[12px] text-[#71717A] mt-0.5">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
