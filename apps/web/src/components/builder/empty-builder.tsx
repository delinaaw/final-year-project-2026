"use client";

import { FileQuestion, Mic, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FEATURES } from "@/features/builder/config";

export function EmptyBuilder({
  onAddQuestion,
  onDictate,
  isPending,
}: {
  onAddQuestion: () => void;
  onDictate: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-muted">
        <FileQuestion className="size-[34px] text-brand" />
      </span>

      <div className="flex max-w-[520px] flex-col gap-2.5 text-center">
        <h2 className="text-[26px] font-bold leading-8 text-content-primary sm:text-[32px] sm:leading-10">
          No questions yet
        </h2>
        <p className="text-body-m leading-6 text-content-secondary sm:text-body-l">
          Add your first question, or describe the form out loud and let VoiceForm draft it for
          you.
        </p>
      </div>

      <div className="flex w-full max-w-[420px] flex-col gap-3.5 sm:flex-row">
        <Button size="lg" onClick={onAddQuestion} disabled={isPending} className="sm:w-[200px]">
          <Plus className="size-[18px]" />
          Add question
        </Button>
        {FEATURES.dictation ? (
          <Button size="lg" variant="secondary" onClick={onDictate} className="sm:w-[200px]">
            <Mic className="size-[18px]" />
            Dictate questions
          </Button>
        ) : null}
      </div>
    </div>
  );
}
