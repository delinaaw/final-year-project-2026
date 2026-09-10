import { Calendar, ChevronDown, Star, Upload } from "lucide-react";

import type { Question } from "@/features/builder/api";

function OptionList({ question }: { question: Question }) {
  const round = question.type === "multiple_choice";
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center gap-3">
          <span
            className={`size-[22px] shrink-0 border-[1.5px] border-line-strong bg-surface-card ${
              round ? "rounded-full" : "rounded-[6px]"
            }`}
          />
          <span className="text-body-m text-content-secondary">{option.label}</span>
        </div>
      ))}
    </div>
  );
}

export function QuestionPreview({ question }: { question: Question }) {
  switch (question.type) {
    case "multiple_choice":
    case "checkboxes":
      return <OptionList question={question} />;

    case "dropdown":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex h-12 w-full max-w-[340px] items-center justify-between rounded-xl border border-line bg-surface-page pl-4 pr-3.5">
            <span className="text-body-m text-content-placeholder">Choose an option</span>
            <ChevronDown className="size-[18px] text-content-secondary" />
          </div>
          <span className="text-[12px] leading-4 text-content-placeholder">
            {question.options.length} options · respondents pick one
          </span>
        </div>
      );

    case "short_answer":
      return (
        <div className="h-11 w-full border-b border-line pl-0.5 pt-2.5">
          <span className="text-body-m text-content-placeholder">Short answer text</span>
        </div>
      );

    case "paragraph":
      return (
        <div className="h-[88px] w-full border-b border-line pl-0.5 pt-2.5">
          <span className="text-body-m text-content-placeholder">Long answer text</span>
        </div>
      );

    case "date":
      return (
        <div className="flex h-12 w-full max-w-[260px] items-center justify-between rounded-xl border border-line bg-surface-page pl-4 pr-3.5">
          <span className="text-body-m text-content-placeholder">DD / MM / YYYY</span>
          <Calendar className="size-[18px] text-content-secondary" />
        </div>
      );

    case "rating":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-[30px] text-line-strong" />
            ))}
          </div>
          <span className="text-[12px] leading-4 text-content-placeholder">
            1 = Poor · 5 = Excellent
          </span>
        </div>
      );

    case "file_upload":
      return (
        <div className="flex h-[116px] w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-line-strong bg-surface-page">
          <Upload className="size-[26px] text-content-secondary" />
          <span className="text-body-s text-content-secondary">
            Drag a file here or click to browse
          </span>
          <span className="text-[12px] leading-4 text-content-placeholder">
            PDF, PNG or JPG · up to 10 MB
          </span>
        </div>
      );

    default:
      return null;
  }
}
