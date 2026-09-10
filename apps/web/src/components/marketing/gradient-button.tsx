import Link from "next/link";

import { cn } from "@/lib/utils";

interface GradientButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function GradientButton({ href, children, className }: GradientButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-xl bg-brand-gradient px-6 py-3.5 text-body-m font-semibold text-white transition-opacity hover:opacity-90 sm:px-8 sm:py-4 sm:text-body-l",
        className,
      )}
    >
      {children}
    </Link>
  );
}
