import type { FormStatus } from "@/features/forms/api";
import { cn } from "@/lib/utils";

const STYLES: Record<FormStatus, string> = {
  live: "bg-feedback-success-subtle text-feedback-success",
  draft: "bg-surface-subtle text-content-secondary",
  closed: "bg-feedback-warning-subtle text-feedback-warning",
};

const LABELS: Record<FormStatus, string> = {
  live: "Live",
  draft: "Draft",
  closed: "Closed",
};

export function StatusChip({ status }: { status: FormStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[12px] leading-4",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
