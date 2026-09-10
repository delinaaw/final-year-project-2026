import { Check } from "lucide-react";

import type { PublicQuestion } from "@/features/respondent/api";
import { cn } from "@/lib/utils";

export function SpokenOptions({
  question,
  selectedIds,
  rating,
}: {
  question: PublicQuestion;
  selectedIds: string[];
  rating: number | null;
}) {
  if (question.type === "rating") {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-body-s text-content-secondary">
          Say a number from 1 to 5, where 1 is poor and 5 is excellent.
        </p>
        <ul className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <li
              key={score}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border text-body-m font-semibold transition-colors",
                rating === score
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface-card text-content-secondary",
              )}
            >
              {score}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (question.options.length === 0) return null;

  const multiple = question.type === "checkboxes";

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-body-s text-content-secondary">
        {multiple
          ? "Say the numbers of every option that applies, or the answers themselves."
          : "Say the number, or the answer itself."}
      </p>
      <ol className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          const chosen = selectedIds.includes(option.id);
          return (
            <li
              key={option.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                chosen ? "border-brand bg-brand-muted" : "border-line bg-surface-card",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-body-s font-semibold",
                  chosen ? "bg-brand text-white" : "bg-surface-subtle text-content-secondary",
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-body-m text-content-primary">
                {option.label}
              </span>
              {chosen ? <Check className="size-4 shrink-0 text-brand" /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
