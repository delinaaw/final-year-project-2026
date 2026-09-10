import Image from "next/image";

import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-page">
      <Image
        src="/brand/glow-b.svg"
        alt=""
        width={512}
        height={512}
        priority
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-52 size-[380px] max-w-none select-none opacity-60 lg:size-[512px] lg:opacity-100"
      />
      <Image
        src="/brand/glow-a.svg"
        alt=""
        width={512}
        height={512}
        priority
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 size-[380px] max-w-none select-none opacity-60 lg:size-[512px] lg:opacity-100"
      />

      <main className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:p-8 lg:p-10 xl:p-12">
        <div className="flex w-full max-w-[1312px] justify-center gap-8 sm:rounded-3xl sm:bg-surface-card sm:p-6 sm:shadow-card lg:h-[calc(100vh-5rem)] lg:max-h-[896px] lg:min-h-[620px] lg:rounded-[32px] lg:p-8">
          <AuthShowcase />

          <div className="flex w-full min-w-0 flex-1 overflow-y-auto">
            <div className="m-auto flex w-full max-w-[510px] flex-col gap-8 py-2">
              <Logo className="lg:hidden" />
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
