"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "stopped" | "blocked";

export interface Recording {
  blob: Blob;
  durationSeconds: number;
  peaks: number[];
}

const PEAK_COUNT = 48;

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const peaksRef = useRef<number[]>([]);
  const elapsedRef = useRef(0);
  const frameRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const releaseDevices = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
  }, []);

  useEffect(() => releaseDevices, [releaseDevices]);

  const start = useCallback(async () => {
    setState("requesting");
    chunksRef.current = [];
    peaksRef.current = [];
    elapsedRef.current = 0;
    setPeaks([]);
    setElapsed(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("blocked");
      return false;
    }

    streamRef.current = stream;

    const context = new AudioContext();
    contextRef.current = context;
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    context.createMediaStreamSource(stream).connect(analyser);

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const sample = () => {
      analyser.getByteTimeDomainData(buffer);
      const amplitude = Math.max(...Array.from(buffer, (v) => Math.abs(v - 128) / 128));
      peaksRef.current = [...peaksRef.current, amplitude].slice(-PEAK_COUNT);
      setPeaks(peaksRef.current);
      frameRef.current = requestAnimationFrame(sample);
    };
    sample();

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorderRef.current = recorder;
    recorder.start(250);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);

    setState("recording");
    return true;
  }, []);

  const stop = useCallback(async (): Promise<Recording | null> => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        recorder.addEventListener("stop", done, { once: true });
        recorder.stop();
        setTimeout(done, 2000);
      });
    }

    const mimeType = recorder?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    releaseDevices();
    recorderRef.current = null;
    setState("stopped");

    if (blob.size === 0) return null;
    return { blob, durationSeconds: elapsedRef.current, peaks: peaksRef.current };
  }, [releaseDevices]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    releaseDevices();
    recorderRef.current = null;
    chunksRef.current = [];
    peaksRef.current = [];
    elapsedRef.current = 0;
    setPeaks([]);
    setElapsed(0);
    setState("idle");
  }, [releaseDevices]);

  return { state, elapsed, peaks, start, stop, cancel };
}
