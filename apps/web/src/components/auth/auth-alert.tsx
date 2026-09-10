import { AlertCircle } from "lucide-react";

export function AuthAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-state-danger/25 bg-state-danger/5 px-4 py-3"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-state-danger" />
      <p className="text-body-s leading-5 text-content-primary">{message}</p>
    </div>
  );
}
