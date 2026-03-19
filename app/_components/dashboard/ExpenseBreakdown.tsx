'use client';

import { ExpenseItem } from '@/lib/dashboard/dashboard.types';

interface ExpenseBreakdownProps {
  items: ExpenseItem[];
}

export default function ExpenseBreakdown({ items }: ExpenseBreakdownProps) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      {/* Header */}
      <h3 className="font-headline font-extrabold text-lg mb-6">
        Expense Breakdown
      </h3>

      {/* List */}
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-base">
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface uppercase tracking-tight">
                  {item.category}
                </p>
                <p className="text-[10px] text-on-primary-container">
                  {item.subCategory}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="text-right">
              <p className="text-sm font-headline font-extrabold text-on-surface">
                {item.amount}
              </p>
              {item.change.direction === 'up' && (
                <div className="flex items-center justify-end gap-0.5 text-error">
                  <span className="material-symbols-outlined text-xs">
                    arrow_upward
                  </span>
                  <span className="text-[10px]">{item.change.value}</span>
                </div>
              )}
              {item.change.direction === 'down' && (
                <div className="flex items-center justify-end gap-0.5 text-on-tertiary-container">
                  <span className="material-symbols-outlined text-xs">
                    arrow_downward
                  </span>
                  <span className="text-[10px]">{item.change.value}</span>
                </div>
              )}
              {item.change.direction === 'stable' && (
                <span className="text-[10px] text-on-primary-container font-bold">
                  Stable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-outline-variant/10">
        <button className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline">
          View All Ledger Details
        </button>
      </div>
    </div>
  );
}
