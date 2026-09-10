import { Suspense } from "react";

import { RequiresClerk } from "@/components/auth/requires-clerk";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata = { title: "Set a new password" };

export default function Page() {
  return (
    <RequiresClerk>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </RequiresClerk>
  );
}
