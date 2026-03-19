'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { MonthlyMargin } from '@/lib/revenue-cost/revenue-cost.types';

interface MarginSparklineProps {
  data: MonthlyMargin[];
  width?: number;
  height?: number;
}

export default function MarginSparkline({
  data,
  width,
  height = 48,
}: MarginSparklineProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((d) => ({
    month: d.month,
    margin: d.marginPercentage,
  }));

  return (
    <ResponsiveContainer width={width ?? '100%'} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="margin"
          stroke="var(--color-teal)"
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
        {/* Render a single dot on the last data point */}
        <Line
          type="monotone"
          dataKey="margin"
          stroke="none"
          dot={(props: Record<string, unknown>) => {
            const { cx, cy, index } = props as {
              cx: number;
              cy: number;
              index: number;
            };
            if (index === chartData.length - 1) {
              return (
                <circle
                  key="last-dot"
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="var(--color-teal)"
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            }
            return <g key={`empty-${index}`} />;
          }}
          activeDot={false}
          legendType="none"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
