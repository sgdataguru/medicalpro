'use client';

import { useMemo } from 'react';
import type {
  DepartmentOccupancy,
  ReallocationRecommendation,
} from '@/lib/bed-allocation/bed-allocation.types';
import {
  formatOccupancyRate,
  formatRevenueWithSign,
  getOccupancyBarColor,
} from '@/lib/bed-allocation/bed-allocation.utils';

interface ScenarioComparisonPanelProps {
  currentOccupancy: DepartmentOccupancy[];
  recommendations: ReallocationRecommendation[];
  visible: boolean;
}

interface ProposedDepartment {
  departmentId: string;
  departmentName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
}

export default function ScenarioComparisonPanel({
  currentOccupancy,
  recommendations,
  visible,
}: ScenarioComparisonPanelProps) {
  // Compute proposed layout based on accepted/pending recommendations
  const proposed = useMemo<ProposedDepartment[]>(() => {
    const deptMap = new Map<string, ProposedDepartment>();

    // Seed with current data
    for (const dept of currentOccupancy) {
      deptMap.set(dept.departmentId, {
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        totalBeds: dept.totalBeds,
        occupiedBeds: dept.occupiedBeds,
        occupancyRate: dept.occupancyRate,
      });
    }

    // Apply accepted/pending recommendations
    const applicable = recommendations.filter(
      (r) => r.status === 'APPROVED' || r.status === 'PENDING',
    );

    for (const rec of applicable) {
      const source = deptMap.get(rec.sourceDepartmentId);
      const target = deptMap.get(rec.targetDepartmentId);

      if (source) {
        source.totalBeds = Math.max(0, source.totalBeds - rec.bedCount);
        source.occupancyRate =
          source.totalBeds > 0
            ? source.occupiedBeds / source.totalBeds
            : 0;
      }

      if (target) {
        target.totalBeds += rec.bedCount;
        target.occupancyRate =
          target.totalBeds > 0
            ? target.occupiedBeds / target.totalBeds
            : 0;
      }
    }

    return Array.from(deptMap.values());
  }, [currentOccupancy, recommendations]);

  // Calculate summary deltas
  const summary = useMemo(() => {
    const applicable = recommendations.filter(
      (r) => r.status === 'APPROVED' || r.status === 'PENDING',
    );

    const totalRevenueDelta = applicable.reduce(
      (sum, r) => sum + r.revenueImpact.monthly,
      0,
    );

    const currentTotal = currentOccupancy.reduce(
      (sum, d) => sum + d.totalBeds,
      0,
    );
    const currentOccupied = currentOccupancy.reduce(
      (sum, d) => sum + d.occupiedBeds,
      0,
    );
    const proposedTotal = proposed.reduce((sum, d) => sum + d.totalBeds, 0);
    const proposedOccupied = proposed.reduce(
      (sum, d) => sum + d.occupiedBeds,
      0,
    );

    const currentRate = currentTotal > 0 ? currentOccupied / currentTotal : 0;
    const proposedRate =
      proposedTotal > 0 ? proposedOccupied / proposedTotal : 0;
    const coverageChange = proposedRate - currentRate;

    return { totalRevenueDelta, coverageChange };
  }, [currentOccupancy, recommendations, proposed]);

  if (!visible) return null;

  return (
    <div className="rounded-xl shadow-sm bg-surface-container-lowest p-6">
      {/* Heading */}
      <h2 className="font-headline text-lg font-semibold text-on-surface">
        Scenario Comparison
      </h2>

      {/* Two-column grid */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Current Layout */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface-variant mb-3">
            Current Layout
          </h3>
          <ul className="space-y-2">
            {currentOccupancy.map((dept) => (
              <DepartmentRow
                key={dept.departmentId}
                name={dept.departmentName}
                beds={dept.totalBeds}
                occupancyRate={dept.occupancyRate}
              />
            ))}
          </ul>
        </div>

        {/* Proposed Layout */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface-variant mb-3">
            Proposed Layout
          </h3>
          <ul className="space-y-2">
            {proposed.map((dept) => (
              <DepartmentRow
                key={dept.departmentId}
                name={dept.departmentName}
                beds={dept.totalBeds}
                occupancyRate={dept.occupancyRate}
              />
            ))}
          </ul>
        </div>
      </div>

      {/* Summary row */}
      <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-outline-variant/15 pt-4">
        <div className="text-sm text-on-surface-variant">
          Revenue Delta:{' '}
          <span
            className={`font-semibold ${
              summary.totalRevenueDelta >= 0
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {formatRevenueWithSign(summary.totalRevenueDelta)}/mo
          </span>
        </div>
        <div className="text-sm text-on-surface-variant">
          Coverage Change:{' '}
          <span
            className={`font-semibold ${
              summary.coverageChange <= 0
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {summary.coverageChange >= 0 ? '+' : ''}
            {(summary.coverageChange * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Internal helper: renders a single department row with occupancy bar */
/* ------------------------------------------------------------------ */

function DepartmentRow({
  name,
  beds,
  occupancyRate,
}: {
  name: string;
  beds: number;
  occupancyRate: number;
}) {
  const barColor = getOccupancyBarColor(occupancyRate);
  const widthPercent = Math.min(occupancyRate * 100, 100);

  return (
    <li className="rounded-md border border-outline-variant/10 bg-surface-container px-3 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-on-surface">{name}</span>
        <span className="text-on-surface-variant">
          {beds} beds &middot; {formatOccupancyRate(occupancyRate)}
        </span>
      </div>
      {/* Occupancy bar */}
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </li>
  );
}
