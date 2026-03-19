'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import type {
  RecommendationFilterState,
  PriorityLevel,
  HospitalModule,
  RecommendationStatus,
  RecommendationSortField,
} from '@/lib/recommendations/recommendations.types';
import {
  PRIORITY_CONFIG,
  MODULE_CONFIG,
  STATUS_CONFIG,
} from '@/lib/recommendations/recommendations.constants';

interface RecommendationFiltersProps {
  filters: RecommendationFilterState;
  onChange: (partial: Partial<RecommendationFilterState>) => void;
  activeFilterCount: number;
  onClear: () => void;
}

/** Generic multi-select dropdown for checkbox lists */
function MultiSelectDropdown<T extends string>({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const toggle = (value: T) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          selected.length > 0
            ? 'border-secondary/40 bg-secondary/5 text-secondary'
            : 'border-outline-variant/30 bg-surface text-on-surface-variant hover:border-outline-variant/50'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
        {selected.length > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-secondary text-[9px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <span className="material-symbols-outlined text-[16px]">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 min-w-[180px] rounded-xl border border-outline-variant/15 bg-surface shadow-lg py-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface hover:bg-surface-container-high/30 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 rounded border-outline-variant/40 text-secondary focus:ring-secondary/30"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS: { value: RecommendationSortField; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'date', label: 'Date' },
  { value: 'module', label: 'Module' },
  { value: 'confidence', label: 'Confidence' },
];

export default function RecommendationFilters({
  filters,
  onChange,
  activeFilterCount,
  onClear,
}: RecommendationFiltersProps) {
  const priorityOptions = (
    Object.entries(PRIORITY_CONFIG) as [PriorityLevel, (typeof PRIORITY_CONFIG)[PriorityLevel]][]
  ).map(([value, cfg]) => ({ value, label: cfg.label }));

  const moduleOptions = (
    Object.entries(MODULE_CONFIG) as [HospitalModule, (typeof MODULE_CONFIG)[HospitalModule]][]
  ).map(([value, cfg]) => ({ value, label: cfg.label }));

  const statusOptions = (
    Object.entries(STATUS_CONFIG) as [RecommendationStatus, (typeof STATUS_CONFIG)[RecommendationStatus]][]
  ).map(([value, cfg]) => ({ value, label: cfg.label }));

  return (
    <div className="flex items-center gap-3 flex-wrap rounded-xl border border-outline-variant/15 bg-surface px-4 py-3">
      {/* Filter icon */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
        <span className="material-symbols-outlined text-[18px]">
          filter_list
        </span>
        Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-secondary text-[9px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-outline-variant/20" />

      {/* Priority multi-select */}
      <MultiSelectDropdown<PriorityLevel>
        label="Priority"
        icon="flag"
        options={priorityOptions}
        selected={filters.priority}
        onChange={(next) => onChange({ priority: next })}
      />

      {/* Module multi-select */}
      <MultiSelectDropdown<HospitalModule>
        label="Module"
        icon="widgets"
        options={moduleOptions}
        selected={filters.modules}
        onChange={(next) => onChange({ modules: next })}
      />

      {/* Status multi-select */}
      <MultiSelectDropdown<RecommendationStatus>
        label="Status"
        icon="toggle_on"
        options={statusOptions}
        selected={filters.status}
        onChange={(next) => onChange({ status: next })}
      />

      {/* Sort by */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          sort
        </span>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ sortBy: e.target.value as RecommendationSortField })
          }
          className="appearance-none rounded-lg border border-outline-variant/30 bg-surface px-2 py-1.5 text-xs text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort order toggle */}
        <button
          type="button"
          onClick={() =>
            onChange({
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
            })
          }
          className="flex items-center justify-center h-7 w-7 rounded-lg border border-outline-variant/30 bg-surface text-on-surface-variant hover:bg-surface-container-high/30 transition-colors"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {filters.sortOrder === 'asc'
              ? 'arrow_upward'
              : 'arrow_downward'}
          </span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
          Clear filters
        </button>
      )}
    </div>
  );
}
