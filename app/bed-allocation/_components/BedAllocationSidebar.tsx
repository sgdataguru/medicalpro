'use client';

import type {
  BedAllocationFilters,
  DepartmentOccupancy,
  ForecastJobStatus,
  TimePeriod,
} from '@/lib/bed-allocation/bed-allocation.types';
import { TIME_PERIOD_OPTIONS } from '@/lib/bed-allocation/bed-allocation.constants';

interface BedAllocationSidebarProps {
  filters: BedAllocationFilters;
  departments: DepartmentOccupancy[];
  onFilterChange: (filters: BedAllocationFilters) => void;
  onRunForecast: () => void;
  forecastJobStatus: ForecastJobStatus;
}

export default function BedAllocationSidebar({
  filters,
  departments,
  onFilterChange,
  onRunForecast,
  forecastJobStatus,
}: BedAllocationSidebarProps) {
  const isForecastRunning =
    forecastJobStatus === 'queued' || forecastJobStatus === 'processing';

  function handleDepartmentToggle(departmentId: string) {
    const current = filters.departmentIds;
    const next = current.includes(departmentId)
      ? current.filter((id) => id !== departmentId)
      : [...current, departmentId];
    onFilterChange({ ...filters, departmentIds: next });
  }

  function handleTimePeriodChange(value: TimePeriod) {
    onFilterChange({ ...filters, timePeriod: value });
  }

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        {/* ---- Filters heading ---- */}
        <h2 className="font-headline text-lg font-semibold text-on-surface lg:sr-only">Filters</h2>

        {/* ---- Department multi-select ---- */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-on-surface-variant">
            Departments
          </legend>

          <div className="mt-1 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1 lg:max-h-none">
            {departments.map((dept) => {
              const checked = filters.departmentIds.includes(dept.departmentId);
              return (
                <label
                  key={dept.departmentId}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-on-surface transition-colors hover:bg-surface-container"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleDepartmentToggle(dept.departmentId)}
                    className="h-4 w-4 rounded border-outline-variant text-secondary accent-secondary focus:ring-secondary"
                  />
                  <span className="truncate">{dept.departmentName}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ---- Time Period selector ---- */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-on-surface-variant">
            Time Period
          </legend>

          <div className="mt-1 flex gap-2">
            {TIME_PERIOD_OPTIONS.map((opt) => {
              const isActive = filters.timePeriod === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTimePeriodChange(opt.value)}
                  className={[
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                    isActive
                      ? 'bg-secondary text-on-secondary'
                      : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ---- Run Forecast button ---- */}
        <button
          type="button"
          onClick={onRunForecast}
          disabled={isForecastRunning}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-semibold text-on-secondary transition-colors hover:bg-secondary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-70 lg:ml-auto lg:self-end"
        >
          {isForecastRunning ? (
            <>
              {/* Spinner */}
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                  d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Forecasting...
            </>
          ) : (
            <>
              {/* Play arrow icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
              </svg>
              Run Forecast
            </>
          )}
        </button>
      </div>
    </div>
  );
}
