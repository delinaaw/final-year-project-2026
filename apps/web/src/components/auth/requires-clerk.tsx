import Link from "next/link";

import { AuthHeading } from "@/components/auth/auth-heading";
import { CLERK_ENABLED } from "@/features/auth/config";

function NotConfigured() {
  return (
    <div className="flex flex-col gap-6">
      <AuthHeading
        title="Sign-in is not configured"
        description="This deployment has no Clerk keys yet, so accounts cannot be created or used."
      />
      <p className="rounded-xl bg-surface-subtle px-4 py-3 text-body-s leading-5 text-content-secondary">
        Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to your environment, then
        restart the app.
      </p>
      <Link href="/" className="focus-ring rounded text-body-s font-semibold text-content-link">
        Back to the homepage
      </Link>
    </div>
  );
}

export function RequiresClerk({ children }: { children: React.ReactNode }) {
  if (!CLERK_ENABLED) return <NotConfigured />;
  return <>{children}</>;
}
