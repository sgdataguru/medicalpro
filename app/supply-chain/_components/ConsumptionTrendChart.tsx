'use client';

import { useMemo, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts';
import type {
  ConsumptionTrendData,
  ConsumptionAnomaly,
} from '@/lib/supply-chain/supply-chain.types';
import { CHART_COLORS } from '@/lib/supply-chain/supply-chain.constants';

interface ConsumptionTrendChartProps {
  trends: ConsumptionTrendData[];
  anomalies: ConsumptionAnomaly[];
  onAnomalyClick?: (anomalyId: string) => void;
}

/**
 * Deterministic color palette for multiple category lines.
 * Falls back to the constant CHART_COLORS.actual for the first category.
 */
const CATEGORY_LINE_COLORS = [
  CHART_COLORS.actual,
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal alt
  '#F97316', // orange
];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ConsumptionTrendChart({
  trends,
  anomalies,
  onAnomalyClick,
}: ConsumptionTrendChartProps) {
  /**
   * Merge all category data-points into a single flat array keyed by date.
   * Each row: { date, [category_actual]: number, [category_predicted]?: number }
   */
  const { chartData, categoryKeys } = useMemo(() => {
    const dateMap: Record<string, Record<string, number | string>> = {};
    const keys: {
      category: string;
      actualKey: string;
      predictedKey: string | null;
      color: string;
    }[] = [];

    trends.forEach((trend, idx) => {
      const actualKey = `${trend.category}_actual`;
      const predictedKey = `${trend.category}_predicted`;
      const hasPredicted = trend.dataPoints.some(
        (dp) => dp.predictedConsumption !== undefined,
      );

      keys.push({
        category: trend.category,
        actualKey,
        predictedKey: hasPredicted ? predictedKey : null,
        color: CATEGORY_LINE_COLORS[idx % CATEGORY_LINE_COLORS.length],
      });

      trend.dataPoints.forEach((dp) => {
        if (!dateMap[dp.date]) {
          dateMap[dp.date] = { date: dp.date };
        }
        dateMap[dp.date][actualKey] = dp.actualConsumption;
        if (hasPredicted && dp.predictedConsumption !== undefined) {
          dateMap[dp.date][predictedKey] = dp.predictedConsumption;
        }
      });
    });

    const sorted = Object.values(dateMap).sort(
      (a, b) =>
        new Date(a.date as string).getTime() -
        new Date(b.date as string).getTime(),
    );

    return { chartData: sorted, categoryKeys: keys };
  }, [trends]);

  /** Map anomalies to their closest data-point index for ReferenceDot rendering. */
  const anomalyDots = useMemo(() => {
    return anomalies.map((a) => {
      const row = chartData.find((r) => r.date === a.detectedDate);
      const key = categoryKeys.find((k) => k.category === trends.find((t) =>
        t.dataPoints.some((dp) => dp.date === a.detectedDate),
      )?.category);
      return {
        ...a,
        x: a.detectedDate,
        y: row && key ? (row[key.actualKey] as number) ?? a.actualValue : a.actualValue,
        dataKey: key?.actualKey ?? categoryKeys[0]?.actualKey,
      };
    });
  }, [anomalies, chartData, categoryKeys, trends]);

  /** Custom legend */
  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs font-sans text-gray-600">
      {categoryKeys.map((k) => (
        <div key={k.category} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: k.color }}
          />
          <span>{k.category}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <h2 className="font-headline text-lg font-semibold text-on-surface mb-5">
        Consumption Trends
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            interval={2}
            tick={{ fontSize: 11, fill: '#6B7280' }}
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            label={{
              value: 'Units',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#6B7280' },
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              border: '1px solid #E5E7EB',
            }}
            labelFormatter={(label: ReactNode) => formatDateLabel(String(label))}
          />

          <Legend content={renderLegend} />

          {/* Render lines per category */}
          {categoryKeys.map((k) => (
            <Line
              key={k.actualKey}
              type="monotone"
              dataKey={k.actualKey}
              name={`${k.category} (actual)`}
              stroke={k.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}

          {categoryKeys
            .filter((k) => k.predictedKey !== null)
            .map((k) => (
              <Line
                key={k.predictedKey!}
                type="monotone"
                dataKey={k.predictedKey!}
                name={`${k.category} (predicted)`}
                stroke={CHART_COLORS.predicted}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}

          {/* Anomaly markers */}
          {anomalyDots.map((dot) => (
            <ReferenceDot
              key={dot.anomalyId}
              x={dot.x}
              y={dot.y}
              r={6}
              fill={CHART_COLORS.anomaly}
              stroke="#fff"
              strokeWidth={2}
              onClick={() => onAnomalyClick?.(dot.anomalyId)}
              style={{ cursor: onAnomalyClick ? 'pointer' : 'default' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
