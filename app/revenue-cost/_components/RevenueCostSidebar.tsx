'use client';

import type {
  FinancialFilters,
  CostCategory,
  AnalysisJobStatus,
} from '@/lib/revenue-cost/revenue-cost.types';
import {
  TIME_PERIOD_OPTIONS,
  COMPARISON_BASE_OPTIONS,
  COST_CATEGORY_CONFIG,
} from '@/lib/revenue-cost/revenue-cost.constants';

interface RevenueCostSidebarProps {
  filters: FinancialFilters;
  departments: { id: string; name: string }[];
  onFilterChange: (filters: Partial<FinancialFilters>) => void;
  onRunAnalysis: () => void;
  onExportReport: () => void;
  analysisJobStatus: AnalysisJobStatus;
}

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

export default function RevenueCostSidebar({
  filters,
  departments,
  onFilterChange,
  onRunAnalysis,
  onExportReport,
  analysisJobStatus,
}: RevenueCostSidebarProps) {
  const costCategories = Object.keys(COST_CATEGORY_CONFIG) as CostCategory[];

  const isAnalysisBusy =
    analysisJobStatus === 'queued' || analysisJobStatus === 'processing';

  function toggleDepartment(id: string) {
    const next = filters.departmentIds.includes(id)
      ? filters.departmentIds.filter((d) => d !== id)
      : [...filters.departmentIds, id];
    onFilterChange({ departmentIds: next });
  }

  function toggleCostCategory(category: CostCategory) {
    const next = filters.costCategories.includes(category)
      ? filters.costCategories.filter((c) => c !== category)
      : [...filters.costCategories, category];
    onFilterChange({ costCategories: next });
  }

  return (
    <aside className="w-64 flex-shrink-0 space-y-6 border-r border-gray-200 bg-white p-4">
      <h2 className="font-headline text-lg font-semibold text-on-surface">Filters</h2>

      {/* Time Period */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Time Period
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {TIME_PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ timePeriod: opt.value })}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                filters.timePeriod === opt.value
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-on-surface hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Comparison Base */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Comparison Base
        </legend>
        {COMPARISON_BASE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm text-on-surface"
          >
            <input
              type="radio"
              name="comparisonBase"
              checked={filters.comparisonBase === opt.value}
              onChange={() => onFilterChange({ comparisonBase: opt.value })}
              className="h-4 w-4 border-gray-300 text-secondary focus:ring-secondary"
            />
            {opt.label}
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

      {/* Cost Category filter */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Cost Category
        </legend>
        {costCategories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2 text-sm text-on-surface"
          >
            <input
              type="checkbox"
              checked={filters.costCategories.includes(cat)}
              onChange={() => toggleCostCategory(cat)}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            {COST_CATEGORY_CONFIG[cat].label}
          </label>
        ))}
      </fieldset>

      {/* Variance Threshold slider */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">
          Variance Threshold
        </legend>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={filters.varianceThreshold}
            onChange={(e) =>
              onFilterChange({ varianceThreshold: Number(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-teal"
          />
          <span className="min-w-[3ch] text-right text-sm font-medium text-on-surface">
            {filters.varianceThreshold}%
          </span>
        </div>
      </fieldset>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onRunAnalysis}
          disabled={isAnalysisBusy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalysisBusy && <Spinner />}
          Run Analysis
        </button>

        <button
          onClick={onExportReport}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-secondary px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5"
        >
          Export Report
        </button>
      </div>
    </aside>
  );
}
