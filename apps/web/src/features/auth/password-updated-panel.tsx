import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";

export function PasswordUpdatedPanel() {
  return (
    <div className="flex flex-col gap-8">
      <span className="flex size-14 items-center justify-center rounded-full bg-state-success/10">
        <CheckCircle2 className="size-7 text-state-success" />
      </span>

      <AuthHeading
        title="Password updated"
        description="Your password has been changed. You can now log in with your new password."
      />

      <Button size="lg" asChild>
        <Link href="/login">Continue to log in</Link>
      </Button>

      <p className="text-center text-body-s text-content-secondary">
        Didn&apos;t request this change?{" "}
        <Link href="/help" className="font-semibold text-content-link">
          Contact support.
        </Link>
      </p>
    </div>
  );
}
