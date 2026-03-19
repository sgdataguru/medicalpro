'use client';

import { useState, useEffect } from 'react';
import type { AnomalyFilterState, HospitalModule, AnomalySeverity, AnomalyStatus } from '@/lib/anomaly/anomaly.types';
import { MODULE_CONFIG, STATUS_CONFIG, SEVERITY_CONFIG } from '@/lib/anomaly/anomaly.constants';

interface AnomalyFilterBarProps {
  filters: AnomalyFilterState;
  onChange: (filters: Partial<AnomalyFilterState>) => void;
  activeFilterCount: number;
}

export default function AnomalyFilterBar({ filters, onChange, activeFilterCount }: AnomalyFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onChange({ searchQuery: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.searchQuery, onChange]);

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({ modules: value ? [value as HospitalModule] : [] });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({ severities: value ? [value as AnomalySeverity] : [] });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({ statuses: value ? [value as AnomalyStatus] : ['active', 'acknowledged', 'investigating'] });
  };

  const handleReset = () => {
    setLocalSearch('');
    onChange({
      modules: [],
      severities: [],
      statuses: ['active', 'acknowledged', 'investigating'],
      searchQuery: '',
      dateRange: { start: '', end: '' },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/15">
      <select
        value={filters.modules[0] ?? ''}
        onChange={handleModuleChange}
        className="bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
      >
        <option value="">All Modules</option>
        {Object.entries(MODULE_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>

      <select
        value={filters.severities[0] ?? ''}
        onChange={handleSeverityChange}
        className="bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
      >
        <option value="">All Severities</option>
        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>

      <select
        value={filters.statuses.length === 1 ? filters.statuses[0] : ''}
        onChange={handleStatusChange}
        className="bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
      >
        <option value="">Active (default)</option>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>

      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search anomalies..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 placeholder-on-primary-container focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
        />
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={handleReset}
          className="text-xs text-on-surface-variant hover:text-secondary-container transition-colors"
        >
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
