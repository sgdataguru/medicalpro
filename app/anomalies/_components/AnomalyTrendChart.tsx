'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnomalyTrendDataPoint, TrendPeriod } from '@/lib/anomaly/anomaly.types';
import { CHART_COLORS, TREND_PERIOD_OPTIONS } from '@/lib/anomaly/anomaly.constants';

interface AnomalyTrendChartProps {
  data: AnomalyTrendDataPoint[];
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  isLoading: boolean;
}

export default function AnomalyTrendChart({
  data,
  period,
  onPeriodChange,
  isLoading,
}: AnomalyTrendChartProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-base font-semibold text-secondary-container">
          Anomaly Frequency Over Time
        </h3>
        <div className="flex items-center gap-1">
          {TREND_PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                period === opt.value
                  ? 'bg-secondary text-white'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-surface-container-high rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip,
                border: '1px solid #1A3A4C',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
            />
            <Area
              type="monotone"
              dataKey="critical"
              name="Critical"
              stackId="1"
              stroke={CHART_COLORS.critical}
              fill={CHART_COLORS.critical}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="warning"
              name="Warning"
              stackId="1"
              stroke={CHART_COLORS.warning}
              fill={CHART_COLORS.warning}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="informational"
              name="Info"
              stackId="1"
              stroke={CHART_COLORS.informational}
              fill={CHART_COLORS.informational}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
