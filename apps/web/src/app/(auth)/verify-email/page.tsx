import { RequiresClerk } from "@/components/auth/requires-clerk";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export const metadata = { title: "Verify your email" };

export default function Page() {
  return (
    <RequiresClerk>
      <VerifyEmailForm />
    </RequiresClerk>
  );
}
