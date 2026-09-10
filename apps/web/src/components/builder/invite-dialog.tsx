"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useInvite } from "@/features/builder/use-share";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog({
  formId,
  open,
  onOpenChange,
}: {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const invite = useInvite(formId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const emails = value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setError("Enter at least one email address");
      return;
    }

    const invalid = emails.find((email) => !EMAIL_PATTERN.test(email));
    if (invalid) {
      setError(`${invalid} is not a valid email address`);
      return;
    }

    setError(null);
    invite.mutate(emails, {
      onSuccess: () => {
        setValue("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[571px]">
        <DialogHeader
          title="Invite someone"
          description="They receive a link to answer this form. Separate several addresses with commas."
        />
        <form onSubmit={submit} className="flex flex-col gap-6">
          <Field label="Email addresses" htmlFor="invite-emails" error={error ?? undefined}>
            <Input
              id="invite-emails"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="adjeicaleb@gmail.com"
              invalid={Boolean(error)}
              autoFocus
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
