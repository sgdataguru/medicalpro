'use client';

import type { InventoryItem, InventorySortField, SupplyCategory } from '@/lib/supply-chain/supply-chain.types';
import { CATEGORY_LABELS } from '@/lib/supply-chain/supply-chain.constants';
import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';
import InventoryStatusBadge from './InventoryStatusBadge';
import TableSearch from './TableSearch';

// ---------------------------------------------------------------------------
// Category badge color mapping
// ---------------------------------------------------------------------------

const CATEGORY_BADGE_COLORS: Record<SupplyCategory, string> = {
  DISPOSABLES: 'bg-gray-100 text-gray-700',
  MEDICATIONS: 'bg-violet-50 text-violet-700',
  PPE: 'bg-teal-50 text-teal-700',
  IMAGING: 'bg-sky-50 text-sky-700',
  SURGICAL: 'bg-rose-50 text-rose-700',
  LAB: 'bg-indigo-50 text-indigo-700',
  EQUIPMENT: 'bg-orange-50 text-orange-700',
  NUTRITIONAL: 'bg-lime-50 text-lime-700',
};

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

interface Column {
  label: string;
  field: InventorySortField | null;
}

const COLUMNS: Column[] = [
  { label: 'Item', field: 'name' },
  { label: 'Category', field: 'category' },
  { label: 'Department', field: null },
  { label: 'Qty', field: 'quantity' },
  { label: 'Rate', field: 'consumptionRate' },
  { label: 'Days to Stockout', field: 'daysToStockout' },
  { label: 'Value', field: 'value' },
  { label: 'Status', field: 'status' },
];

// ---------------------------------------------------------------------------
// Sort arrow component
// ---------------------------------------------------------------------------

function SortArrow({
  field,
  activeField,
  direction,
}: {
  field: InventorySortField;
  activeField: InventorySortField;
  direction: 'asc' | 'desc';
}) {
  if (field !== activeField) {
    return (
      <svg className="ml-1 inline h-3 w-3 text-gray-300" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 1l3 4H3zM6 11l-3-4h6z" />
      </svg>
    );
  }

  return (
    <svg className="ml-1 inline h-3 w-3 text-secondary-container" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      {direction === 'asc' ? <path d="M6 2l4 5H2z" /> : <path d="M6 10l-4-5h8z" />}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Days-to-stockout color helper
// ---------------------------------------------------------------------------

function daysToStockoutColor(days: number): string {
  if (days < 3) return 'text-red-600 font-semibold';
  if (days < 7) return 'text-amber-600 font-medium';
  return 'text-on-surface';
}

// ---------------------------------------------------------------------------
// InventoryTable component
// ---------------------------------------------------------------------------

interface InventoryTableProps {
  items: InventoryItem[];
  onItemClick: (itemId: string) => void;
  sortBy: InventorySortField;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: InventorySortField) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InventoryTable({
  items,
  onItemClick,
  sortBy,
  sortDirection,
  onSortChange,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
}: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      {/* Search bar */}
      <div className="border-b border-gray-100 p-4">
        <TableSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search items by name or code..."
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    col.field ? 'cursor-pointer select-none hover:text-on-surface' : ''
                  }`}
                  onClick={col.field ? () => onSortChange(col.field!) : undefined}
                >
                  {col.label}
                  {col.field && (
                    <SortArrow field={col.field} activeField={sortBy} direction={sortDirection} />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-gray-400">
                  <p className="font-headline text-lg font-medium text-gray-500">
                    No inventory items found
                  </p>
                  <p className="mt-1 text-sm">
                    Try adjusting your search or filter criteria.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.itemId}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => onItemClick(item.itemId)}
                >
                  {/* Item name + code */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-on-surface">{item.itemName}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.itemCode}</span>
                  </td>

                  {/* Category badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_BADGE_COLORS[item.category]
                      }`}
                    >
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3 text-gray-600">{item.departmentName}</td>

                  {/* Quantity */}
                  <td className="px-4 py-3 font-mono text-on-surface">{item.currentQuantity.toLocaleString()}</td>

                  {/* Daily consumption rate */}
                  <td className="px-4 py-3 text-gray-600">
                    {item.dailyConsumptionRate.toFixed(1)}/day
                  </td>

                  {/* Days to stockout */}
                  <td className={`px-4 py-3 ${daysToStockoutColor(item.daysToStockout)}`}>
                    {item.daysToStockout === Infinity
                      ? 'N/A'
                      : `${Math.round(item.daysToStockout)} days`}
                  </td>

                  {/* Value */}
                  <td className="px-4 py-3 text-gray-600">{formatInventoryValue(item.totalValue)}</td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <InventoryStatusBadge riskLevel={item.riskLevel} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page <span className="font-medium text-on-surface">{currentPage}</span> of{' '}
            <span className="font-medium text-on-surface">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
