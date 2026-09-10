import { RequiresClerk } from "@/components/auth/requires-clerk";
import { SsoCallback } from "@/features/auth/sso-callback";

export const metadata = { title: "Signing you in" };

export default function Page() {
  return (
    <RequiresClerk>
      <SsoCallback />
    </RequiresClerk>
  );
}
