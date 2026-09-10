import { cn } from "@/lib/utils";

const IDLE_HEIGHTS = [8, 14, 20, 14, 8, 12, 18, 12, 8, 14, 20, 14, 8];

export function Waveform({
  peaks,
  active,
  className,
}: {
  peaks?: number[];
  active?: boolean;
  className?: string;
}) {
  const bars =
    peaks && peaks.length > 0
      ? peaks.map((peak) => Math.max(4, Math.round(peak * 40)))
      : IDLE_HEIGHTS;

  return (
    <div className={cn("flex h-12 items-center justify-center gap-1", className)} aria-hidden>
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-1.5 shrink-0 rounded-full bg-brand transition-[height] duration-100",
            active ? "opacity-100" : "opacity-40",
          )}
          style={{ height }}
        />
      ))}
    </div>
  );
}
