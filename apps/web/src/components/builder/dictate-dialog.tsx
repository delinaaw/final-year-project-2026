"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mic, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Waveform } from "@/components/respondent/waveform";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { api, ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { formatDuration } from "@/lib/utils";

export function DictateDialog({
  formId,
  open,
  onOpenChange,
}: {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const recorder = useAudioRecorder();
  const [description, setDescription] = useState("");
  const [recording, setRecording] = useState(false);

  const finish = (count: number) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    toast.success(`Added ${count} ${count === 1 ? "question" : "questions"}`);
    setDescription("");
    onOpenChange(false);
  };

  const fail = (error: unknown) => {
    toast.error(error instanceof ApiError ? error.message : "Could not draft questions");
  };

  const fromText = useMutation({
    mutationFn: () =>
      api.post<unknown[]>(`/forms/${formId}/questions/dictate`, { transcript: description }),
    onSuccess: (created) => finish(created.length),
    onError: fail,
  });

  const fromAudio = useMutation({
    mutationFn: (blob: Blob) => {
      const body = new FormData();
      body.append("audio", blob, "dictation.webm");
      return api.post<unknown[]>(`/forms/${formId}/questions/dictate/audio`, body);
    },
    onSuccess: (created) => finish(created.length),
    onError: fail,
  });

  const start = async () => {
    const started = await recorder.start();
    if (!started) {
      toast.error("We could not reach your microphone");
      return;
    }
    setRecording(true);
  };

  const stop = async () => {
    const result = await recorder.stop();
    setRecording(false);
    if (!result) {
      toast.error("Nothing was recorded");
      return;
    }
    fromAudio.mutate(result.blob);
  };

  const busy = fromText.isPending || fromAudio.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader
          title="Dictate questions"
          description="Describe the form out loud, or type it, and we will draft the questions for you."
        />

        {recording ? (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-muted p-6">
            <span className="flex items-center gap-2 rounded-full bg-feedback-error-subtle px-3 py-1.5 text-body-s text-feedback-error">
              <span className="size-2 animate-pulse rounded-full bg-feedback-error" />
              Recording · {formatDuration(recorder.elapsed)}
            </span>
            <Waveform peaks={recorder.peaks} active />
            <Button variant="danger" onClick={stop}>
              <Square className="size-4" />
              Stop and draft
            </Button>
          </div>
        ) : busy ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-brand-muted p-8">
            <Loader2 className="size-7 animate-spin text-brand" />
            <p className="text-body-m text-content-primary">Drafting your questions…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Button variant="secondary" size="lg" onClick={start} className="w-full gap-2">
              <Mic className="size-[18px]" />
              Describe it out loud
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-body-s text-content-placeholder">or type it</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="A short feedback form for a coffee shop. Ask how often they visit, what they usually order, how they rate the service out of five, and any comments."
              aria-label="Describe your form"
              className="focus-ring w-full resize-none rounded-xl border border-line bg-surface-page p-4 text-body-m text-content-primary placeholder:text-content-placeholder"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={() => fromText.mutate()}
            disabled={busy || recording || description.trim().length < 15}
          >
            Draft questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
