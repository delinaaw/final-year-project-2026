"use client";

import { Eye, MessageSquare, Palette, Send } from "lucide-react";
import Link from "next/link";

import { SaveIndicator } from "@/components/builder/save-indicator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { usePublishForm } from "@/features/builder/use-builder";

interface BuilderTopBarProps {
  formId: string;
  title: string;
  canPublish: boolean;
}

export function BuilderTopBar({ formId, title, canPublish }: BuilderTopBarProps) {
  const publish = usePublishForm(formId);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface-card px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-3.5">
        <Link href="/forms" className="focus-ring hidden shrink-0 rounded sm:block">
          <Logo tone="marine" className="[&>span:last-child]:hidden" />
        </Link>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-body-m font-semibold leading-5 text-content-primary">
            {title}
          </span>
          <span className="text-[12px] leading-4 text-content-secondary">
            Creator&apos;s workspace
          </span>
        </div>
        <SaveIndicator />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link
          href={`/forms/${formId}/design`}
          aria-label="Design"
          className="focus-ring hidden rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-subtle sm:block"
        >
          <Palette className="size-[21px]" />
        </Link>
        <Link
          href={`/forms/${formId}/preview`}
          aria-label="Preview"
          className="focus-ring rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-subtle"
        >
          <Eye className="size-[21px]" />
        </Link>
        <Link
          href={`/forms/${formId}/responses`}
          aria-label="Responses"
          className="focus-ring hidden rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-subtle sm:block"
        >
          <MessageSquare className="size-[21px]" />
        </Link>

        <Button
          onClick={() => publish.mutate()}
          disabled={publish.isPending || !canPublish}
          className="h-[46px] gap-2 bg-marine hover:bg-marine/90 sm:w-[140px]"
        >
          <Send className="size-[17px]" />
          {publish.isPending ? "Publishing…" : "Publish"}
        </Button>
      </div>
    </header>
  );
}
