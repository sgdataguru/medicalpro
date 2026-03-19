'use client';

import type { ScenarioSummary } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG, SCENARIO_STATUS_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/simulation/simulation.constants';

interface ScenarioLibraryCardProps {
  scenario: ScenarioSummary;
  onSelect: () => void;
  onDelete: () => void;
}

export default function ScenarioLibraryCard({
  scenario,
  onSelect,
  onDelete,
}: ScenarioLibraryCardProps) {
  return (
    <div className="group flex flex-col rounded-xl bg-surface-container p-5 ring-1 ring-outline-variant/15 transition-shadow hover:shadow-md">
      {/* Status + Risk badges */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SCENARIO_STATUS_CONFIG[scenario.status].bgClass}`}
        >
          {SCENARIO_STATUS_CONFIG[scenario.status].label}
        </span>
        {scenario.overallRisk && scenario.overallRisk !== 'none' && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_CONFIG[scenario.overallRisk].bgClass}`}
          >
            <span className="material-symbols-outlined text-[12px]">
              {RISK_LEVEL_CONFIG[scenario.overallRisk].icon}
            </span>
            {RISK_LEVEL_CONFIG[scenario.overallRisk].label}
          </span>
        )}
      </div>

      {/* Name + Description */}
      <button onClick={onSelect} className="text-left">
        <h3 className="mb-1 text-sm font-semibold text-on-surface transition-colors group-hover:text-secondary">
          {scenario.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
          {scenario.description}
        </p>
      </button>

      {/* Module chips */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {scenario.modules.map((mod) => (
          <span
            key={mod}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${MODULE_CONFIG[mod].bgClass}`}
          >
            <span className="material-symbols-outlined text-[12px]">
              {MODULE_CONFIG[mod].icon}
            </span>
            {MODULE_CONFIG[mod].label}
          </span>
        ))}
      </div>

      {/* Tags */}
      {scenario.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {scenario.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: metadata + actions */}
      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-3">
        <div className="text-[10px] text-on-surface-variant/60">
          {scenario.variableCount} variable{scenario.variableCount !== 1 ? 's' : ''} &middot;{' '}
          {scenario.createdBy}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onSelect}
            className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-secondary"
            title="Open"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-md p-1 text-on-surface-variant hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
