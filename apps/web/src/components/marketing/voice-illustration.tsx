import Image from "next/image";

const BAR_HEIGHTS = [12, 20, 14, 20, 8, 14, 20, 14, 12, 8, 12, 16, 20, 12, 14, 18, 12, 8];

export function VoiceIllustration() {
  return (
    <section className="bg-white px-5 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-center gap-10 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">
          <h2 className="text-[26px] font-bold leading-[34px] text-content-primary sm:text-[32px] sm:leading-10">
            Voice-First Form Filling
          </h2>
          <p className="text-body-m font-medium leading-6 text-content-primary/80 sm:text-body-l">
            Speak your answers and watch them come alive, editing by voice or text when necessary.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-card sm:p-6 lg:w-auto">
          <div className="flex items-center gap-4 py-1 sm:gap-6">
            <span className="flex size-[68px] shrink-0 items-center justify-center rounded-full bg-brand/30 p-2 sm:size-[84px]">
              <span className="flex items-center justify-center rounded-full bg-brand-gradient p-3">
                <Image
                  src="/landing/mic-tile.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-7 sm:size-8"
                />
              </span>
            </span>

            <span className="flex items-end gap-1 overflow-hidden" aria-hidden>
              {BAR_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="w-2 shrink-0 rounded-full bg-brand-gradient opacity-90"
                  style={{ height }}
                />
              ))}
            </span>
          </div>

          <p className="text-[17px] leading-7 text-content-primary sm:text-[20px] sm:leading-[28px]">
            &ldquo;My favorite color is definitely blue, especially the ocean shades...
            <span className="text-[24px] leading-5">|</span>
          </p>
        </div>
      </div>
    </section>
  );
}
