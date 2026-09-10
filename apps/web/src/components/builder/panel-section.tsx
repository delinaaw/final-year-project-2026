import type { LucideIcon } from "lucide-react";

export function PanelSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex items-center justify-center rounded-lg bg-brand/30 p-1">
          <Icon className="size-6 text-content-primary" />
        </span>
        <h2 className="text-body-l font-semibold text-content-primary">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function SettingRow({
  label,
  children,
  stacked,
}: {
  label: string;
  children: React.ReactNode;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-body-l font-semibold text-content-primary">{label}</span>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-l leading-6 text-content-primary">{label}</span>
      {children}
    </div>
  );
}
