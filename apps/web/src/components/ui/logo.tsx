import { cn } from "@/lib/utils";

const BAR_HEIGHTS = [16, 28, 32, 22, 12];

interface LogoProps {
  className?: string;
  tone?: "brand" | "inverse" | "marine";
}

export function Logo({ className, tone = "brand" }: LogoProps) {
  const barColor =
    tone === "inverse" ? "bg-content-inverse" : tone === "marine" ? "bg-marine" : "bg-brand";
  const textColor = tone === "inverse" ? "text-content-inverse" : "text-content-primary";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex items-center gap-1" aria-hidden>
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={cn("w-[5px] rounded-full", barColor)}
            style={{ height }}
          />
        ))}
      </span>
      <span className={cn("text-[18px] font-semibold leading-5", textColor)}>Voice Form</span>
    </span>
  );
}
