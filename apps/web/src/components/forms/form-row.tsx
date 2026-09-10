"use client";

import Link from "next/link";

import { FormActionsMenu, type FormCardActions } from "@/components/forms/form-card";
import { StatusChip } from "@/components/ui/status-chip";
import type { FormSummary } from "@/features/forms/api";
import { formatRelativeDate } from "@/lib/utils";

export function FormRow({ form, ...actions }: FormCardActions & { form: FormSummary }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-card px-4 py-3.5 sm:gap-4">
      <span className="hidden h-9 w-1.5 shrink-0 rounded bg-brand sm:block" />
      <Link
        href={`/forms/${form.id}/build`}
        className="focus-ring min-w-0 flex-1 truncate rounded text-body-m font-semibold text-content-primary"
      >
        {form.title}
      </Link>
      <StatusChip status={form.status} />
      <span className="hidden w-28 shrink-0 text-right text-[12px] text-content-secondary sm:block">
        {form.response_count} {form.response_count === 1 ? "response" : "responses"}
      </span>
      <span className="hidden w-24 shrink-0 text-right text-[12px] text-content-secondary md:block">
        {formatRelativeDate(form.updated_at)}
      </span>
      <FormActionsMenu form={form} {...actions} />
    </div>
  );
}
