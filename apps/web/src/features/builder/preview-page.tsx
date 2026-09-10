"use client";

import { useParams } from "next/navigation";

import { PreviewBanner } from "@/components/respondent/preview-banner";
import { useForm } from "@/features/builder/use-builder";
import { RespondentFlow } from "@/features/respondent/respondent-flow";

export function PreviewPage() {
  const formId = useParams<{ formId: string }>().formId;
  const { data: form, isPending } = useForm(formId);

  if (isPending || !form) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  if (form.questions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <h1 className="text-[22px] font-bold text-content-primary">Nothing to preview yet</h1>
        <p className="text-body-m text-content-secondary">
          Add a question in the builder and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PreviewBanner />
      <RespondentFlow previewSlug={form.slug} />
    </div>
  );
}
