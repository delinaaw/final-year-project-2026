"use client";

import { useCallback, useRef, useState } from "react";

import { env } from "@/lib/env";

interface TranscriptEvent {
  type: "interim" | "final" | "error";
  text?: string;
  message?: string;
}

export function useLiveTranscription(
  slug: string,
  responseId: string | null,
  enabled: boolean,
) {
  const socketRef = useRef<WebSocket | null>(null);
  const finalsRef = useRef<string[]>([]);
  const [live, setLive] = useState("");

  const close = useCallback(() => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("close");
      socket.close();
    }
    socketRef.current = null;
  }, []);

  const open = useCallback(() => {
    if (!enabled || !responseId) return;

    finalsRef.current = [];
    setLive("");

    const socket = new WebSocket(
      `${env.NEXT_PUBLIC_WS_URL}/v1/public/forms/${slug}/transcribe/stream` +
        `?response_id=${encodeURIComponent(responseId)}`,
    );
    socket.binaryType = "arraybuffer";

    socket.onmessage = (message) => {
      const event = JSON.parse(message.data as string) as TranscriptEvent;
      if (event.type === "error") return;

      if (event.type === "final" && event.text) {
        finalsRef.current = [...finalsRef.current, event.text];
        setLive(finalsRef.current.join(" "));
        return;
      }

      if (event.type === "interim" && event.text) {
        setLive([...finalsRef.current, event.text].join(" "));
      }
    };

    socket.onerror = () => {
      socketRef.current = null;
    };

    socketRef.current = socket;
  }, [enabled, responseId, slug]);

  const push = useCallback((chunk: Blob) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    void chunk.arrayBuffer().then((buffer) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(buffer);
    });
  }, []);

  const finalise = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send("finalize");
  }, []);

  const reset = useCallback(() => {
    finalsRef.current = [];
    setLive("");
  }, []);

  return { live, open, push, finalise, close, reset };
}
