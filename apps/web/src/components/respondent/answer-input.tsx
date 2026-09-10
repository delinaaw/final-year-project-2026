"use client";

import { Star } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PublicQuestion } from "@/features/respondent/api";
import { cn } from "@/lib/utils";

export interface AnswerValue {
  text: string;
  optionIds: string[];
  rating: number | null;
}

export const EMPTY_ANSWER: AnswerValue = { text: "", optionIds: [], rating: null };

const MAX_TEXT = 500;

interface AnswerInputProps {
  question: PublicQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

export function AnswerInput({ question, value, onChange }: AnswerInputProps) {
  switch (question.type) {
    case "multiple_choice":
    case "dropdown":
      return (
        <RadioGroup
          value={value.optionIds[0] ?? ""}
          onValueChange={(id) => onChange({ ...value, optionIds: [id] })}
          className="flex flex-col gap-3"
        >
          {question.options.map((option) => (
            <label
              key={option.id}
              className="focus-within:border-brand flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-card px-4 py-3.5 transition-colors hover:border-brand"
            >
              <RadioGroupItem value={option.id} />
              <span className="text-body-m text-content-primary">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      );

    case "checkboxes":
      return (
        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const checked = value.optionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-card px-4 py-3.5 transition-colors hover:border-brand"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) =>
                    onChange({
                      ...value,
                      optionIds: next
                        ? [...value.optionIds, option.id]
                        : value.optionIds.filter((id) => id !== option.id),
                    })
                  }
                />
                <span className="text-body-m text-content-primary">{option.label}</span>
              </label>
            );
          })}
        </div>
      );

    case "paragraph":
      return (
        <div className="flex flex-col gap-2">
          <textarea
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
            maxLength={MAX_TEXT}
            rows={5}
            placeholder="Type your answer"
            aria-label={question.prompt}
            className="focus-ring w-full resize-none rounded-xl border border-line bg-surface-card p-4 text-body-m text-content-primary placeholder:text-content-placeholder"
          />
          <span className="self-end text-[12px] text-content-placeholder">
            {value.text.length} / {MAX_TEXT}
          </span>
        </div>
      );

    case "date":
      return (
        <Input
          type="date"
          value={value.text}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
          aria-label={question.prompt}
          className="max-w-[260px]"
        />
      );

    case "rating":
      return (
        <div className="flex items-center gap-3">
          {Array.from({ length: 5 }).map((_, index) => {
            const score = index + 1;
            const filled = (value.rating ?? 0) >= score;
            return (
              <button
                key={score}
                type="button"
                aria-label={`${score} out of 5`}
                aria-pressed={filled}
                onClick={() => onChange({ ...value, rating: score })}
                className="focus-ring rounded"
              >
                <Star
                  className={cn(
                    "size-9 transition-colors",
                    filled ? "fill-brand text-brand" : "text-line-strong",
                  )}
                />
              </button>
            );
          })}
        </div>
      );

    default:
      return (
        <Input
          value={value.text}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
          placeholder="Type your answer"
          aria-label={question.prompt}
          maxLength={MAX_TEXT}
        />
      );
  }
}

export function isAnswered(question: PublicQuestion, value: AnswerValue) {
  if (question.type === "rating") return value.rating !== null;
  if (["multiple_choice", "checkboxes", "dropdown"].includes(question.type)) {
    return value.optionIds.length > 0;
  }
  return value.text.trim().length > 0;
}
