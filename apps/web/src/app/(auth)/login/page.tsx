import { RequiresClerk } from "@/components/auth/requires-clerk";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Log in" };

export default function Page() {
  return (
    <RequiresClerk>
      <LoginForm />
    </RequiresClerk>
  );
}
