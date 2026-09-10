import { Suspense } from "react";

import { SsoCallback } from "@/features/auth/sso-callback";

export const metadata = { title: "Signing you in" };

export default function Page() {
  return (
    <Suspense>
      <SsoCallback />
    </Suspense>
  );
}
