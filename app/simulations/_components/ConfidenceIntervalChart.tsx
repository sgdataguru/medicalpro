'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { ConfidenceInterval } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG } from '@/lib/simulation/simulation.constants';

interface ConfidenceIntervalChartProps {
  intervals: ConfidenceInterval[];
}

interface ChartDatum {
  name: string;
  fullName: string;
  value: number;
  lower: number;
  upper: number;
  color: string;
  unit: string;
}

function truncateMetric(metric: string, maxLen = 24): string {
  if (metric.length <= maxLen) return metric;
  return metric.slice(0, maxLen - 1) + '\u2026';
}

// Custom tooltip component
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-lg ring-1 ring-outline-variant/15 text-xs">
      <p className="font-medium text-on-surface mb-1">{data.fullName}</p>
      <div className="space-y-0.5 text-on-surface-variant">
        <p>
          Point estimate:{' '}
          <span className="font-medium text-on-surface">
            {data.value.toLocaleString()} {data.unit}
          </span>
        </p>
        <p>
          95% CI:{' '}
          <span className="font-medium text-on-surface">
            [{data.lower.toLocaleString()} &ndash; {data.upper.toLocaleString()}]
          </span>
        </p>
      </div>
    </div>
  );
}

export default function ConfidenceIntervalChart({
  intervals,
}: ConfidenceIntervalChartProps) {
  const chartData: ChartDatum[] = useMemo(
    () =>
      intervals.map((ci) => ({
        name: truncateMetric(ci.metric),
        fullName: ci.metric,
        value: ci.pointEstimate,
        lower: ci.lowerBound,
        upper: ci.upperBound,
        color: MODULE_CONFIG[ci.module].color,
        unit: ci.unit,
      })),
    [intervals],
  );

  const chartHeight = intervals.length * 50 + 60;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[22px] text-on-surface">
          analytics
        </span>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Confidence Intervals (95%)
        </h3>
      </div>

      {/* Chart container */}
      <div className="bg-surface-container rounded-xl p-6 ring-1 ring-outline-variant/15">
        {intervals.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant text-center py-8">
            No confidence interval data available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#c6c6cd"
                horizontal={false}
              />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#45464d' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: '#45464d' }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <ReferenceLine x={0} stroke="#45464d" strokeWidth={1} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((datum, idx) => (
                  <Cell key={`cell-${idx}`} fill={datum.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* CI range legend below chart */}
        {intervals.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {chartData.map((datum, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-xs text-on-surface-variant"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: datum.color }}
                />
                <span className="font-medium text-on-surface min-w-[140px]">
                  {datum.name}
                </span>
                <span className="tabular-nums">
                  [{datum.lower.toLocaleString()} &ndash;{' '}
                  {datum.upper.toLocaleString()}] {datum.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
