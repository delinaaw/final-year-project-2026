import Link from "next/link";

import { GradientButton } from "@/components/marketing/gradient-button";
import { Wordmark } from "@/components/marketing/wordmark";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-16">
        <Link href="/" className="focus-ring rounded">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/login"
            className="focus-ring hidden rounded-xl border-2 border-marine px-8 py-4 text-body-l font-semibold text-marine transition-colors hover:bg-marine/5 sm:inline-flex"
          >
            Log In
          </Link>
          <GradientButton href="/signup">Get Started</GradientButton>
        </nav>
      </div>
    </header>
  );
}
