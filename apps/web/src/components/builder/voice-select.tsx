"use client";

import * as Select from "@radix-ui/react-select";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Volume2 } from "lucide-react";
import { useRef } from "react";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface Voice {
  id: string;
  name: string;
  preview_url: string | null;
}

export function VoiceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: voices } = useQuery({
    queryKey: queryKeys.voices,
    queryFn: () => api.get<Voice[]>("/speech/voices"),
    staleTime: Infinity,
  });

  const selected = voices?.find((voice) => voice.id === value);

  const preview = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selected?.preview_url) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(selected.preview_url);
    void audioRef.current.play();
  };

  return (
    <div className="flex items-center gap-2">
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          aria-label="Voice type"
          className="focus-ring flex h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-2xl border border-line bg-surface-card px-4 text-body-m text-content-primary"
        >
          <span className="truncate">
            <Select.Value placeholder={selected?.name ?? "Default voice"} />
          </span>
          <Select.Icon>
            <ChevronDown className="size-5 shrink-0 text-content-secondary" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-[300px] overflow-hidden rounded-xl border border-line bg-surface-card py-1.5 shadow-[0_8px_12px_0_rgb(1_3_62_/_0.08)]"
          >
            <Select.Viewport>
              <Select.Item
                value="default"
                className="flex cursor-pointer items-center justify-between gap-6 px-3.5 py-2.5 text-body-m outline-none data-[highlighted]:bg-surface-subtle"
              >
                <Select.ItemText>Default voice</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="size-4 text-brand" />
                </Select.ItemIndicator>
              </Select.Item>
              {voices?.map((voice) => (
                <Select.Item
                  key={voice.id}
                  value={voice.id}
                  className="flex cursor-pointer items-center justify-between gap-6 px-3.5 py-2.5 text-body-m outline-none data-[highlighted]:bg-surface-subtle"
                >
                  <Select.ItemText>{voice.name}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-4 text-brand" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <button
        type="button"
        onClick={preview}
        disabled={!selected?.preview_url}
        aria-label="Preview this voice"
        className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-card text-content-secondary transition-colors hover:text-brand disabled:opacity-40"
      >
        <Volume2 className="size-5" />
      </button>
    </div>
  );
}
