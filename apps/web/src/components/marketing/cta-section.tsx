import Image from "next/image";

import { GradientButton } from "@/components/marketing/gradient-button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
      <Image
        src="/landing/cta-waves.png"
        alt=""
        width={1440}
        height={365}
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 w-full max-w-none -translate-y-1/2 opacity-[0.16]"
      />
      <Image
        src="/landing/ellipse-4.svg"
        alt=""
        width={512}
        height={512}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[512px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-70"
      />

      <div className="relative mx-auto flex w-full max-w-[760px] flex-col items-center gap-8 text-center lg:gap-12">
        <div className="flex flex-col gap-6 lg:gap-8">
          <h2 className="text-balance text-[30px] font-bold leading-[38px] text-content-primary sm:text-[38px] sm:leading-[46px] lg:text-[48px] lg:leading-[56px]">
            Let&rsquo;s build better forms
          </h2>
          <p className="text-body-m leading-6 text-content-primary/80">
            Move beyond typing. With VoiceForm, respondents listen, speak, and review their
            answers before submitting — creating a smoother and more inclusive form experience.
          </p>
        </div>
        <GradientButton href="/signup">Get Started Now</GradientButton>
      </div>
    </section>
  );
}
