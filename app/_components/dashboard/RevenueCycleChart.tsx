'use client';

import { RevenueCycleMonth } from '@/lib/dashboard/dashboard.types';

interface RevenueCycleChartProps {
  data: RevenueCycleMonth[];
}

const MAX_BAR_PX = 220;

export default function RevenueCycleChart({ data }: RevenueCycleChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.billings, d.collections]));

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-headline font-extrabold text-lg">
            Revenue Cycle Performance
          </h3>
          <p className="text-xs text-on-primary-container">
            Billings vs Collections (Last 6 Months)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <span className="text-[10px] font-bold text-on-surface-variant">
              Billings
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high" />
            <span className="text-[10px] font-bold text-on-surface-variant">
              Collections
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 flex items-end justify-between gap-4 px-2">
        {data.map((month, index) => {
          const billingsH = Math.round((month.billings / maxValue) * MAX_BAR_PX);
          const collectionsH = Math.round((month.collections / maxValue) * MAX_BAR_PX);
          const isLastMonth = index === data.length - 1;

          return (
            <div key={month.month} className="relative group flex-1">
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                Leakage: {month.leakagePercent}%
              </div>

              <div className="flex items-end gap-1 justify-center">
                {/* Billings bar (blue) */}
                <div
                  className="flex-1 bg-secondary rounded-t-sm max-w-8"
                  style={{ height: `${billingsH}px` }}
                />
                {/* Collections bar (lighter) */}
                <div
                  className="flex-1 bg-surface-container-high rounded-t-sm max-w-8"
                  style={{ height: `${collectionsH}px` }}
                />
              </div>

              {/* Month label */}
              <p className="text-[10px] font-bold mt-2 text-on-primary-container text-center">
                {month.month}
              </p>

              {/* Leakage warning badge for the last month */}
              {isLastMonth && (
                <div className="absolute bottom-20 -right-2 p-2.5 bg-error/10 backdrop-blur text-error text-[10px] font-bold rounded-lg border border-error/20 flex items-center gap-1.5 whitespace-nowrap z-10">
                  <span className="material-symbols-outlined text-xs">
                    warning
                  </span>
                  Leakage Spike +6%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
