import Image from "next/image";

import { SectionHeading } from "@/components/marketing/section-heading";

const FEATURES = [
  {
    icon: "/landing/f-voice.svg",
    title: "Voice-first experience",
    body: "Questions are read out loud and answers are spoken naturally, making forms faster and easier to complete for everyone.",
  },
  {
    icon: "/landing/f-create.svg",
    title: "Simple for creators",
    body: "Build forms using familiar text inputs while VoiceForm handles the voice interaction automatically.",
  },
  {
    icon: "/landing/f-access.svg",
    title: "Accessible by design",
    body: "Build forms using familiar text inputs while VoiceForm handles the voice interaction automatically.",
  },
  {
    icon: "/landing/f-accurate.svg",
    title: "Accurate responses",
    body: "Spoken answers are converted into text and shown instantly, giving respondents the chance to review and edit before submitting.",
  },
  {
    icon: "/landing/f-anywhere.svg",
    title: "Works anywhere",
    body: "Optimized for mobile and desktop, making it easy to complete forms on the go or hands-free.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 lg:gap-14">
        <SectionHeading>Built for voice-first forms</SectionHeading>

        <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex w-full max-w-[292px] flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
            >
              <span className="flex items-center justify-center rounded-2xl bg-surface-page p-2.5">
                <Image src={feature.icon} alt="" width={32} height={32} className="size-8" />
              </span>
              <div className="flex flex-col gap-4 text-center text-content-primary">
                <h3 className="text-body-l font-semibold leading-5">{feature.title}</h3>
                <p className="text-body-s leading-5 opacity-70">{feature.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
