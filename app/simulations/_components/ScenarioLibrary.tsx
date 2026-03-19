'use client';

import { useState, useMemo } from 'react';
import type { ScenarioSummary, ScenarioTemplate, LibraryTab } from '@/lib/simulation/simulation.types';
import { filterScenarios } from '@/lib/simulation/simulation.utils';
import ScenarioLibraryCard from './ScenarioLibraryCard';

interface ScenarioLibraryProps {
  scenarios: ScenarioSummary[];
  templates: ScenarioTemplate[];
  libraryTab: LibraryTab;
  librarySearch: string;
  loading: boolean;
  onTabChange: (tab: LibraryTab) => void;
  onSearchChange: (query: string) => void;
  onSelectScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onNewScenario: () => void;
}

const TABS: { key: LibraryTab; label: string; icon: string }[] = [
  { key: 'my_scenarios', label: 'My Scenarios', icon: 'folder' },
  { key: 'shared', label: 'Shared', icon: 'group' },
  { key: 'templates', label: 'Templates', icon: 'description' },
];

export default function ScenarioLibrary({
  scenarios,
  templates,
  libraryTab,
  librarySearch,
  loading,
  onTabChange,
  onSearchChange,
  onSelectScenario,
  onDeleteScenario,
  onNewScenario,
}: ScenarioLibraryProps) {
  const filtered = useMemo(
    () => filterScenarios(scenarios, librarySearch, libraryTab),
    [scenarios, librarySearch, libraryTab],
  );

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              libraryTab === tab.key
                ? 'bg-secondary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant/50">
          search
        </span>
        <input
          type="text"
          value={librarySearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search scenarios..."
          className="w-full rounded-lg bg-surface-container py-2.5 pl-10 pr-4 text-sm text-on-surface ring-1 ring-outline-variant/15 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
        />
      </div>

      {/* Scenario grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scenario) => (
            <ScenarioLibraryCard
              key={scenario.id}
              scenario={scenario}
              onSelect={() => onSelectScenario(scenario.id)}
              onDelete={() => onDeleteScenario(scenario.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16 ring-1 ring-outline-variant/15">
          <span className="material-symbols-outlined mb-3 text-[48px] text-on-surface-variant/30">
            science
          </span>
          <p className="mb-1 text-base font-medium text-on-surface-variant">
            No scenarios found
          </p>
          <p className="mb-4 text-sm text-on-surface-variant/60">
            {librarySearch
              ? 'Try a different search term'
              : 'Create your first what-if scenario'}
          </p>
          {!librarySearch && (
            <button
              onClick={onNewScenario}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Scenario
            </button>
          )}
        </div>
      )}
    </div>
  );
}
