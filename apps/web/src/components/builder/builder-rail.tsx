"use client";

import { BarChart3, CircleHelp, Mic, Palette, Settings, Share2, SquareStack } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const SECTIONS = [
  { segment: "build", label: "Questions", icon: SquareStack },
  { segment: "responses", label: "Responses", icon: BarChart3 },
  { segment: "design", label: "Design", icon: Palette },
  { segment: "settings", label: "Settings", icon: Settings },
  { segment: "share", label: "Share", icon: Share2 },
] as const;

export function BuilderRail({ formId }: { formId: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Form sections"
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-surface-card px-3 py-2 lg:w-[104px] lg:flex-col lg:justify-between lg:overflow-visible lg:border-b-0 lg:border-r lg:px-0 lg:py-5"
    >
      <div className="flex items-center gap-1.5 lg:flex-col">
        <Link
          href="/forms"
          aria-label="Back to My Forms"
          className="focus-ring hidden size-14 items-center justify-center rounded-2xl bg-brand text-content-inverse lg:flex"
        >
          <Mic className="size-6" />
        </Link>
        <span className="hidden h-5 lg:block" aria-hidden />

        {SECTIONS.map((section) => {
          const href = `/forms/${formId}/${section.segment}`;
          const active = pathname === href;
          const Icon = section.icon;
          return (
            <Link
              key={section.segment}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex h-16 w-[72px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[14px] transition-colors",
                active
                  ? "bg-brand-muted text-brand"
                  : "text-content-secondary hover:bg-surface-subtle",
              )}
            >
              <Icon className="size-[22px]" />
              <span className="text-[12px] leading-4">{section.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/help"
        className="focus-ring flex h-16 w-[72px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[14px] text-content-secondary transition-colors hover:bg-surface-subtle"
      >
        <CircleHelp className="size-[22px]" />
        <span className="text-[12px] leading-4">Help</span>
      </Link>
    </nav>
  );
}
