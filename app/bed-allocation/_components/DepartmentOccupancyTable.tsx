'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DepartmentOccupancy } from '@/lib/bed-allocation/bed-allocation.types';
import {
  formatOccupancyRate,
  getOccupancyColor,
  formatRevenue,
  getTrendIcon,
  getTrendColor,
} from '@/lib/bed-allocation/bed-allocation.utils';
import OccupancyBar from './OccupancyBar';
import TrendIndicator from './TrendIndicator';

/* ---------- types ---------- */
interface DepartmentOccupancyTableProps {
  departments: DepartmentOccupancy[];
  onDepartmentClick?: (deptId: string) => void;
}

type SortField =
  | 'departmentName'
  | 'totalBeds'
  | 'occupiedBeds'
  | 'availableBeds'
  | 'occupancyRate'
  | 'trendPercentage'
  | 'monthlyRevenue';

type SortDirection = 'asc' | 'desc';

/* ---------- column definitions ---------- */
const COLUMNS: { label: string; field: SortField; align?: 'right' }[] = [
  { label: 'Department', field: 'departmentName' },
  { label: 'Ward(s)', field: 'departmentName' }, // not sortable by its own, re-uses dept sort
  { label: 'Total Beds', field: 'totalBeds', align: 'right' },
  { label: 'Occupied', field: 'occupiedBeds', align: 'right' },
  { label: 'Available', field: 'availableBeds', align: 'right' },
  { label: 'Occupancy', field: 'occupancyRate', align: 'right' },
  { label: 'Trend', field: 'trendPercentage', align: 'right' },
  { label: 'Revenue', field: 'monthlyRevenue', align: 'right' },
];

/* ---------- sort chevron ---------- */
function SortChevron({
  field,
  activeField,
  direction,
}: {
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
}) {
  if (field !== activeField) {
    return (
      <span className="ml-1 text-on-surface-variant/30 opacity-0 transition-opacity group-hover:opacity-100">
        &updownarrow;
      </span>
    );
  }
  return (
    <span className="ml-1 text-on-surface-variant">
      {direction === 'asc' ? '\u2191' : '\u2193'}
    </span>
  );
}

/* ---------- component ---------- */
export default function DepartmentOccupancyTable({
  departments,
  onDepartmentClick,
}: DepartmentOccupancyTableProps) {
  const [sortField, setSortField] = useState<SortField>('occupancyRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField],
  );

  const sorted = useMemo(() => {
    const copy = [...departments];
    copy.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return copy;
  }, [departments, sortField, sortDirection]);

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] table-auto">
          {/* -------- header -------- */}
          <thead>
            <tr className="bg-surface-container">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`group cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  onClick={() => handleSort(col.field)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortChevron
                      field={col.field}
                      activeField={sortField}
                      direction={sortDirection}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* -------- body -------- */}
          <tbody>
            {sorted.map((dept) => (
              <tr
                key={dept.departmentId}
                className="cursor-pointer border-b border-outline-variant/10 transition-colors hover:bg-surface-container"
                onClick={() => onDepartmentClick?.(dept.departmentId)}
              >
                {/* Department name */}
                <td className="px-4 py-3 text-sm font-medium text-on-surface">
                  {dept.departmentName}
                </td>

                {/* Ward(s) */}
                <td className="px-4 py-3 text-sm text-on-surface-variant">
                  {dept.wards.map((w) => w.wardName).join(', ')}
                </td>

                {/* Total Beds */}
                <td className="px-4 py-3 text-right text-sm tabular-nums text-on-surface-variant">
                  {dept.totalBeds}
                </td>

                {/* Occupied */}
                <td className="px-4 py-3 text-right text-sm tabular-nums text-on-surface-variant">
                  {dept.occupiedBeds}
                </td>

                {/* Available */}
                <td className="px-4 py-3 text-right text-sm tabular-nums text-on-surface-variant">
                  {dept.availableBeds}
                </td>

                {/* Occupancy - bar + text */}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-semibold tabular-nums ${getOccupancyColor(dept.occupancyRate)}`}
                    >
                      {formatOccupancyRate(dept.occupancyRate)}
                    </span>
                    <div className="w-20">
                      <OccupancyBar rate={dept.occupancyRate} />
                    </div>
                  </div>
                </td>

                {/* Trend */}
                <td className="px-4 py-3 text-right">
                  <TrendIndicator
                    trend={dept.trend}
                    percentage={dept.trendPercentage}
                  />
                </td>

                {/* Revenue */}
                <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-on-surface">
                  {formatRevenue(dept.monthlyRevenue)}
                </td>
              </tr>
            ))}

            {departments.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-12 text-center text-sm text-on-surface-variant/60"
                >
                  No department data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
