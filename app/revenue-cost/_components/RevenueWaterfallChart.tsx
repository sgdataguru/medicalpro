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
} from 'recharts';
import type { RevenueComponent } from '@/lib/revenue-cost/revenue-cost.types';
import { CHART_COLORS } from '@/lib/revenue-cost/revenue-cost.constants';
import {
  buildWaterfallData,
  formatCurrencyCompact,
  formatPercentage,
} from '@/lib/revenue-cost/revenue-cost.utils';

interface RevenueWaterfallChartProps {
  components: RevenueComponent[];
  comparisonTotal: number;
  currentTotal: number;
  onBarClick?: (componentId: string) => void;
}

interface WaterfallBar {
  name: string;
  base: number;
  value: number;
  componentId: string;
  isTotal: boolean;
  isPositive: boolean;
  delta: number;
}

function WaterfallTooltip({
  active,
  payload,
  currentTotal,
}: {
  active?: boolean;
  payload?: Array<{ payload: WaterfallBar }>;
  currentTotal: number;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-medium text-on-surface">{data.name}</p>
      <p className="mt-1 text-gray-600">
        Amount:{' '}
        <span className="font-mono font-semibold">
          {formatCurrencyCompact(data.isTotal ? data.value : data.delta)}
        </span>
      </p>
      {!data.isTotal && currentTotal !== 0 && (
        <p className="text-gray-500">
          % of total:{' '}
          {formatPercentage((Math.abs(data.delta) / currentTotal) * 100)}
        </p>
      )}
    </div>
  );
}

export default function RevenueWaterfallChart({
  components,
  comparisonTotal,
  currentTotal,
  onBarClick,
}: RevenueWaterfallChartProps) {
  const chartData: WaterfallBar[] = useMemo(() => {
    const points = buildWaterfallData(components, comparisonTotal, currentTotal);

    return points.map((pt) => ({
      name: pt.name,
      base: pt.isTotal ? 0 : pt.cumulativeStart,
      value: pt.isTotal ? pt.value : Math.abs(pt.value),
      componentId: pt.componentId,
      isTotal: pt.isTotal,
      isPositive: pt.isPositive,
      delta: pt.value,
    }));
  }, [components, comparisonTotal, currentTotal]);

  function getBarColor(entry: WaterfallBar): string {
    if (entry.isTotal) return CHART_COLORS.waterfallTotal;
    return entry.isPositive
      ? CHART_COLORS.waterfallPositive
      : CHART_COLORS.waterfallNegative;
  }

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <h3 className="font-headline text-lg font-semibold text-on-surface">
        Revenue Bridge
      </h3>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
            />
            <YAxis
              tickFormatter={(v: number) => formatCurrencyCompact(v)}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<WaterfallTooltip currentTotal={currentTotal} />}
            />
            {/* Invisible base bar */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            {/* Visible value bar */}
            <Bar
              dataKey="value"
              stackId="waterfall"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data: unknown) => {
                const d = data as Record<string, unknown>;
                if (onBarClick && d.componentId) {
                  onBarClick(d.componentId as string);
                }
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
