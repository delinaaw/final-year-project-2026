import { RequireSession } from "@/components/auth/require-session";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}
