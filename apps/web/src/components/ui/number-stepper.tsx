"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 100000,
  label,
  placeholder = "No limit",
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  label: string;
  placeholder?: string;
}) {
  const step = (delta: number) => {
    const next = (value ?? min - 1) + delta;
    if (next < min) onChange(null);
    else onChange(Math.min(next, max));
  };

  return (
    <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-line bg-surface-page px-4 py-2">
      <input
        type="number"
        aria-label={label}
        value={value ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Math.max(min, Math.min(Number(raw), max)));
        }}
        className="min-w-0 flex-1 bg-transparent text-body-m text-content-primary outline-none placeholder:text-content-placeholder [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Increase ${label}`}
          className="focus-ring rounded text-content-secondary hover:text-content-primary"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Decrease ${label}`}
          className="focus-ring rounded text-content-secondary hover:text-content-primary"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}
