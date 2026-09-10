import { BuilderRail } from "@/components/builder/builder-rail";

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <BuilderRail />
      <div className="flex-1">{children}</div>
    </div>
  );
}
