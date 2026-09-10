import { cn } from "@/lib/utils";

const BARS = [
  { height: 19.2, offset: 6.4 },
  { height: 32, offset: 0 },
  { height: 25.6, offset: 3.2 },
  { height: 32, offset: 0 },
  { height: 19.2, offset: 6.4 },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 items-start gap-[3.2px]" aria-hidden>
        {BARS.map((bar, index) => (
          <span
            key={index}
            className="w-[6.4px] rounded-full bg-marine"
            style={{ height: bar.height, marginTop: bar.offset }}
          />
        ))}
      </span>
      <span className="font-wordmark text-[14px] leading-5 text-content-primary">Voice Form</span>
    </span>
  );
}
