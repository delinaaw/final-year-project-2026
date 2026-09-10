import { AuthShowcase } from "@/components/auth/auth-showcase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page p-4 md:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-card shadow-card md:grid-cols-2">
        <AuthShowcase />
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </main>
  );
}
