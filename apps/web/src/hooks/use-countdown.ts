"use client";

import { useCallback, useEffect, useState } from "react";

export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);

  const label = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;

  return { remaining, label, isComplete: remaining <= 0, restart };
}
