"use client";

import { MessageSquare, Mic, Monitor } from "lucide-react";
import { useParams } from "next/navigation";

import { PanelSection, SettingRow } from "@/components/builder/panel-section";
import { VoiceSelect } from "@/components/builder/voice-select";
import { NumberStepper } from "@/components/ui/number-stepper";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { useForm } from "@/features/builder/use-builder";
import type { FormSettings, VoiceSpeed } from "@/features/builder/settings-api";
import { useUpdateSettings } from "@/features/builder/use-share";

const SPEEDS: { value: VoiceSpeed; label: string }[] = [
  { value: "slow", label: "Slow" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
];

export function SettingsPage() {
  const formId = useParams<{ formId: string }>().formId;
  const { data: form, isPending } = useForm(formId);
  const update = useUpdateSettings(formId);

  if (isPending || !form) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  const settings = form.settings;
  const set = (patch: Partial<FormSettings>) => update.mutate(patch);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-10 px-4 py-6 sm:px-8 lg:py-10">
      <h1 className="text-[24px] font-bold leading-7 text-content-primary">Settings</h1>

      <PanelSection icon={Mic} title="Audio & Voice">
        <SettingRow label="Read Questions Aloud">
          <Switch
            checked={settings.read_questions_aloud}
            onCheckedChange={(checked) => set({ read_questions_aloud: checked })}
            aria-label="Read questions aloud"
          />
        </SettingRow>

        <SettingRow label="Voice type" stacked>
          <VoiceSelect
            value={settings.voice_id}
            onChange={(voice_id) => set({ voice_id })}
          />
        </SettingRow>

        <SettingRow label="Voice Speed" stacked>
          <SegmentedControl
            label="Voice speed"
            value={settings.voice_speed}
            options={SPEEDS}
            onChange={(voice_speed) => set({ voice_speed })}
          />
        </SettingRow>
      </PanelSection>

      <span className="h-0.5 w-full bg-surface-subtle" />

      <PanelSection icon={MessageSquare} title="Response">
        <SettingRow label="Collect respondent email">
          <Switch
            checked={settings.collect_respondent_email}
            onCheckedChange={(checked) => set({ collect_respondent_email: checked })}
            aria-label="Collect respondent email"
          />
        </SettingRow>

        <SettingRow label="Allow Review & Editing">
          <Switch
            checked={settings.allow_review_and_edit}
            onCheckedChange={(checked) => set({ allow_review_and_edit: checked })}
            aria-label="Allow review and editing"
          />
        </SettingRow>

        <SettingRow label="Notify me about new responses">
          <Switch
            checked={settings.notify_on_response}
            onCheckedChange={(checked) => set({ notify_on_response: checked })}
            aria-label="Notify me about new responses"
          />
        </SettingRow>

        <SettingRow label="Access Limit" stacked>
          <NumberStepper
            label="Access limit"
            value={settings.response_limit}
            onChange={(response_limit) => set({ response_limit })}
          />
        </SettingRow>
      </PanelSection>

      <span className="h-0.5 w-full bg-surface-subtle" />

      <PanelSection icon={Monitor} title="Presentation">
        <SettingRow label="Display Progress Bar">
          <Switch
            checked={settings.show_progress_bar}
            onCheckedChange={(checked) => set({ show_progress_bar: checked })}
            aria-label="Display progress bar"
          />
        </SettingRow>

        <SettingRow label="Shuffle Questions">
          <Switch
            checked={settings.shuffle_questions}
            onCheckedChange={(checked) => set({ shuffle_questions: checked })}
            aria-label="Shuffle questions"
          />
        </SettingRow>

        <SettingRow label="All Questions required">
          <Switch
            checked={settings.all_questions_required}
            onCheckedChange={(checked) => set({ all_questions_required: checked })}
            aria-label="All questions required"
          />
        </SettingRow>
      </PanelSection>
    </div>
  );
}
