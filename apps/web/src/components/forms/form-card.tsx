"use client";

import { Copy, Lock, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusChip } from "@/components/ui/status-chip";
import type { FormSummary } from "@/features/forms/api";
import { formatRelativeDate } from "@/lib/utils";

const SKELETON_WIDTHS = [232, 196, 232, 164];

export interface FormCardActions {
  onRename: (form: FormSummary) => void;
  onDuplicate: (form: FormSummary) => void;
  onShare: (form: FormSummary) => void;
  onCloseResponses: (form: FormSummary) => void;
  onDelete: (form: FormSummary) => void;
}

export function FormActionsMenu({
  form,
  onRename,
  onDuplicate,
  onShare,
  onCloseResponses,
  onDelete,
}: FormCardActions & { form: FormSummary }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${form.title}`}
        className="focus-ring shrink-0 rounded-lg p-1 text-content-secondary transition-colors hover:bg-surface-subtle"
      >
        <MoreVertical className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onRename(form)}>
          <Pencil className="size-[18px]" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDuplicate(form)}>
          <Copy className="size-[18px]" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onShare(form)}>
          <Share2 className="size-[18px]" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onCloseResponses(form)}
          disabled={form.status !== "live"}
          className="data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
        >
          <Lock className="size-[18px]" />
          Close responses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => onDelete(form)}>
          <Trash2 className="size-[18px]" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FormCard({ form, ...actions }: FormCardActions & { form: FormSummary }) {
  const meta =
    form.status === "draft"
      ? `Edited ${formatRelativeDate(form.updated_at)}`
      : `${form.response_count} ${form.response_count === 1 ? "response" : "responses"}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-card shadow-card transition-shadow hover:shadow-[0_12px_20px_0_rgb(128_125_254_/_0.14)]">
      <Link
        href={`/forms/${form.id}/build`}
        className="focus-ring flex h-[164px] flex-col gap-[9px] bg-surface-page px-[22px] py-5"
        aria-label={`Open ${form.title}`}
      >
        <span className="h-2.5 w-[120px] rounded bg-brand" />
        {SKELETON_WIDTHS.map((width, index) => (
          <span
            key={index}
            className="h-5 max-w-full rounded-md border border-line bg-surface-card"
            style={{ width }}
          />
        ))}
      </Link>

      <div className="flex min-h-[104px] items-center justify-between gap-2 bg-surface-card py-4 pl-[18px] pr-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link
            href={`/forms/${form.id}/build`}
            className="focus-ring truncate rounded text-body-m font-semibold leading-5 text-content-primary"
          >
            {form.title}
          </Link>
          <div className="flex items-center gap-2">
            <StatusChip status={form.status} />
            <span className="truncate text-[12px] leading-4 text-content-secondary">{meta}</span>
          </div>
        </div>

        <FormActionsMenu form={form} {...actions} />
      </div>
    </article>
  );
}
