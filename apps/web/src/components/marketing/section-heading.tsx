import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-balance text-center text-[30px] font-bold leading-[38px] text-content-primary sm:text-[38px] sm:leading-[46px] lg:text-[48px] lg:leading-[56px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}
