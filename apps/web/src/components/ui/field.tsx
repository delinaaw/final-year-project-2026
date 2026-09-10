import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-body-s font-semibold text-content-primary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-body-s text-state-danger">{error}</p>
      ) : hint ? (
        <p className="text-body-s text-content-secondary">{hint}</p>
      ) : null}
    </div>
  );
}
