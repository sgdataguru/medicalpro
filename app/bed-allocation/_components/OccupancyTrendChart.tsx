'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import type {
  OccupancyTrendSeries,
  BedDemandForecast,
} from '@/lib/bed-allocation/bed-allocation.types';
import { CHART_COLORS, OCCUPANCY_THRESHOLDS } from '@/lib/bed-allocation/bed-allocation.constants';

/* ---------- palette for department lines ---------- */
const DEPARTMENT_PALETTE = [
  CHART_COLORS.actual,
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
];

/* ---------- helpers ---------- */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ---------- types ---------- */
interface OccupancyTrendChartProps {
  trends: OccupancyTrendSeries[];
  forecast?: BedDemandForecast | null;
}

interface ChartRow {
  date: string;
  [key: string]: string | number | undefined;
}

/* ---------- custom tooltip ---------- */
interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !label) return null;

  return (
    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">
        {formatTooltipDate(label)}
      </p>
      {payload
        .filter((entry) => !entry.dataKey.endsWith('_upper') && !entry.dataKey.endsWith('_lower'))
        .map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-on-surface-variant">{entry.name}:</span>
            <span className="font-medium text-on-surface">
              {(entry.value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
    </div>
  );
}

/* ---------- component ---------- */
export default function OccupancyTrendChart({
  trends,
  forecast,
}: OccupancyTrendChartProps) {
  /* build a unified data array keyed by date */
  const { data, departmentKeys } = useMemo(() => {
    const dateMap = new Map<string, ChartRow>();
    const deptKeys: { key: string; name: string; color: string }[] = [];

    trends.forEach((series, idx) => {
      const key = `dept_${series.departmentId}`;
      deptKeys.push({
        key,
        name: series.departmentName,
        color: DEPARTMENT_PALETTE[idx % DEPARTMENT_PALETTE.length],
      });

      series.dataPoints.forEach((dp) => {
        const dateStr = dp.timestamp.slice(0, 10);
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { date: dateStr });
        }
        dateMap.get(dateStr)![key] = dp.occupancyRate;
      });
    });

    /* overlay forecast data */
    if (forecast) {
      forecast.departmentForecasts.forEach((df) => {
        const forecastKey = `forecast_${df.departmentId}`;
        const upperKey = `forecast_${df.departmentId}_upper`;
        const lowerKey = `forecast_${df.departmentId}_lower`;

        const existing = deptKeys.find(
          (d) => d.key === `dept_${df.departmentId}`,
        );
        if (
          !deptKeys.some((d) => d.key === forecastKey)
        ) {
          deptKeys.push({
            key: forecastKey,
            name: `${df.departmentName} (Forecast)`,
            color: CHART_COLORS.forecast,
          });
        }

        df.dailyForecasts.forEach((day) => {
          const dateStr = day.date.slice(0, 10);
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, { date: dateStr });
          }
          const row = dateMap.get(dateStr)!;
          row[forecastKey] = day.predictedOccupancyRate;
          row[upperKey] = day.confidenceInterval.upper;
          row[lowerKey] = day.confidenceInterval.lower;
        });
      });
    }

    const sorted = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return { data: sorted, departmentKeys: deptKeys };
  }, [trends, forecast]);

  return (
    <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <h2 className="mb-4 font-headline text-lg font-semibold text-on-surface">
        Occupancy Trends
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#D1D5DB' }}
          />

          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#D1D5DB' }}
            width={48}
          />

          {/* Threshold reference lines */}
          <ReferenceLine
            y={OCCUPANCY_THRESHOLDS.OVER_CAPACITY}
            stroke={CHART_COLORS.overCapacity}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: '95% Over Capacity',
              position: 'insideTopRight',
              fill: CHART_COLORS.overCapacity,
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={OCCUPANCY_THRESHOLDS.WARNING}
            stroke={CHART_COLORS.threshold}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: '85% Warning',
              position: 'insideTopRight',
              fill: CHART_COLORS.threshold,
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={OCCUPANCY_THRESHOLDS.TARGET_LOW}
            stroke="#22C55E"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: '70% Target Low',
              position: 'insideBottomRight',
              fill: '#22C55E',
              fontSize: 10,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3' }}
          />

          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: '#374151' }}
          />

          {/* Confidence bands for forecast series */}
          {forecast &&
            forecast.departmentForecasts.map((df) => {
              const upperKey = `forecast_${df.departmentId}_upper`;
              const lowerKey = `forecast_${df.departmentId}_lower`;

              return (
                <Area
                  key={`confidence_${df.departmentId}`}
                  dataKey={upperKey}
                  stroke="none"
                  fill={CHART_COLORS.confidenceBand}
                  fillOpacity={1}
                  baseValue="dataMin"
                  name={`${df.departmentName} Confidence`}
                  legendType="none"
                  isAnimationActive={false}
                />
              );
            })}

          {/* Department actual lines */}
          {departmentKeys.map((dept) => {
            const isForecast = dept.key.startsWith('forecast_');
            return (
              <Line
                key={dept.key}
                type="monotone"
                dataKey={dept.key}
                name={dept.name}
                stroke={dept.color}
                strokeWidth={2}
                strokeDasharray={isForecast ? '8 4' : undefined}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                connectNulls
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
