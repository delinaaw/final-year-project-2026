"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import type { Question } from "@/features/builder/api";

export function DeleteQuestionDialog({
  question,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  question: Question | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={Boolean(question)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Delete this question?"
          description={
            <>
              &ldquo;{question?.prompt || "Untitled question"}&rdquo; will be removed from the
              form. Answers already collected for it are kept.
            </>
          }
        />
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
