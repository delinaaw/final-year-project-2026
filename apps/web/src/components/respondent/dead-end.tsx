import Link from "next/link";

import { Logo } from "@/components/ui/logo";

interface DeadEndProps {
  title: string;
  body: string;
  detail?: string;
  action?: { label: string; href: string };
}

export function DeadEnd({ title, body, detail, action }: DeadEndProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-surface-card px-5 sm:px-8">
        <Logo tone="marine" />
        <Link href="/help" className="focus-ring rounded text-body-s text-content-secondary">
          Help
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-4 text-center">
          <h1 className="text-[26px] font-bold leading-8 text-content-primary sm:text-[32px] sm:leading-10">
            {title}
          </h1>
          <p className="text-body-m leading-6 text-content-secondary sm:text-body-l">{body}</p>
          {detail ? (
            <p className="rounded-full bg-surface-subtle px-3.5 py-1.5 text-body-s text-content-secondary">
              {detail}
            </p>
          ) : null}
          {action ? (
            <Link
              href={action.href}
              className="focus-ring mt-2 rounded-lg border border-line bg-surface-card px-5 py-3 text-body-m font-semibold text-content-primary"
            >
              {action.label}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
