'use client';

import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';

interface InventoryHealthCardProps {
  totalItems: number;
  totalValue: number;
  inventoryTurnover: number;
}

export default function InventoryHealthCard({
  totalItems,
  totalValue,
  inventoryTurnover,
}: InventoryHealthCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-secondary" />
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Inventory Health
        </h3>
      </div>

      {/* Primary metric */}
      <p className="text-3xl font-bold text-on-surface">
        {totalItems.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-gray-500">Items tracked</p>

      {/* Sub-metrics */}
      <div className="mt-4 flex items-start gap-6 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Total Value
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {formatInventoryValue(totalValue)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Turnover
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {inventoryTurnover.toFixed(1)}x/yr
          </p>
        </div>
      </div>
    </div>
  );
}
