"use client";

import { useEffect, useState } from "react";

import { useDebounced } from "@/hooks/use-debounced";

interface FormHeaderCardProps {
  title: string;
  description: string | null;
  onChange: (body: { title?: string; description?: string }) => void;
}

export function FormHeaderCard({ title, description, onChange }: FormHeaderCardProps) {
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description ?? "");

  const debouncedTitle = useDebounced(draftTitle, 700);
  const debouncedDescription = useDebounced(draftDescription, 700);

  useEffect(() => setDraftTitle(title), [title]);
  useEffect(() => setDraftDescription(description ?? ""), [description]);

  useEffect(() => {
    if (debouncedTitle.trim() && debouncedTitle !== title) onChange({ title: debouncedTitle });
  }, [debouncedTitle]);

  useEffect(() => {
    if (debouncedDescription !== (description ?? "")) {
      onChange({ description: debouncedDescription });
    }
  }, [debouncedDescription]);

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-line bg-surface-card p-5 sm:p-6">
      <input
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        placeholder="Untitled form"
        aria-label="Form title"
        className="focus-ring w-full rounded border-b border-transparent bg-transparent pb-1 text-[22px] font-bold leading-7 text-content-primary placeholder:text-content-placeholder hover:border-line focus:border-brand sm:text-[24px] sm:leading-7"
      />
      <input
        value={draftDescription}
        onChange={(event) => setDraftDescription(event.target.value)}
        placeholder="Add a description so people know what this form is for"
        aria-label="Form description"
        className="focus-ring w-full rounded border-b border-transparent bg-transparent pb-1 text-body-m text-content-primary placeholder:text-content-placeholder hover:border-line focus:border-brand"
      />
    </div>
  );
}
