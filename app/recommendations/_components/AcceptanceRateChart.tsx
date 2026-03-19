'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useRecommendationLearning } from '../_hooks/useRecommendationLearning';
import { CHART_COLORS } from '@/lib/recommendations/recommendations.constants';

export default function AcceptanceRateChart() {
  const { trends, isImproving, improvementRate, isLoading } =
    useRecommendationLearning();

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-base font-semibold text-on-surface">
          Learning Loop Performance
        </h3>
        {!isLoading && isImproving && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#009668]">
            <span className="material-symbols-outlined text-[16px]">
              trending_up
            </span>
            +{improvementRate}% improvement
          </span>
        )}
      </div>

      {/* Chart body */}
      {isLoading ? (
        <div className="h-[300px] bg-surface-container-high rounded-lg animate-pulse" />
      ) : trends.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-on-surface-variant text-sm">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">
              insights
            </span>
            <p>No learning data available yet</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
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
              tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
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
                const label =
                  name === 'acceptanceRate'
                    ? 'Acceptance Rate'
                    : 'Outcome Accuracy';
                return [`${value}%`, label];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value: string) =>
                value === 'acceptanceRate'
                  ? 'Acceptance Rate'
                  : 'Outcome Accuracy'
              }
            />
            <Line
              type="monotone"
              dataKey="acceptanceRate"
              name="acceptanceRate"
              stroke="#0058be"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0058be' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="outcomeAccuracy"
              name="outcomeAccuracy"
              stroke="#009668"
              strokeWidth={2}
              dot={{ r: 4, fill: '#009668' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
