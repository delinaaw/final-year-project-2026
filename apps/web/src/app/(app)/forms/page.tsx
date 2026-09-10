import { AppHeader } from "@/components/layout/app-header";
import { FormsPage } from "@/features/forms/forms-page";

export const metadata = { title: "My Forms" };

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <AppHeader />
      <main className="flex-1">
        <FormsPage />
      </main>
    </div>
  );
}
