'use client';

interface StockoutRiskCardProps {
  criticalCount: number;
  warningCount: number;
  avgDaysToStockout: number;
}

export default function StockoutRiskCard({
  criticalCount,
  warningCount,
  avgDaysToStockout,
}: StockoutRiskCardProps) {
  const totalAtRisk = criticalCount + warningCount;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-warning"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Stockout Risk
        </h3>
      </div>

      {/* Primary metric */}
      <p className="text-3xl font-bold text-error">{totalAtRisk}</p>
      <p className="mt-1 text-sm text-gray-500">Items at risk</p>

      {/* Sub-metrics */}
      <div className="mt-4 flex items-start gap-6 border-t border-gray-100 pt-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" />
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Critical
            </p>
          </div>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {criticalCount}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Avg days to stockout
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {avgDaysToStockout.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
