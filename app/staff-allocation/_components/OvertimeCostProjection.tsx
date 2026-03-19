'use client';

import type { OvertimeCostProjection as OvertimeData } from '@/lib/staff-allocation/staff-allocation.types';
import { formatOvertimeCost } from '@/lib/staff-allocation/staff-allocation.utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface OvertimeCostProjectionProps {
  projections: OvertimeData[];
}

export default function OvertimeCostProjection({ projections }: OvertimeCostProjectionProps) {
  if (projections.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 flex items-center justify-center h-64">
        <p className="text-sm text-on-surface-variant">Run a prediction to see overtime cost projections.</p>
      </div>
    );
  }

  const totalSavings = projections.reduce((s, p) => s + p.savings, 0);

  const chartData = projections.map((p) => ({
    name: p.departmentName.length > 10 ? p.departmentName.slice(0, 10) + '...' : p.departmentName,
    current: p.currentOvertimeCost,
    optimized: p.projectedOvertimeCost,
  }));

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">payments</span>
          <h3 className="font-headline text-sm font-bold text-on-surface">Overtime Cost Projection</h3>
        </div>
        <span className="text-xs font-bold text-emerald-600">
          Projected savings: {formatOvertimeCost(totalSavings)}
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c6c6cd" />
            <XAxis dataKey="name" tick={{ fill: '#45464d', fontSize: 10 }} axisLine={{ stroke: '#c6c6cd' }} />
            <YAxis tick={{ fill: '#45464d', fontSize: 10 }} axisLine={{ stroke: '#c6c6cd' }} tickFormatter={(v) => formatOvertimeCost(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1c2e', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#faf8ff' }}
              formatter={(value) => [formatOvertimeCost(Number(value)), '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="current" name="Current" fill="#ba1a1a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="optimized" name="Optimized" fill="#009668" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
