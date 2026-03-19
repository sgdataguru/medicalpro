'use client';

import { useMemo } from 'react';
import type { ComparisonEntry, HospitalModule } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG } from '@/lib/simulation/simulation.constants';
import {
  formatImpactDelta,
  formatPercentage,
} from '@/lib/simulation/simulation.utils';
import RiskLevelBadge from './RiskLevelBadge';

interface BeforeAfterComparisonTableProps {
  entries: ComparisonEntry[];
}

export default function BeforeAfterComparisonTable({
  entries,
}: BeforeAfterComparisonTableProps) {
  // Group entries by module, preserving order of first appearance
  const groupedEntries = useMemo(() => {
    const groups: { module: HospitalModule; entries: ComparisonEntry[] }[] = [];
    const moduleMap = new Map<HospitalModule, ComparisonEntry[]>();

    for (const entry of entries) {
      if (!moduleMap.has(entry.module)) {
        const group: ComparisonEntry[] = [];
        moduleMap.set(entry.module, group);
        groups.push({ module: entry.module, entries: group });
      }
      moduleMap.get(entry.module)!.push(entry);
    }

    return groups;
  }, [entries]);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[22px] text-on-surface">
          compare_arrows
        </span>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Before &amp; After Comparison
        </h3>
      </div>

      {/* Table container */}
      <div className="bg-surface-container rounded-xl ring-1 ring-outline-variant/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant font-medium text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Module</th>
                <th className="text-left px-4 py-3">Metric</th>
                <th className="text-right px-4 py-3">Current</th>
                <th className="text-right px-4 py-3">Projected</th>
                <th className="text-right px-4 py-3">Delta</th>
                <th className="text-right px-4 py-3">Change %</th>
                <th className="text-left px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {groupedEntries.map((group) => {
                const moduleConfig = MODULE_CONFIG[group.module];

                return group.entries.map((entry, entryIdx) => {
                  const isEven = entryIdx % 2 === 0;
                  const deltaColor =
                    entry.delta > 0
                      ? 'text-green-600'
                      : entry.delta < 0
                        ? 'text-red-600'
                        : 'text-on-surface-variant';
                  const changeColor =
                    entry.deltaPercentage > 0
                      ? 'text-green-600'
                      : entry.deltaPercentage < 0
                        ? 'text-red-600'
                        : 'text-on-surface-variant';

                  return (
                    <tr
                      key={`${entry.module}-${entry.metric}-${entryIdx}`}
                      className={isEven ? 'bg-surface' : 'bg-surface-container-low'}
                    >
                      {/* Module cell: show label only on first row of group */}
                      <td className="px-4 py-3 text-on-surface">
                        {entryIdx === 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px]"
                              style={{ color: moduleConfig.color }}
                            >
                              {moduleConfig.icon}
                            </span>
                            <span className="font-medium">
                              {moduleConfig.label}
                            </span>
                          </span>
                        ) : null}
                      </td>

                      {/* Metric */}
                      <td className="px-4 py-3 text-on-surface">
                        {entry.metric}
                      </td>

                      {/* Current value */}
                      <td className="px-4 py-3 text-right text-on-surface tabular-nums">
                        {entry.currentValue.toLocaleString()}
                      </td>

                      {/* Projected value */}
                      <td className="px-4 py-3 text-right text-on-surface font-medium tabular-nums">
                        {entry.projectedValue.toLocaleString()}
                      </td>

                      {/* Delta */}
                      <td
                        className={`px-4 py-3 text-right font-medium tabular-nums ${deltaColor}`}
                      >
                        {formatImpactDelta(entry.delta, entry.unit)}
                      </td>

                      {/* Change % */}
                      <td
                        className={`px-4 py-3 text-right font-medium tabular-nums ${changeColor}`}
                      >
                        {entry.deltaPercentage > 0 ? '+' : ''}
                        {formatPercentage(entry.deltaPercentage)}
                      </td>

                      {/* Risk */}
                      <td className="px-4 py-3">
                        <RiskLevelBadge risk={entry.risk} />
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
