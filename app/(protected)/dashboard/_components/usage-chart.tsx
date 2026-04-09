'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Props = {
  data: { date: string; count: number }[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-medium">{formatDate(label)}</p>
      <p className="text-zinc-500 dark:text-zinc-400">
        {payload[0].value} {payload[0].value === 1 ? 'message' : 'messages'}
      </p>
    </div>
  );
}

export function UsageChart({ data }: Props) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div
        className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500"
        style={{ height: 240 }}
      >
        <svg
          className="mb-3 h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm font-medium">No messages yet</p>
        <p className="mt-1 text-xs">
          Start a conversation to see your usage here
        </p>
      </div>
    );
  }

  // Axis colors inherit from `currentColor` on the wrapper div, so dark mode
  // switches via Tailwind without a post-hydration re-render.
  return (
    <div className="w-full text-zinc-400 dark:text-zinc-500">
      <ResponsiveContainer width="100%" height={240} minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              const d = new Date(v + 'T00:00:00');
              return d.getDate().toString();
            }}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            axisLine={{ stroke: 'currentColor', strokeWidth: 0.5 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'currentColor', fillOpacity: 0.1 }}
          />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
