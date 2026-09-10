import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid}
      className={cn(
        "focus-ring h-[52px] w-full rounded-lg border bg-surface-page px-4 text-body-m text-content-primary placeholder:text-content-placeholder disabled:cursor-not-allowed disabled:bg-surface-subtle",
        invalid ? "border-state-danger" : "border-line",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
