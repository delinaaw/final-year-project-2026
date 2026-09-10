"use client";

import { Plus, X } from "lucide-react";

import type { QuestionType } from "@/features/builder/api";

interface OptionEditorProps {
  type: QuestionType;
  options: { id?: string; label: string }[];
  onChange: (options: { id?: string; label: string }[]) => void;
}

export function OptionEditor({ type, options, onChange }: OptionEditorProps) {
  const round = type === "multiple_choice";

  const update = (index: number, label: string) => {
    onChange(options.map((option, i) => (i === index ? { ...option, label } : option)));
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <div key={option.id ?? `new-${index}`} className="flex items-center gap-3">
          <span
            className={`size-[22px] shrink-0 border-[1.5px] border-line-strong bg-surface-card ${
              round ? "rounded-full" : "rounded-[6px]"
            }`}
          />
          <input
            value={option.label}
            onChange={(event) => update(index, event.target.value)}
            placeholder={`Option ${index + 1}`}
            aria-label={`Option ${index + 1}`}
            className="focus-ring min-w-0 flex-1 rounded border-b border-transparent bg-transparent py-1 text-body-m text-content-primary placeholder:text-content-placeholder hover:border-line focus:border-brand"
          />
          {options.length > 1 ? (
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove option ${index + 1}`}
              className="focus-ring rounded p-1 text-content-placeholder transition-colors hover:text-feedback-error"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...options, { label: `Option ${options.length + 1}` }])}
        className="focus-ring flex w-fit items-center gap-2 rounded px-1 py-1 text-body-m font-semibold text-brand"
      >
        <Plus className="size-4" />
        Add option
      </button>
    </div>
  );
}
