import { RequiresClerk } from "@/components/auth/requires-clerk";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata = { title: "Create your account" };

export default function Page() {
  return (
    <RequiresClerk>
      <SignUpForm />
    </RequiresClerk>
  );
}
