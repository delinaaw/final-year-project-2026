"use client";

import { CheckCircle2, Copy, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InviteDialog } from "@/components/builder/invite-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AudienceType } from "@/features/builder/settings-api";
import { usePublish } from "@/features/builder/use-share";

const VOICE_OPTIONS = [
  { key: "read_questions_aloud", label: "Read questions out loud" },
  { key: "show_live_transcription", label: "Show Live Transcription" },
] as const;

export function PublishDialog({
  formId,
  open,
  onOpenChange,
}: {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [audience, setAudience] = useState<AudienceType>("anyone_with_link");
  const [readAloud, setReadAloud] = useState(true);
  const [liveTranscription, setLiveTranscription] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const publish = usePublish(formId);

  const voiceState: Record<string, [boolean, (value: boolean) => void]> = {
    read_questions_aloud: [readAloud, setReadAloud],
    show_live_transcription: [liveTranscription, setLiveTranscription],
  };

  const submit = () =>
    publish.mutate(
      {
        audience,
        read_questions_aloud: readAloud,
        show_live_transcription: liveTranscription,
        allow_review_and_edit: allowReview,
      },
      { onSuccess: (result) => setPublishedUrl(result.respondent_url) },
    );

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) setPublishedUrl(null);
  };

  const copy = () => {
    if (!publishedUrl) return;
    void navigator.clipboard.writeText(publishedUrl);
    toast.success("Link copied");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[551px]">
          {publishedUrl ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-feedback-success-subtle">
                <CheckCircle2 className="size-7 text-feedback-success" />
              </span>
              <DialogHeader
                title="Form Published"
                description="Your form is live and ready to accept responses."
              />
              <div className="flex flex-col gap-2">
                <span className="text-body-s font-semibold text-content-primary">
                  Respondent Link
                </span>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <span className="flex h-[52px] min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-line bg-surface-page px-4 text-body-m text-content-primary">
                    <span className="truncate">{publishedUrl}</span>
                  </span>
                  <Button onClick={copy} className="h-[52px] gap-2 sm:w-[120px]">
                    <Copy className="size-[17px]" />
                    Copy
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => close(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader title="Publish Form" />

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-body-l font-medium text-content-primary">
                    Who can respond?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInviting(true)}
                    className="focus-ring rounded text-body-m font-semibold text-content-link"
                  >
                    Invite someone
                  </button>
                </div>

                <RadioGroup
                  value={audience}
                  onValueChange={(value) => setAudience(value as AudienceType)}
                  className="flex flex-col gap-4"
                >
                  {[
                    { value: "anyone_with_link", label: "Anyone with link" },
                    { value: "invited_only", label: "Only Invited respondents" },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <RadioGroupItem value={option.value} />
                      <span className="text-body-s text-content-primary">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-body-l font-medium text-content-primary">Voice Settings</h3>
                <div className="flex flex-col gap-2">
                  {VOICE_OPTIONS.map((option) => {
                    const [checked, setChecked] = voiceState[option.key]!;
                    return (
                      <label key={option.key} className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => setChecked(value === true)}
                        />
                        <span className="text-body-s text-content-primary">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-body-l font-medium text-content-primary">Before Submission</h3>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={allowReview}
                    onCheckedChange={(value) => setAllowReview(value === true)}
                  />
                  <span className="text-body-s text-content-primary">
                    Allow review and edit of answers
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-brand-muted px-3 py-3">
                <Info className="size-5 shrink-0 text-brand" />
                <span className="text-body-s text-content-primary">
                  This form will accept responses once published.
                </span>
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => close(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={publish.isPending}>
                  {publish.isPending ? "Publishing…" : "Publish"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <InviteDialog formId={formId} open={inviting} onOpenChange={setInviting} />
    </>
  );
}
