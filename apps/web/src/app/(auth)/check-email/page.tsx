import { Suspense } from "react";

import { CheckEmailPanel } from "@/features/auth/check-email-panel";

export const metadata = { title: "Check your email" };

export default function Page() {
  return (
    <Suspense>
      <CheckEmailPanel />
    </Suspense>
  );
}
