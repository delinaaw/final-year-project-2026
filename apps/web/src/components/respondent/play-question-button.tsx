"use client";

import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { respondentApi } from "@/features/respondent/api";

export function PlayQuestionButton({
  slug,
  questionId,
  autoPlay,
}: {
  slug: string;
  questionId: string;
  autoPlay: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setState("idle");
  }, [questionId]);

  const play = async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const { audio_url } = await respondentApi.questionAudio(slug, questionId);
      const audio = new Audio(audio_url);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    if (autoPlay) void play();
  }, [questionId, autoPlay]);

  const Icon = state === "loading" ? Loader2 : state === "error" ? VolumeX : Volume2;

  return (
    <button
      type="button"
      onClick={play}
      disabled={state === "loading"}
      aria-label={state === "playing" ? "Stop reading the question" : "Read the question aloud"}
      className="focus-ring shrink-0 rounded-lg p-2 text-marine transition-colors hover:bg-surface-subtle disabled:opacity-60"
    >
      <Icon className={state === "loading" ? "size-6 animate-spin" : "size-6"} />
    </button>
  );
}
