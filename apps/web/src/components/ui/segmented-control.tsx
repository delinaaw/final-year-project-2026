"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-4 rounded-2xl bg-surface-subtle p-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "focus-ring flex-1 rounded-2xl p-2.5 text-body-m transition-colors",
            value === option.value
              ? "bg-surface-card text-content-primary shadow-sm"
              : "text-content-secondary hover:text-content-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
