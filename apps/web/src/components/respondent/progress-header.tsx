export function ProgressHeader({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between text-body-s text-content-secondary">
        <span>
          Question {current} of {total}
        </span>
        <span>{percent}% complete</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-marine transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
