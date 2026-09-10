"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import type { FormSummary } from "@/features/forms/api";

interface DeleteFormDialogProps {
  form: FormSummary | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteFormDialog({
  form,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteFormDialogProps) {
  const count = form?.response_count ?? 0;

  return (
    <Dialog open={Boolean(form)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Delete this form?"
          description={
            <>
              &ldquo;{form?.title}&rdquo; and all {count}{" "}
              {count === 1 ? "response" : "responses"} will be permanently deleted. This cannot be
              undone.
            </>
          }
        />
        {count > 0 ? (
          <p className="rounded-xl bg-feedback-warning-subtle px-4 py-3 text-body-s text-feedback-warning">
            Download responses first if you still need them.
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
