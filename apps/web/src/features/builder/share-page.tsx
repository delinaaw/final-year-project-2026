"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Copy, Rocket } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PublishDialog } from "@/components/builder/publish-dialog";
import { QrCode } from "@/components/builder/qr-code";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "@/features/builder/use-builder";
import { useUpdateSettings } from "@/features/builder/use-share";
import { env } from "@/lib/env";

const ACCESS_ROWS = [
  {
    key: "require_sign_in",
    title: "Require respondents to sign in",
    body: "Collects an email with every response",
  },
  {
    key: "one_response_per_person",
    title: "Limit to one response per person",
    body: "Uses a device cookie, not an account",
  },
  {
    key: "autoplay_audio",
    title: "Read questions aloud automatically",
    body: "Starts audio without the respondent pressing play",
  },
] as const;

export function SharePage() {
  const formId = useParams<{ formId: string }>().formId;
  const { data: form, isPending } = useForm(formId);
  const updateSettings = useUpdateSettings(formId);
  const [publishing, setPublishing] = useState(false);

  if (isPending || !form) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const url = `${env.NEXT_PUBLIC_APP_URL}/f/${form.slug}`;
  const embed = `<iframe src="${url}" width="100%" height="640" frameborder="0" title="${form.title}"></iframe>`;
  const settings = form.settings as unknown as Record<string, boolean>;

  const copy = (value: string, label: string) => {
    void navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-6 sm:px-8 lg:py-10">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[22px] font-bold leading-7 text-content-primary sm:text-[24px]">
          Share this form
        </h1>
        <p className="text-body-m leading-5 text-content-secondary">
          Anyone with the link can open it. No account needed to answer.
        </p>
      </div>

      {form.status === "draft" ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-brand bg-brand-muted p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="size-5 shrink-0 text-brand" />
            <p className="text-body-m text-content-primary">
              This form is still a draft. Publish it before sharing the link.
            </p>
          </div>
          <Button onClick={() => setPublishing(true)} className="shrink-0">
            Publish
          </Button>
        </div>
      ) : null}

      <Tabs.Root defaultValue="link" className="flex flex-col gap-6">
        <Tabs.List className="flex gap-1 rounded-xl bg-surface-subtle p-1">
          {[
            { value: "link", label: "Link" },
            { value: "qr", label: "QR code" },
            { value: "embed", label: "Embed" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="focus-ring flex h-10 flex-1 items-center justify-center rounded-[9px] text-body-s font-semibold text-content-secondary transition-colors data-[state=active]:bg-surface-card data-[state=active]:text-content-primary"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="link" className="flex flex-col gap-2.5 sm:flex-row">
          <span className="flex h-[52px] min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-line bg-surface-page px-4 text-body-m text-content-primary">
            <span className="truncate">{url}</span>
          </span>
          <Button onClick={() => copy(url, "Link")} className="h-[52px] gap-2 sm:w-[120px]">
            <Copy className="size-[17px]" />
            Copy
          </Button>
        </Tabs.Content>

        <Tabs.Content value="qr">
          <QrCode value={url} />
        </Tabs.Content>

        <Tabs.Content value="embed" className="flex flex-col gap-3">
          <pre className="overflow-x-auto rounded-xl border border-line bg-surface-page p-4 text-body-s text-content-primary">
            <code>{embed}</code>
          </pre>
          <Button
            variant="secondary"
            onClick={() => copy(embed, "Embed code")}
            className="w-fit gap-2"
          >
            <Copy className="size-[17px]" />
            Copy embed code
          </Button>
        </Tabs.Content>
      </Tabs.Root>

      <div className="flex flex-col rounded-xl bg-surface-subtle px-4">
        {ACCESS_ROWS.map((row, index) => (
          <div
            key={row.key}
            className={`flex items-center gap-3 py-3.5 ${
              index > 0 ? "border-t border-line/60" : ""
            }`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body-s font-semibold text-content-primary">{row.title}</span>
              <span className="text-[12px] leading-4 text-content-secondary">{row.body}</span>
            </div>
            <Switch
              checked={Boolean(settings[row.key])}
              onCheckedChange={(checked) => updateSettings.mutate({ [row.key]: checked })}
              aria-label={row.title}
            />
          </div>
        ))}
      </div>

      <PublishDialog formId={formId} open={publishing} onOpenChange={setPublishing} />
    </div>
  );
}
