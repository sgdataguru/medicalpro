'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { OutcomeTrend } from '@/lib/recommendations/recommendations.types';
import { CHART_COLORS } from '@/lib/recommendations/recommendations.constants';

interface OutcomeTrendChartProps {
  trends: OutcomeTrend[];
}

export default function OutcomeTrendChart({
  trends,
}: OutcomeTrendChartProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
        <h3 className="font-headline text-base font-semibold text-on-surface mb-4">
          Monthly Outcomes
        </h3>
        <div className="flex items-center justify-center h-[300px] text-on-surface-variant text-sm">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">
              show_chart
            </span>
            <p>No trend data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      <h3 className="font-headline text-base font-semibold text-on-surface mb-4">
        Monthly Outcomes
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={trends}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            allowDecimals={false}
            label={{
              value: 'Count',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: CHART_COLORS.axis },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            label={{
              value: 'Rate',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 11, fill: CHART_COLORS.axis },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#faf8ff',
              border: '1px solid #c6c6cd',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#131b2e',
            }}
            formatter={(value, name) => {
              if (name === 'successRate') return [`${value}%`, 'Success Rate'];
              return [value, 'Accepted Count'];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value: string) =>
              value === 'acceptedCount' ? 'Accepted Count' : 'Success Rate'
            }
          />
          <Bar
            yAxisId="left"
            dataKey="acceptedCount"
            name="acceptedCount"
            fill={CHART_COLORS.accepted}
            radius={[4, 4, 0, 0]}
            barSize={28}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="successRate"
            name="successRate"
            stroke={CHART_COLORS.successRate}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLORS.successRate }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
