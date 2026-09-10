export function FormCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-card">
      <div className="h-[164px] animate-pulse bg-surface-subtle" />
      <div className="flex min-h-[104px] flex-col justify-center gap-3 px-[18px]">
        <span className="h-4 w-3/5 animate-pulse rounded bg-surface-subtle" />
        <span className="h-3 w-2/5 animate-pulse rounded bg-surface-subtle" />
      </div>
    </div>
  );
}
