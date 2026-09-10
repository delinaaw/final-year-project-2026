"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { QUESTION_TYPES, type QuestionType } from "@/features/builder/api";

export function QuestionTypeSelect({
  value,
  onChange,
}: {
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}) {
  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as QuestionType)}>
      <Select.Trigger
        aria-label="Question type"
        className="focus-ring flex h-11 w-[200px] items-center justify-between gap-2 rounded-xl border border-line bg-surface-card px-3.5 text-body-m text-content-primary"
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-4 text-content-secondary" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 overflow-hidden rounded-xl border border-line bg-surface-card py-1.5 shadow-[0_8px_12px_0_rgb(1_3_62_/_0.08)]"
        >
          <Select.Viewport>
            {QUESTION_TYPES.map((type) => (
              <Select.Item
                key={type.value}
                value={type.value}
                className="flex cursor-pointer items-center justify-between gap-6 px-3.5 py-2.5 text-body-m text-content-primary outline-none data-[highlighted]:bg-surface-subtle"
              >
                <Select.ItemText>{type.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="size-4 text-brand" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
