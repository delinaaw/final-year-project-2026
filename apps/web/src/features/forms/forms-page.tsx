"use client";

import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CloseResponsesDialog } from "@/components/forms/close-responses-dialog";
import { DeleteFormDialog } from "@/components/forms/delete-form-dialog";
import { EmptyFormsState } from "@/components/forms/empty-forms-state";
import { FormCard } from "@/components/forms/form-card";
import { FormCardSkeleton } from "@/components/forms/form-card-skeleton";
import { FormRow } from "@/components/forms/form-row";
import { RenameFormDialog } from "@/components/forms/rename-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FormStatus, FormSummary } from "@/features/forms/api";
import {
  useCloseResponses,
  useCreateForm,
  useDeleteForm,
  useDuplicateForm,
  useFormsList,
  useRenameForm,
} from "@/features/forms/use-forms";
import { useDebounced } from "@/hooks/use-debounced";
import { cn } from "@/lib/utils";

const FILTERS: { value: FormStatus | "all"; label: string }[] = [
  { value: "all", label: "All forms" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
];

export function FormsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FormStatus | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [renaming, setRenaming] = useState<FormSummary | null>(null);
  const [deleting, setDeleting] = useState<FormSummary | null>(null);
  const [closing, setClosing] = useState<FormSummary | null>(null);

  const debouncedSearch = useDebounced(search, 300);
  const { data: forms, isPending } = useFormsList(debouncedSearch, status);

  const createForm = useCreateForm();
  const renameForm = useRenameForm();
  const duplicateForm = useDuplicateForm();
  const deleteForm = useDeleteForm();
  const closeResponses = useCloseResponses();

  const actions = {
    onRename: setRenaming,
    onDuplicate: (form: FormSummary) => duplicateForm.mutate(form.id),
    onShare: (form: FormSummary) => {
      void navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
      toast.success("Respondent link copied");
    },
    onCloseResponses: setClosing,
    onDelete: setDeleting,
  };

  const isFiltering = Boolean(debouncedSearch) || status !== "all";
  const showEmptyState = !isPending && forms?.length === 0 && !isFiltering;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-5 pb-10 pt-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[28px] font-bold leading-9 text-content-primary sm:text-[32px] sm:leading-10">
          My Forms
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:w-[360px] sm:flex-none">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-content-placeholder" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search forms"
              aria-label="Search forms"
              className="focus-ring h-12 w-full rounded-xl border border-line bg-surface-card pl-11 pr-4 text-body-m text-content-primary placeholder:text-content-placeholder"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Filter forms"
              className={cn(
                "focus-ring flex size-12 shrink-0 items-center justify-center rounded-xl border bg-surface-card transition-colors",
                status === "all" ? "border-line text-content-secondary" : "border-brand text-brand",
              )}
            >
              <SlidersHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {FILTERS.map((filter) => (
                <DropdownMenuItem
                  key={filter.value}
                  onSelect={() => setStatus(filter.value)}
                  className={status === filter.value ? "font-semibold text-brand" : undefined}
                >
                  {filter.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => createForm.mutate({})}
            disabled={createForm.isPending}
            className="h-12 shrink-0 sm:w-[160px]"
          >
            <Plus className="size-[18px]" />
            New Form
          </Button>
        </div>
      </div>

      {showEmptyState ? (
        <EmptyFormsState
          onSelect={() => createForm.mutate({})}
          isPending={createForm.isPending}
        />
      ) : (
        <>
          <div className="flex justify-end">
            <div className="flex gap-1 rounded-[10px] bg-surface-subtle p-1">
              {(["list", "grid"] as const).map((mode) => {
                const Icon = mode === "list" ? List : LayoutGrid;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    aria-label={`${mode} view`}
                    aria-pressed={view === mode}
                    className={cn(
                      "focus-ring flex h-8 w-9 items-center justify-center rounded-lg transition-colors",
                      view === mode
                        ? "bg-surface-card text-content-primary shadow-sm"
                        : "text-content-secondary",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </button>
                );
              })}
            </div>
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <FormCardSkeleton key={index} />
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {forms.map((form) => (
                  <FormCard key={form.id} form={form} {...actions} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {forms.map((form) => (
                  <FormRow key={form.id} form={form} {...actions} />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-body-l font-semibold text-content-primary">No forms match</p>
              <p className="text-body-m text-content-secondary">
                Try a different search or clear the filter.
              </p>
            </div>
          )}
        </>
      )}

      <RenameFormDialog
        form={renaming}
        onOpenChange={(open) => !open && setRenaming(null)}
        isPending={renameForm.isPending}
        onConfirm={(title) => {
          if (!renaming) return;
          renameForm.mutate({ formId: renaming.id, title }, { onSuccess: () => setRenaming(null) });
        }}
      />

      <DeleteFormDialog
        form={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        isPending={deleteForm.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteForm.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />

      <CloseResponsesDialog
        form={closing}
        onOpenChange={(open) => !open && setClosing(null)}
        isPending={closeResponses.isPending}
        onConfirm={(message) => {
          if (!closing) return;
          closeResponses.mutate(
            { formId: closing.id, message },
            { onSuccess: () => setClosing(null) },
          );
        }}
      />
    </div>
  );
}
