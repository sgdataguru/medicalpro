'use client';

import type { VisualizationSpec } from '@/lib/analytics-query/analytics-query.types';
import { useVisualizationData } from '../_hooks/useVisualizationData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/analytics-query/analytics-query.utils';
import { CHART_COLORS } from '@/lib/analytics-query/analytics-query.constants';

interface DynamicVisualizationProps {
  spec: VisualizationSpec;
}

export default function DynamicVisualization({ spec }: DynamicVisualizationProps) {
  const { chartData, tableData, isTable, title, config } = useVisualizationData(spec);

  const formatYValue = (value: number) => {
    if (config?.currency) return formatCurrency(value);
    if (config?.percentage) return formatPercentage(value);
    return value.toLocaleString();
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4">
      <h4 className="font-headline text-sm font-bold text-on-surface mb-3">{title}</h4>

      {isTable && tableData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                {tableData.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left py-2 px-3 text-xs font-bold uppercase tracking-widest text-on-primary-container"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={`border-b border-outline-variant/5 ${
                    tableData.highlightRows.includes(ri) ? 'bg-secondary/5' : ''
                  }`}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-on-surface-variant">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : chartData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {spec.type === 'line_chart' ? (
              <LineChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickFormatter={formatYValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1c2e',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#faf8ff',
                  }}
                  formatter={(value) => [formatYValue(Number(value)), '']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartData.colors[0]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: chartData.colors[0] }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickFormatter={formatYValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1c2e',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#faf8ff',
                  }}
                  formatter={(value) => [formatYValue(Number(value)), '']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={chartData.colors[i % chartData.colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
