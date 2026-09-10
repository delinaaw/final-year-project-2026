import Image from "next/image";

import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-page">
      <Image
        src="/brand/glow-a.svg"
        alt=""
        width={512}
        height={512}
        aria-hidden
        priority
        className="pointer-events-none absolute -left-40 top-[689px] size-[512px] max-w-none select-none"
      />
      <Image
        src="/brand/glow-b.svg"
        alt=""
        width={512}
        height={512}
        aria-hidden
        priority
        className="pointer-events-none absolute -top-[260px] left-[1240px] size-[512px] max-w-none select-none"
      />

      <main className="relative flex min-h-screen items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="flex w-full max-w-[1312px] gap-8 rounded-[24px] bg-surface-card p-4 shadow-card sm:p-6 lg:h-[896px] lg:rounded-[32px] lg:p-8">
          <AuthShowcase />

          <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-0 py-6 sm:px-6 lg:px-12 lg:py-0">
            <div className="flex w-full max-w-[510px] flex-col gap-8">
              <Logo className="lg:hidden" />
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
