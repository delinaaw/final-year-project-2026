"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormSummary } from "@/features/forms/api";

interface RenameFormDialogProps {
  form: FormSummary | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (title: string) => void;
  isPending: boolean;
}

export function RenameFormDialog({
  form,
  onOpenChange,
  onConfirm,
  isPending,
}: RenameFormDialogProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (form) setTitle(form.title);
  }, [form]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <Dialog open={Boolean(form)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader title="Rename" description="Enter the new name for the form" />
        <form onSubmit={submit} className="flex flex-col gap-6">
          <Field label="Form name" htmlFor="form-title">
            <Input
              id="form-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Untitled Form"
              autoFocus
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
