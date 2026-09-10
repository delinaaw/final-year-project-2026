import { Logo } from "@/components/ui/logo";

export function AuthShowcase() {
  return (
    <aside className="hidden shrink-0 flex-col justify-between overflow-hidden rounded-[28px] bg-brand p-10 lg:flex lg:w-[46%] xl:w-[610px] xl:rounded-[32px] xl:p-12">
      <Logo tone="inverse" />

      <div className="flex flex-col gap-5 text-content-inverse">
        <h2 className="max-w-[514px] text-[32px] font-bold leading-[40px] xl:text-[40px] xl:leading-[48px]">
          Forms people can simply listen to and speak.
        </h2>
        <p className="max-w-[514px] text-body-m leading-6 opacity-80 xl:text-body-l">
          Questions are read out loud, answers are spoken naturally, and every response is
          reviewed as text before it is submitted.
        </p>
      </div>

      <div className="flex items-center gap-2 text-content-inverse">
        <span className="size-2 rounded-full bg-current opacity-80" aria-hidden />
        <span className="text-body-s opacity-80">Accessible by design</span>
      </div>
    </aside>
  );
}
