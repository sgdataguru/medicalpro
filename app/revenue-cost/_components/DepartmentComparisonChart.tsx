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
  LabelList,
} from 'recharts';
import type { DepartmentFinancialSummary } from '@/lib/revenue-cost/revenue-cost.types';
import { CHART_COLORS } from '@/lib/revenue-cost/revenue-cost.constants';
import {
  formatCurrencyCompact,
  formatPercentage,
} from '@/lib/revenue-cost/revenue-cost.utils';

interface DepartmentComparisonChartProps {
  departments: DepartmentFinancialSummary[];
  onDepartmentClick?: (departmentId: string) => void;
}

interface ChartDatum {
  departmentId: string;
  name: string;
  revenue: number;
  cost: number;
  marginPercentage: number;
}

function abbreviate(name: string, maxLen = 12): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

function DepartmentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const netIncome = data.revenue - data.cost;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-medium text-on-surface">{data.name}</p>
      <div className="mt-1 space-y-0.5">
        <p className="text-gray-600">
          Revenue:{' '}
          <span className="font-mono font-semibold text-secondary-container">
            {formatCurrencyCompact(data.revenue)}
          </span>
        </p>
        <p className="text-gray-600">
          Cost:{' '}
          <span className="font-mono font-semibold text-red-600">
            {formatCurrencyCompact(data.cost)}
          </span>
        </p>
        <p className="text-gray-600">
          Net income:{' '}
          <span className="font-mono font-semibold">
            {formatCurrencyCompact(netIncome)}
          </span>
        </p>
        <p className="text-gray-600">
          Margin: {formatPercentage(data.marginPercentage)}
        </p>
      </div>
    </div>
  );
}

function MarginLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill="#6B7280"
      fontSize={10}
    >
      {formatPercentage(value)}
    </text>
  );
}

export default function DepartmentComparisonChart({
  departments,
  onDepartmentClick,
}: DepartmentComparisonChartProps) {
  const chartData: ChartDatum[] = departments.map((d) => ({
    departmentId: d.departmentId,
    name: d.departmentName,
    revenue: d.revenue,
    cost: d.cost,
    marginPercentage: d.marginPercentage,
  }));

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <h3 className="font-headline text-lg font-semibold text-on-surface">
        Department Comparison
      </h3>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tickFormatter={(v: string) => abbreviate(v)}
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
            <Tooltip content={<DepartmentTooltip />} />
            <Legend
              formatter={(value: string) =>
                value === 'revenue' ? 'Revenue' : 'Cost'
              }
            />

            {/* Revenue bars */}
            <Bar
              dataKey="revenue"
              fill={CHART_COLORS.revenue}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data: unknown) => {
                const d = data as Record<string, unknown>;
                if (onDepartmentClick && d.departmentId) {
                  onDepartmentClick(d.departmentId as string);
                }
              }}
            >
              <LabelList
                dataKey="marginPercentage"
                content={<MarginLabel />}
              />
              {chartData.map((_, index) => (
                <Cell key={`rev-${index}`} fill={CHART_COLORS.revenue} />
              ))}
            </Bar>

            {/* Cost bars */}
            <Bar
              dataKey="cost"
              fill={CHART_COLORS.cost}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data: unknown) => {
                const d = data as Record<string, unknown>;
                if (onDepartmentClick && d.departmentId) {
                  onDepartmentClick(d.departmentId as string);
                }
              }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cost-${index}`} fill={CHART_COLORS.cost} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
