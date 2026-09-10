"use client";

import { FileText, Plus } from "lucide-react";

const OPTIONS = [
  {
    id: "blank",
    icon: Plus,
    title: "Start blank",
    body: "Add questions one at a time in the builder.",
    badge: null,
  },
] as const;

export function EmptyFormsState({
  onSelect,
  isPending,
}: {
  onSelect: (option: (typeof OPTIONS)[number]["id"]) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-8 py-12 lg:py-20">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-muted">
        <FileText className="size-7 text-brand" />
      </span>

      <div className="flex max-w-[440px] flex-col gap-3 text-center">
        <h2 className="text-[28px] font-bold leading-9 text-content-primary sm:text-[32px] sm:leading-10">
          No forms yet
        </h2>
        <p className="text-body-m leading-6 text-content-secondary">
          Create your first form and start collecting answers people can simply speak.
        </p>
      </div>

      <div className="grid w-full max-w-[320px] grid-cols-1 gap-4">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const highlighted = true;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={isPending}
              className={`focus-ring flex flex-col items-start gap-3 rounded-2xl border bg-surface-card p-5 text-left transition-colors hover:border-brand disabled:opacity-60 ${
                highlighted ? "border-brand" : "border-line"
              }`}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted">
                <Icon className="size-5 text-brand" />
              </span>
              <span className="text-body-l font-semibold text-content-primary">
                {option.title}
              </span>
              <span className="text-body-s leading-5 text-content-secondary">{option.body}</span>
              {option.badge ? (
                <span className="rounded-full bg-brand-muted px-2.5 py-1 text-[12px] leading-4 text-brand">
                  {option.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
