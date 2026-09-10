import Image from "next/image";

import { GradientButton } from "@/components/marketing/gradient-button";

export function EveryoneSection() {
  return (
    <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
      <Image
        src="/landing/ellipse-2.svg"
        alt=""
        width={512}
        height={512}
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 size-[512px] max-w-none opacity-70"
      />

      <div className="relative mx-auto flex w-full max-w-[1312px] flex-col items-center justify-between gap-10 lg:flex-row lg:gap-16">
        <div className="flex max-w-[620px] flex-col items-start gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8">
            <h2 className="text-balance text-[30px] font-bold leading-[38px] text-content-primary sm:text-[38px] sm:leading-[46px] lg:text-[48px] lg:leading-[56px]">
              Voice-first, built for everyone
            </h2>
            <p className="text-body-m leading-6 text-content-primary/80">
              VoiceForm makes forms easier by letting creators type questions as usual, while
              respondents simply listen and speak. Questions are read out loud, answers are spoken
              naturally, and responses are reviewed as text before submission — making form
              filling faster, more accessible, and comfortable for all users.
            </p>
          </div>
          <GradientButton href="/signup">Get Started Now</GradientButton>
        </div>

        <Image
          src="/landing/everyone-blob.png"
          alt=""
          width={548}
          height={512}
          aria-hidden
          className="w-full max-w-[420px] shrink-0 lg:max-w-[548px]"
        />
      </div>
    </section>
  );
}
