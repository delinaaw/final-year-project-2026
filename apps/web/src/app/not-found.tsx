import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-body-s font-semibold uppercase tracking-wide text-content-placeholder">
        Error 404
      </p>
      <h1 className="text-heading-xl">This page does not exist</h1>
      <p className="max-w-md text-content-secondary">
        The link may be broken, or the page may have been moved. Check the address and try again.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/forms"
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground"
        >
          Back to My Forms
        </Link>
        <Link href="/" className="rounded-lg border border-line px-5 py-3 font-semibold">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
