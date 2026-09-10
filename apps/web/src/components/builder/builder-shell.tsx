"use client";

import { BuilderRail } from "@/components/builder/builder-rail";
import { BuilderTopBar } from "@/components/builder/builder-top-bar";
import { useForm } from "@/features/builder/use-builder";

export function BuilderShell({
  formId,
  children,
}: {
  formId: string;
  children: React.ReactNode;
}) {
  const { data: form } = useForm(formId);

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <BuilderTopBar
        formId={formId}
        title={form?.title ?? "Untitled form"}
        canPublish={(form?.questions.length ?? 0) > 0}
      />
      <div className="flex flex-1 flex-col lg:flex-row">
        <BuilderRail formId={formId} />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
