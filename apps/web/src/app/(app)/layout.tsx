import { RequireSession } from "@/components/auth/require-session";
import { AppHeader } from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <div className="flex min-h-screen flex-col bg-surface-page">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </RequireSession>
  );
}
