import { SectionHeading } from "@/components/marketing/section-heading";

const STEPS = [
  "Create your form using text or voice.",
  "VoiceForm adds voice playback and speech input automatically.",
  "Respondents listen to questions and answer by speaking.",
  "Review responses and collect submissions effortlessly.",
];

export function HowItWorks() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 lg:gap-14">
        <SectionHeading>How it Works</SectionHeading>

        <ol className="grid w-full grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:flex lg:justify-between lg:gap-0">
          {STEPS.map((step, index) => (
            <li key={step} className="contents">
              <div className="flex w-full flex-col items-center gap-5 p-4 lg:w-[216px]">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-page text-[32px] font-bold leading-10 text-content-primary">
                  {index + 1}
                </span>
                <p className="text-center text-body-m font-medium leading-6 text-content-primary sm:text-body-l">
                  {step}
                </p>
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden h-2 w-32 shrink-0 self-center rounded-full bg-brand/10 lg:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
