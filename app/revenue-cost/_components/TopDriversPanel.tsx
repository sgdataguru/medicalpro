'use client';

import type {
  FinancialDriverAnalysis,
  FinancialDriver,
} from '@/lib/revenue-cost/revenue-cost.types';
import { formatCurrencyCompact } from '@/lib/revenue-cost/revenue-cost.utils';

interface TopDriversPanelProps {
  drivers: FinancialDriverAnalysis | null;
  onDriverClick?: (driverId: string) => void;
}

function DriverItem({
  driver,
  accentColor,
  onClick,
}: {
  driver: FinancialDriver;
  accentColor: 'green' | 'red';
  onClick?: () => void;
}) {
  const impactColorClass =
    accentColor === 'green' ? 'text-emerald-600' : 'text-red-600';

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
    >
      {/* Rank */}
      <span className="font-headline text-lg font-bold text-gray-300 leading-none mt-0.5">
        {driver.rank}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-on-surface text-sm truncate">
              {driver.name}
            </p>
            {driver.departmentName && (
              <p className="text-xs text-gray-400 truncate">
                {driver.departmentName}
              </p>
            )}
          </div>
          <span className={`shrink-0 font-mono text-sm font-semibold ${impactColorClass}`}>
            {formatCurrencyCompact(driver.impactAmount)}
          </span>
        </div>

        {/* Description */}
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {driver.description}
        </p>

        {/* Confidence badge */}
        <div className="mt-1.5">
          <span
            className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600"
            style={{ opacity: 0.4 + driver.confidence * 0.6 }}
          >
            {Math.round(driver.confidence * 100)}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TopDriversPanel({
  drivers,
  onDriverClick,
}: TopDriversPanelProps) {
  if (!drivers) {
    return (
      <div className="rounded-xl shadow-md p-6 bg-white">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Top Drivers
        </h3>
        <p className="mt-4 text-sm text-gray-400 italic">
          Run analysis to discover top drivers
        </p>
      </div>
    );
  }

  const topRevenue = drivers.revenueDrivers.slice(0, 5);
  const topCost = drivers.costDrivers.slice(0, 5);

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
        Top Drivers
      </h3>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Drivers */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Revenue Drivers
          </h4>
          <div className="space-y-1">
            {topRevenue.map((driver) => (
              <DriverItem
                key={driver.driverId}
                driver={driver}
                accentColor="green"
                onClick={
                  onDriverClick
                    ? () => onDriverClick(driver.driverId)
                    : undefined
                }
              />
            ))}
            {topRevenue.length === 0 && (
              <p className="text-xs text-gray-400 py-2">
                No revenue drivers found
              </p>
            )}
          </div>
        </div>

        {/* Cost Drivers */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            Cost Drivers
          </h4>
          <div className="space-y-1">
            {topCost.map((driver) => (
              <DriverItem
                key={driver.driverId}
                driver={driver}
                accentColor="red"
                onClick={
                  onDriverClick
                    ? () => onDriverClick(driver.driverId)
                    : undefined
                }
              />
            ))}
            {topCost.length === 0 && (
              <p className="text-xs text-gray-400 py-2">
                No cost drivers found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
