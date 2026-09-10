"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api-client";

export function useAuthError() {
  const [message, setMessage] = useState<string | null>(null);

  const capture = (error: unknown) => {
    if (error instanceof ApiError) {
      setMessage(error.message);
      return;
    }
    setMessage("Something went wrong. Try again.");
  };

  return { message, capture, clear: () => setMessage(null) };
}
