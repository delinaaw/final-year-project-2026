import { Logo } from "@/components/ui/logo";

export function RespondentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-surface-card px-5 sm:px-8">
        <Logo tone="marine" />
      </header>
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
