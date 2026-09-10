"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { seriesColor } from "@/features/responses/palette";
import type { OptionBreakdown } from "@/features/responses/api";

const PIE_LIMIT = 5;

function Legend({ data }: { data: OptionBreakdown[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {data.map((entry, index) => (
        <li key={entry.label} className="flex items-center gap-2.5">
          <span
            className="size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: seriesColor(index) }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-body-s text-content-primary">
            {entry.label}
          </span>
          <span className="shrink-0 text-body-s tabular-nums text-content-secondary">
            {entry.count} · {entry.percentage}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function Bars({ data }: { data: OptionBreakdown[] }) {
  const highest = Math.max(...data.map((entry) => entry.count), 1);

  return (
    <ul className="flex flex-col gap-3">
      {data.map((entry, index) => (
        <li key={entry.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-body-s text-content-primary">
              {entry.label}
            </span>
            <span className="shrink-0 text-body-s tabular-nums text-content-secondary">
              {entry.count} · {entry.percentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(entry.count / highest) * 100}%`,
                backgroundColor: seriesColor(index),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnswerDistribution({ data }: { data: OptionBreakdown[] }) {
  const answered = data.some((entry) => entry.count > 0);

  if (!answered) {
    return <p className="text-body-s text-content-placeholder">No answers yet</p>;
  }

  if (data.length > PIE_LIMIT) return <Bars data={data} />;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
      <div className="h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={52}
              outerRadius={92}
              paddingAngle={2}
              stroke="var(--chart-surface)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={seriesColor(index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border-default))",
                fontSize: 13,
              }}
              formatter={(value: number, name: string) => [`${value} responses`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full min-w-0 flex-1">
        <Legend data={data} />
      </div>
    </div>
  );
}
