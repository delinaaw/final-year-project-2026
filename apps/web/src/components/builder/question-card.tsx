"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { OptionEditor } from "@/components/builder/option-editor";
import { QuestionPreview } from "@/components/builder/question-preview";
import { QuestionTypeSelect } from "@/components/builder/question-type-select";
import { Switch } from "@/components/ui/switch";
import { needsOptions, type Question, type QuestionInput, type QuestionType } from "@/features/builder/api";
import { useDebounced } from "@/hooks/use-debounced";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onChange: (body: Partial<QuestionInput>) => void;
  onDelete: () => void;
}

export function QuestionCard({
  question,
  index,
  isActive,
  onActivate,
  onChange,
  onDelete,
}: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const [prompt, setPrompt] = useState(question.prompt);
  const debouncedPrompt = useDebounced(prompt, 700);

  useEffect(() => setPrompt(question.prompt), [question.prompt]);

  useEffect(() => {
    if (debouncedPrompt !== question.prompt) onChange({ prompt: debouncedPrompt });
  }, [debouncedPrompt]);

  const changeType = (type: QuestionType) => {
    const options = needsOptions(type)
      ? question.options.length > 0
        ? question.options.map((option) => ({ id: option.id, label: option.label }))
        : [{ label: "Option 1" }]
      : [];
    onChange({ type, options });
  };

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onActivate}
      className={cn(
        "flex gap-3.5 rounded-2xl border bg-surface-card py-6 pl-4 pr-5 transition-shadow sm:pl-[18px] sm:pr-6",
        isActive ? "border-brand shadow-card" : "border-line",
        isDragging && "z-10 opacity-80 shadow-card",
      )}
    >
      <button
        type="button"
        aria-label={`Reorder question ${index + 1}`}
        className="focus-ring mt-1 h-fit cursor-grab rounded text-content-placeholder active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {isActive ? (
          <>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Type your question"
              aria-label={`Question ${index + 1} prompt`}
              className="focus-ring w-full rounded border-b border-line bg-transparent pb-2 text-body-l font-semibold text-content-primary placeholder:font-normal placeholder:text-content-placeholder focus:border-brand"
            />

            <div className="flex flex-wrap items-center gap-4">
              <QuestionTypeSelect value={question.type} onChange={changeType} />
              <label className="flex cursor-pointer items-center gap-2.5">
                <Switch
                  checked={question.is_required}
                  onCheckedChange={(checked) => onChange({ is_required: checked })}
                />
                <span className="text-body-m text-content-secondary">Required</span>
              </label>

              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete question ${index + 1}`}
                className="focus-ring ml-auto rounded-lg p-2 text-content-placeholder transition-colors hover:bg-feedback-error-subtle hover:text-feedback-error"
              >
                <Trash2 className="size-[18px]" />
              </button>
            </div>

            {needsOptions(question.type) ? (
              <OptionEditor
                type={question.type}
                options={question.options.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
                onChange={(options) => onChange({ options })}
              />
            ) : (
              <QuestionPreview question={question} />
            )}
          </>
        ) : (
          <>
            <h3 className="text-body-l font-semibold leading-5 text-content-primary">
              {question.prompt || "Untitled question"}
              {question.is_required ? <span className="ml-1 text-feedback-error">*</span> : null}
            </h3>
            <QuestionPreview question={question} />
          </>
        )}
      </div>
    </article>
  );
}
