import { Eye } from "lucide-react";

export function PreviewBanner() {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-brand px-4 py-2.5 text-center text-body-s font-semibold text-content-inverse">
      <Eye className="size-4 shrink-0" />
      Preview Mode — responses won&apos;t be saved
    </div>
  );
}
