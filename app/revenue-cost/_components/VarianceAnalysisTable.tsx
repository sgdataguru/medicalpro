'use client';

import { useState, useMemo } from 'react';
import type { VarianceRecord } from '@/lib/revenue-cost/revenue-cost.types';
import {
  formatCurrencyCompact,
  formatVarianceAmount,
  formatPercentage,
  getVarianceColorClass,
} from '@/lib/revenue-cost/revenue-cost.utils';
import { ITEMS_PER_PAGE } from '@/lib/revenue-cost/revenue-cost.constants';
import VarianceFlagBadge from './VarianceFlagBadge';

interface VarianceAnalysisTableProps {
  variances: VarianceRecord[];
  onRowClick: (varianceId: string) => void;
  threshold: number;
}

type SortKey =
  | 'lineItem'
  | 'departmentName'
  | 'actualAmount'
  | 'budgetAmount'
  | 'varianceToBudget'
  | 'varianceToBudgetPercentage'
  | 'severity';

type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 4,
  SIGNIFICANT: 3,
  MODERATE: 2,
  MINOR: 1,
};

const COLUMNS: { key: SortKey; label: string; align: string }[] = [
  { key: 'lineItem', label: 'Line Item', align: 'text-left' },
  { key: 'departmentName', label: 'Department', align: 'text-left' },
  { key: 'actualAmount', label: 'Actual', align: 'text-right' },
  { key: 'budgetAmount', label: 'Budget', align: 'text-right' },
  { key: 'varianceToBudget', label: 'Variance', align: 'text-right' },
  { key: 'varianceToBudgetPercentage', label: 'Var%', align: 'text-right' },
  { key: 'severity', label: 'Severity', align: 'text-center' },
];

export default function VarianceAnalysisTable({
  variances,
  onRowClick,
  threshold,
}: VarianceAnalysisTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('varianceToBudget');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  }

  const flaggedCount = useMemo(
    () => variances.filter((v) => v.flagged).length,
    [variances]
  );

  const sorted = useMemo(() => {
    const copy = [...variances];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'lineItem':
          cmp = a.lineItem.localeCompare(b.lineItem);
          break;
        case 'departmentName':
          cmp = a.departmentName.localeCompare(b.departmentName);
          break;
        case 'actualAmount':
          cmp = a.actualAmount - b.actualAmount;
          break;
        case 'budgetAmount':
          cmp = a.budgetAmount - b.budgetAmount;
          break;
        case 'varianceToBudget':
          cmp = Math.abs(a.varianceToBudget) - Math.abs(b.varianceToBudget);
          break;
        case 'varianceToBudgetPercentage':
          cmp =
            Math.abs(a.varianceToBudgetPercentage) -
            Math.abs(b.varianceToBudgetPercentage);
          break;
        case 'severity':
          cmp =
            (SEVERITY_ORDER[a.severity] ?? 0) -
            (SEVERITY_ORDER[b.severity] ?? 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [variances, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const pageData = sorted.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Variance Analysis
        </h3>
        {flaggedCount > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {flaggedCount} flagged
          </span>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2 font-medium text-xs text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 ${col.align}`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((v) => (
              <tr
                key={v.varianceId}
                onClick={() => onRowClick(v.varianceId)}
                className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  v.flagged ? 'border-l-2 border-l-yellow-300 bg-yellow-50/30' : ''
                }`}
              >
                {/* Line Item */}
                <td className="px-3 py-3 font-medium text-on-surface text-sm">
                  {v.lineItem}
                </td>
                {/* Department */}
                <td className="px-3 py-3 text-sm text-gray-500">
                  {v.departmentName}
                </td>
                {/* Actual */}
                <td className="px-3 py-3 text-right font-mono text-sm">
                  {formatCurrencyCompact(v.actualAmount)}
                </td>
                {/* Budget */}
                <td className="px-3 py-3 text-right font-mono text-sm">
                  {formatCurrencyCompact(v.budgetAmount)}
                </td>
                {/* Variance */}
                <td
                  className={`px-3 py-3 text-right font-mono text-sm font-semibold ${getVarianceColorClass(
                    v.direction
                  )}`}
                >
                  {formatVarianceAmount(v.varianceToBudget)}
                </td>
                {/* Var% */}
                <td
                  className={`px-3 py-3 text-right text-sm ${getVarianceColorClass(
                    v.direction
                  )}`}
                >
                  {formatPercentage(v.varianceToBudgetPercentage, true)}
                </td>
                {/* Severity */}
                <td className="px-3 py-3 text-center">
                  <VarianceFlagBadge
                    severity={v.severity}
                    direction={v.direction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
