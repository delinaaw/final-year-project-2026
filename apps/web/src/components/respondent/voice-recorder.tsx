"use client";

import { CircleAlert, Keyboard, Loader2, Mic, RotateCcw, Square } from "lucide-react";

import { Waveform } from "@/components/respondent/waveform";
import { Button } from "@/components/ui/button";
import type { RecorderState } from "@/hooks/use-audio-recorder";
import { formatDuration } from "@/lib/utils";

export type VoiceStage =
  | "idle"
  | "permission"
  | "blocked"
  | "recording"
  | "processing"
  | "not_recognised"
  | "recorded";

interface VoiceRecorderProps {
  stage: VoiceStage;
  recorderState: RecorderState;
  elapsed: number;
  peaks: number[];
  transcript: string | null;
  matchedLabel?: string | null;
  liveText?: string;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onSwitchToTyping: () => void;
}

export function VoiceRecorder({
  stage,
  elapsed,
  peaks,
  transcript,
  matchedLabel,
  liveText,
  onStart,
  onStop,
  onCancel,
  onRetry,
  onSwitchToTyping,
}: VoiceRecorderProps) {
  if (stage === "blocked") {
    return (
      <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface-page p-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-body-l font-semibold text-content-primary">
            Microphone is blocked
          </h2>
          <p className="text-body-m leading-6 text-content-secondary">
            This site does not have permission to use your microphone. You can still complete the
            form by typing.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-body-s font-semibold text-content-primary">To turn it back on</span>
          <ol className="flex flex-col gap-2">
            {[
              "Click the lock icon in your browser address bar",
              "Set Microphone to Allow",
              "Reload this page",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-[12px] text-content-secondary">
                  {index + 1}
                </span>
                <span className="text-body-s leading-5 text-content-secondary">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onSwitchToTyping}>
            <Keyboard className="size-[18px]" />
            Continue by typing
          </Button>
          <Button variant="ghost" onClick={onStart}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "recording") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-muted p-6">
          <span className="flex items-center gap-2 rounded-full bg-feedback-error-subtle px-3 py-1.5 text-body-s text-feedback-error">
            <span className="size-2 animate-pulse rounded-full bg-feedback-error" />
            Recording · {formatDuration(elapsed)}
          </span>
          <Waveform peaks={peaks} active />
          {liveText ? (
            <p
              aria-live="polite"
              className="max-h-24 overflow-y-auto text-center text-body-m leading-6 text-content-primary"
            >
              {liveText}
            </p>
          ) : (
            <p className="text-center text-body-s text-content-secondary">
              Speak naturally. Press stop when you are done.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="danger" onClick={onStop}>
            <Square className="size-4" />
            Stop recording
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-brand-muted p-8">
        <Loader2 className="size-7 animate-spin text-brand" />
        <p className="text-body-l font-semibold text-content-primary">
          Turning your answer into text…
        </p>
        <p className="text-body-s text-content-secondary">
          This usually takes a couple of seconds.
        </p>
      </div>
    );
  }

  if (stage === "not_recognised") {
    return (
      <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface-page p-5">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-feedback-warning" />
          <div className="flex flex-col gap-2">
            <h2 className="text-body-l font-semibold text-content-primary">
              We didn&apos;t catch that
            </h2>
            <p className="text-body-m leading-6 text-content-secondary">
              The recording came through too quietly to read. Try again, or type your answer
              instead.
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 pl-8">
          {[
            "Move somewhere quieter if you can",
            "Hold the device closer when you speak",
            "Check the right microphone is selected",
          ].map((tip) => (
            <li key={tip} className="text-body-s leading-5 text-content-secondary">
              · {tip}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onRetry}>
            <RotateCcw className="size-[18px]" />
            Record again
          </Button>
          <Button variant="secondary" onClick={onSwitchToTyping}>
            <Keyboard className="size-[18px]" />
            Type instead
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "recorded" && transcript) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5 rounded-xl border border-feedback-success/30 bg-feedback-success-subtle p-5">
          <span className="text-body-s font-semibold text-feedback-success">Answer recorded</span>
          <p className="text-body-m leading-6 text-content-primary">&ldquo;{transcript}&rdquo;</p>
          {matchedLabel ? (
            <p className="text-body-s text-content-secondary">
              Recorded as <span className="font-semibold text-content-primary">{matchedLabel}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onRetry}>
            <RotateCcw className="size-[18px]" />
            Record again
          </Button>
          <Button variant="ghost" onClick={onSwitchToTyping}>
            Edit as text
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-muted p-8">
      <button
        type="button"
        onClick={onStart}
        aria-label="Record your answer"
        className="focus-ring flex size-24 items-center justify-center rounded-full bg-brand-gradient text-white shadow-card transition-transform hover:scale-105"
      >
        <Mic className="size-10" />
      </button>
      <p className="text-body-m text-content-secondary">Tap the microphone to speak your answer</p>
    </div>
  );
}
