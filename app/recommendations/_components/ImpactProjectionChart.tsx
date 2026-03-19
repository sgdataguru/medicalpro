'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ExpectedImpact } from '@/lib/recommendations/recommendations.types';
import { CHART_COLORS } from '@/lib/recommendations/recommendations.constants';

interface ImpactProjectionChartProps {
  impacts: ExpectedImpact[];
}

export default function ImpactProjectionChart({
  impacts,
}: ImpactProjectionChartProps) {
  if (!impacts || impacts.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
        <h3 className="font-headline text-base font-semibold text-on-surface mb-4">
          Impact Projection
        </h3>
        <div className="flex items-center justify-center h-[250px] text-on-surface-variant text-sm">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">
              bar_chart
            </span>
            <p>No impact data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = impacts.map((impact) => ({
    name: impact.displayName,
    current: impact.currentValue,
    projected: impact.projectedValue,
    direction: impact.direction,
    unit: impact.unit,
    delta: impact.delta,
    deltaPercentage: impact.deltaPercentage,
  }));

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      <h3 className="font-headline text-base font-semibold text-on-surface mb-4">
        Impact Projection
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
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
              const label = name === 'current' ? 'Current' : 'Projected';
              return [Number(value).toLocaleString(), label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value: string) =>
              value === 'current' ? 'Current' : 'Projected'
            }
          />
          <Bar dataKey="current" name="current" fill="#c6c6cd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="projected" name="projected" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.direction === 'negative' ? '#ba1a1a' : '#0058be'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
