import Image from "next/image";

import { GradientButton } from "@/components/marketing/gradient-button";

const HIGHLIGHTS = [
  {
    icon: "/landing/mic-small.svg",
    title: "Speak Your Answers",
    body: "Answer questions naturally using your voice",
    ring: "from-brand/50 to-brand",
  },
  {
    icon: "/landing/accessibility.svg",
    title: "Built for accessibility",
    body: "Designed to work for everyone, including hands-free use.",
    ring: "from-marine-teal/50 to-marine-teal",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
      <Image
        src="/landing/wave-bg.png"
        alt=""
        width={1440}
        height={1047}
        priority
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-[1440px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-[0.08]"
      />
      <Image
        src="/landing/hero-ellipse.svg"
        alt=""
        width={512}
        height={512}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[512px] max-w-none -translate-y-1/2 translate-x-[60px] opacity-70 lg:translate-x-[277px]"
      />

      <div className="relative mx-auto flex w-full max-w-[1312px] flex-col items-center gap-12 lg:gap-14">
        <div className="flex w-full max-w-[768px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <h1 className="text-[34px] font-bold leading-[42px] text-content-primary sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px]">
              Create forms.
              <br />
              <span className="bg-headline-gradient bg-clip-text text-transparent">
                Fill them with your voice.
              </span>
            </h1>
            <p className="max-w-[640px] text-body-m font-medium leading-6 text-content-primary/80 sm:text-body-l">
              VoiceForm lets people fill online forms by listening and speaking instead of typing
              — making forms faster, more accessible, and more human.
            </p>
          </div>

          <GradientButton href="/signup">Start Creating Now</GradientButton>
        </div>

        <div className="relative size-[200px] sm:size-[240px] lg:size-[266px]">
          <Image
            src="/landing/orb-glow.png"
            alt=""
            width={453}
            height={453}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[113%] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <Image
              src="/landing/orb-gradient.svg"
              alt=""
              width={426}
              height={266}
              aria-hidden
              className="absolute left-1/2 top-0 h-full w-[160%] max-w-none -translate-x-1/2"
            />
          </div>
          <Image
            src="/landing/orb-ring.svg"
            alt=""
            width={300}
            height={300}
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full"
          />
          <Image
            src="/landing/mic-large.svg"
            alt="Voice input"
            width={72}
            height={72}
            className="absolute left-1/2 top-1/2 size-[54px] -translate-x-1/2 -translate-y-1/2 lg:size-[72px]"
          />
        </div>

        <div className="grid w-full grid-cols-2 justify-center gap-4 sm:flex sm:gap-16 lg:gap-32">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex items-center gap-3 sm:max-w-[340px] sm:gap-4">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-white bg-gradient-to-b p-2 sm:size-12 sm:p-2.5 ${item.ring}`}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="size-5 sm:size-6"
                />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5 text-content-primary sm:gap-2">
                <span className="text-[13px] font-semibold leading-4 sm:text-body-l sm:leading-5">
                  {item.title}
                </span>
                <span className="text-[11px] leading-4 opacity-80 sm:text-body-s sm:leading-5">
                  {item.body}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
