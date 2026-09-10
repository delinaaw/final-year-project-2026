"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-body-s font-semibold uppercase tracking-wide text-content-placeholder">
        Error 500
      </p>
      <h1 className="text-heading-xl">Something went wrong on our end</h1>
      <p className="max-w-md text-content-secondary">
        This is not your fault. Our team has been notified. Try again in a moment, or come back
        shortly.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground"
      >
        Try again
      </button>
    </main>
  );
}
