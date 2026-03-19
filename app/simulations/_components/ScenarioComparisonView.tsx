'use client';

import { useMemo } from 'react';
import type { Scenario, ScenarioSummary } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/simulation/simulation.constants';
import { formatImpactDelta, formatPercentage } from '@/lib/simulation/simulation.utils';
import RiskLevelBadge from './RiskLevelBadge';

interface ScenarioComparisonViewProps {
  scenarios: Scenario[];
  allScenarios: ScenarioSummary[];
  onAddScenario: (id: string) => void;
  onRemoveScenario: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
}

export default function ScenarioComparisonView({
  scenarios,
  allScenarios,
  onAddScenario,
  onRemoveScenario,
  onClear,
  onBack,
}: ScenarioComparisonViewProps) {
  const completedScenarios = useMemo(
    () => allScenarios.filter((s) => s.status === 'completed' && !scenarios.some((cs) => cs.id === s.id)),
    [allScenarios, scenarios],
  );

  // Collect all unique metrics across scenarios
  const allMetrics = useMemo(() => {
    const metricSet = new Map<string, { module: string; metric: string; unit: string }>();
    for (const s of scenarios) {
      if (!s.results) continue;
      for (const entry of s.results.beforeAfterComparison) {
        const key = `${entry.module}::${entry.metric}`;
        if (!metricSet.has(key)) {
          metricSet.set(key, { module: entry.module, metric: entry.metric, unit: entry.unit });
        }
      }
    }
    return Array.from(metricSet.values());
  }, [scenarios]);

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="flex flex-wrap items-center gap-3">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary"
          >
            {s.name}
            <button
              onClick={() => onRemoveScenario(s.id)}
              className="rounded-full p-0.5 hover:bg-secondary/20"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}

        {/* Add scenario dropdown */}
        {completedScenarios.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onAddScenario(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-sm text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary/30"
          >
            <option value="" disabled>
              + Add scenario...
            </option>
            {completedScenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {scenarios.length < 2 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16 ring-1 ring-outline-variant/15">
          <span className="material-symbols-outlined mb-3 text-[48px] text-on-surface-variant/30">
            compare_arrows
          </span>
          <p className="text-sm text-on-surface-variant">
            Add at least 2 completed scenarios to compare
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-container ring-1 ring-outline-variant/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-high">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Module / Metric
                </th>
                {scenarios.map((s) => (
                  <th
                    key={s.id}
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant"
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMetrics.map(({ module, metric, unit }, idx) => {
                const mod = module as import('@/lib/simulation/simulation.types').HospitalModule;
                return (
                  <tr
                    key={`${module}-${metric}`}
                    className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] ${MODULE_CONFIG[mod].bgClass}`}
                        >
                          {MODULE_CONFIG[mod].label}
                        </span>
                        <span className="text-on-surface">{metric}</span>
                      </div>
                    </td>
                    {scenarios.map((s) => {
                      const entry = s.results?.beforeAfterComparison.find(
                        (e) => e.module === module && e.metric === metric,
                      );
                      if (!entry) {
                        return (
                          <td key={s.id} className="px-4 py-2.5 text-right text-on-surface-variant/40">
                            --
                          </td>
                        );
                      }
                      return (
                        <td key={s.id} className="px-4 py-2.5 text-right">
                          <span className="text-on-surface">{entry.projectedValue}</span>
                          <span
                            className={`ml-2 text-xs ${entry.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatImpactDelta(entry.delta, entry.unit)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Overall risk row */}
              <tr className="border-t border-outline-variant/10 bg-surface-container-high">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Overall Risk
                </td>
                {scenarios.map((s) => (
                  <td key={s.id} className="px-4 py-3 text-right">
                    {s.results ? (
                      <RiskLevelBadge risk={s.results.riskAssessment.overallRisk} />
                    ) : (
                      <span className="text-on-surface-variant/40">--</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Library
        </button>
        {scenarios.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">clear_all</span>
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
