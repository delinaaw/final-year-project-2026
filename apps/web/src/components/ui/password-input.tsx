"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, invalid, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={invalid}
          className={cn(
            "focus-ring h-[52px] w-full rounded-lg border bg-surface-page pl-4 pr-12 text-body-m text-content-primary placeholder:text-content-placeholder",
            invalid ? "border-state-danger" : "border-line",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="focus-ring absolute right-4 top-1/2 -translate-y-1/2 rounded text-content-placeholder transition-colors hover:text-content-secondary"
        >
          <Icon className="size-5" />
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
