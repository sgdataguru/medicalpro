'use client';

import type {
  SupplyCategory,
  SupplyChainFilters,
  RiskLevel,
  ForecastJobStatus,
  OptimizationJobStatus,
} from '@/lib/supply-chain/supply-chain.types';
import {
  CATEGORY_LABELS,
  RISK_LEVEL_CONFIG,
} from '@/lib/supply-chain/supply-chain.constants';

interface SupplyChainSidebarProps {
  filters: SupplyChainFilters;
  departments: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  onFilterChange: (filters: SupplyChainFilters) => void;
  onRunForecast: () => void;
  onOptimizeOrders: () => void;
  forecastJobStatus: ForecastJobStatus;
  optimizationJobStatus: OptimizationJobStatus;
}

const RISK_DOT_COLORS: Record<RiskLevel, string> = {
  CRITICAL: 'bg-red-600',
  WARNING: 'bg-amber-500',
  HEALTHY: 'bg-emerald-500',
  OVERSTOCK: 'bg-blue-500',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function SupplyChainSidebar({
  filters,
  departments,
  suppliers,
  onFilterChange,
  onRunForecast,
  onOptimizeOrders,
  forecastJobStatus,
  optimizationJobStatus,
}: SupplyChainSidebarProps) {
  const categories = Object.keys(CATEGORY_LABELS) as SupplyCategory[];
  const riskLevels = Object.keys(RISK_LEVEL_CONFIG) as RiskLevel[];

  function toggleCategory(category: SupplyCategory) {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: next });
  }

  function toggleDepartment(id: string) {
    const next = filters.departmentIds.includes(id)
      ? filters.departmentIds.filter((d) => d !== id)
      : [...filters.departmentIds, id];
    onFilterChange({ ...filters, departmentIds: next });
  }

  function toggleSupplier(id: string) {
    const next = filters.supplierIds.includes(id)
      ? filters.supplierIds.filter((s) => s !== id)
      : [...filters.supplierIds, id];
    onFilterChange({ ...filters, supplierIds: next });
  }

  function toggleRiskLevel(level: RiskLevel) {
    const next = filters.riskLevels.includes(level)
      ? filters.riskLevels.filter((r) => r !== level)
      : [...filters.riskLevels, level];
    onFilterChange({ ...filters, riskLevels: next });
  }

  const isForecastBusy =
    forecastJobStatus === 'queued' || forecastJobStatus === 'processing';
  const isOptimizationBusy =
    optimizationJobStatus === 'queued' || optimizationJobStatus === 'processing';

  return (
    <aside className="w-64 flex-shrink-0 space-y-6 border-r border-gray-200 bg-white p-4">
      <h2 className="font-headline text-lg font-semibold text-on-surface">Filters</h2>

      {/* Category filter */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Category</legend>
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={filters.categories.includes(cat)}
              onChange={() => toggleCategory(cat)}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            {CATEGORY_LABELS[cat]}
          </label>
        ))}
      </fieldset>

      {/* Department filter */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Department
        </legend>
        {departments.map((dept) => (
          <label
            key={dept.id}
            className="flex items-center gap-2 text-sm text-on-surface"
          >
            <input
              type="checkbox"
              checked={filters.departmentIds.includes(dept.id)}
              onChange={() => toggleDepartment(dept.id)}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            {dept.name}
          </label>
        ))}
      </fieldset>

      {/* Supplier filter */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Supplier</legend>
        {suppliers.map((sup) => (
          <label
            key={sup.id}
            className="flex items-center gap-2 text-sm text-on-surface"
          >
            <input
              type="checkbox"
              checked={filters.supplierIds.includes(sup.id)}
              onChange={() => toggleSupplier(sup.id)}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            {sup.name}
          </label>
        ))}
      </fieldset>

      {/* Risk Level filter */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Risk Level
        </legend>
        {riskLevels.map((level) => (
          <label
            key={level}
            className="flex items-center gap-2 text-sm text-on-surface"
          >
            <input
              type="checkbox"
              checked={filters.riskLevels.includes(level)}
              onChange={() => toggleRiskLevel(level)}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${RISK_DOT_COLORS[level]}`}
            />
            {RISK_LEVEL_CONFIG[level].label}
          </label>
        ))}
      </fieldset>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onRunForecast}
          disabled={isForecastBusy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isForecastBusy && <Spinner />}
          Run Forecast
        </button>

        <button
          onClick={onOptimizeOrders}
          disabled={isOptimizationBusy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-secondary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isOptimizationBusy && <Spinner />}
          Optimize Orders
        </button>
      </div>
    </aside>
  );
}
