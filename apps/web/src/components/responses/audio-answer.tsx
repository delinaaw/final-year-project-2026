"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Waveform } from "@/components/respondent/waveform";
import type { Recording } from "@/features/responses/api";
import { formatDuration } from "@/lib/utils";

export function AudioAnswer({ recording }: { recording: Recording }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    if (!recording.audio_url) return;

    if (!audioRef.current) {
      const audio = new Audio(recording.audio_url);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audioRef.current = audio;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    void audioRef.current.play().then(() => setPlaying(true));
  };

  const Icon = playing ? Pause : Play;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-brand-muted px-3 py-2.5">
      <button
        type="button"
        onClick={toggle}
        disabled={!recording.audio_url}
        aria-label={playing ? "Pause the recording" : "Play the recording"}
        className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
      >
        <Icon className="size-4" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <Waveform peaks={recording.waveform_peaks} active={playing} className="h-8 justify-start" />
      </div>

      {recording.duration_seconds ? (
        <span className="shrink-0 text-[12px] tabular-nums text-content-secondary">
          {formatDuration(recording.duration_seconds)}
        </span>
      ) : null}
    </div>
  );
}
