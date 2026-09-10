"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FormSummary } from "@/features/forms/api";

interface CloseResponsesDialogProps {
  form: FormSummary | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message?: string) => void;
  isPending: boolean;
}

export function CloseResponsesDialog({
  form,
  onOpenChange,
  onConfirm,
  isPending,
}: CloseResponsesDialogProps) {
  const [custom, setCustom] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Dialog open={Boolean(form)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Stop accepting responses?"
          description="The form link will stay live but show a closed message. You can reopen it at any time."
        />

        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              className="mt-0.5"
              checked={custom}
              onCheckedChange={(value) => setCustom(value === true)}
            />
            <span className="flex flex-col gap-1">
              <span className="text-body-m text-content-primary">Show a custom closing message</span>
              <span className="text-body-s text-content-secondary">
                Otherwise respondents see the default notice
              </span>
            </span>
          </label>

          {custom ? (
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Thanks, we have everything we need."
              maxLength={500}
            />
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(custom && message.trim() ? message.trim() : undefined)}
            disabled={isPending}
          >
            {isPending ? "Closing…" : "Close responses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
