"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Image as ImageIcon, Palette, Trash2, Type, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";

import { PanelSection, SettingRow } from "@/components/builder/panel-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@/features/builder/use-builder";
import { themeApi, type FormTheme } from "@/features/builder/settings-api";
import { useHeaderImage, useUpdateTheme } from "@/features/builder/use-share";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const SWATCHES = [
  "#0066cc",
  "#12b981",
  "#f59e0b",
  "#ef4444",
  "#807dfe",
  "#6b7280",
  "#1f2937",
  "#e11d48",
  "#10b981",
];

const FONTS = ["Manrope", "Inter", "Georgia", "system-ui"];

const TYPE_LEVELS = [
  { key: "header", label: "Header", font: "header_font", size: "header_size" },
  { key: "question", label: "Question", font: "question_font", size: "question_size" },
  { key: "text", label: "Text", font: "body_font", size: "body_size" },
] as const;

export function DesignPage() {
  const formId = useParams<{ formId: string }>().formId;
  const { data: form, isPending } = useForm(formId);
  const update = useUpdateTheme(formId);
  const header = useHeaderImage(formId);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: headerImage } = useQuery({
    queryKey: [...queryKeys.forms.detail(formId), "header"],
    queryFn: () => themeApi.headerUrl(formId),
  });

  if (isPending || !form) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const theme = form.theme;
  const set = (patch: Partial<FormTheme>) => update.mutate(patch);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 py-6 sm:px-8 lg:py-10">
      <h1 className="text-[24px] font-bold leading-7 text-content-primary">Customize</h1>

      <PanelSection icon={Palette} title="Theme">
        <div className="flex items-center gap-4">
          <span
            className="size-11 shrink-0 rounded-lg border border-line"
            style={{ backgroundColor: theme.primary_color }}
            aria-hidden
          />
          <Input
            value={theme.primary_color}
            onChange={(event) => {
              const next = event.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(next)) {
                if (next.length === 7) set({ primary_color: next });
              }
            }}
            aria-label="Theme colour"
            className="font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => set({ primary_color: swatch })}
              aria-label={`Use ${swatch}`}
              aria-pressed={theme.primary_color.toLowerCase() === swatch}
              className={cn(
                "focus-ring flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110",
                theme.primary_color.toLowerCase() === swatch && "ring-2 ring-brand ring-offset-2",
              )}
              style={{ backgroundColor: swatch }}
            >
              {theme.primary_color.toLowerCase() === swatch ? (
                <Check className="size-4 text-white" strokeWidth={3} />
              ) : null}
            </button>
          ))}
        </div>
      </PanelSection>

      <span className="h-0.5 w-full bg-surface-subtle" />

      <PanelSection icon={Type} title="Typography">
        {TYPE_LEVELS.map((level) => (
          <SettingRow key={level.key} label={level.label} stacked>
            <div className="flex gap-3">
              <select
                value={theme[level.font]}
                onChange={(event) => set({ [level.font]: event.target.value })}
                aria-label={`${level.label} font`}
                className="focus-ring h-12 min-w-0 flex-1 rounded-xl border border-line bg-surface-card px-4 text-body-m text-content-primary"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={10}
                max={96}
                value={theme[level.size]}
                onChange={(event) => set({ [level.size]: Number(event.target.value) })}
                aria-label={`${level.label} size`}
                className="focus-ring h-12 w-[84px] shrink-0 rounded-xl border border-line bg-surface-card px-3 text-center text-body-m text-content-primary"
              />
            </div>
          </SettingRow>
        ))}
      </PanelSection>

      <span className="h-0.5 w-full bg-surface-subtle" />

      <PanelSection icon={ImageIcon} title="Header">
        {headerImage?.url ? (
          <div className="flex flex-col gap-3">
            <img
              src={headerImage.url}
              alt="Form header"
              className="h-32 w-full rounded-xl border border-line object-cover"
            />
            <Button
              variant="secondary"
              onClick={() => header.remove.mutate()}
              disabled={header.remove.isPending}
              className="w-fit gap-2 text-feedback-error"
            >
              <Trash2 className="size-4" />
              Remove image
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={header.upload.isPending}
            className="w-fit gap-2 text-content-link"
          >
            <Upload className="size-4" />
            {header.upload.isPending ? "Uploading…" : "Upload Image"}
          </Button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) header.upload.mutate(file);
            event.target.value = "";
          }}
        />
        <p className="text-body-s text-content-secondary">PNG, JPG or WebP · up to 10 MB</p>
      </PanelSection>
    </div>
  );
}
