'use client';

import type { ModuleImpact } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG } from '@/lib/simulation/simulation.constants';
import { formatImpactDelta } from '@/lib/simulation/simulation.utils';
import RiskLevelBadge from './RiskLevelBadge';

interface ImpactSummaryCardsProps {
  impacts: ModuleImpact[];
}

export default function ImpactSummaryCards({
  impacts,
}: ImpactSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {impacts.map((impact) => {
        const moduleConfig = MODULE_CONFIG[impact.module];
        const keyMetric = impact.metrics[0];

        return (
          <div
            key={impact.module}
            className="bg-surface-container rounded-xl p-5 ring-1 ring-outline-variant/15"
          >
            {/* Header: module icon + label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: moduleConfig.color }}
              >
                {moduleConfig.icon}
              </span>
              <span className="font-body text-sm font-medium text-on-surface">
                {moduleConfig.label}
              </span>
            </div>

            {/* Key metric */}
            {keyMetric && (
              <div className="mb-3">
                <p className="font-body text-xs text-on-surface-variant mb-1">
                  {keyMetric.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-on-surface">
                    {keyMetric.projectedValue.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      keyMetric.direction === 'positive'
                        ? 'text-green-600'
                        : keyMetric.direction === 'negative'
                          ? 'text-red-600'
                          : 'text-on-surface-variant'
                    }`}
                  >
                    {formatImpactDelta(keyMetric.delta, keyMetric.unit)}
                  </span>
                </div>
              </div>
            )}

            {/* Risk badge */}
            <div className="mb-3">
              <RiskLevelBadge risk={impact.overallRisk} />
            </div>

            {/* Summary */}
            <p className="font-body text-xs text-on-surface-variant line-clamp-2">
              {impact.summary}
            </p>
          </div>
        );
      })}
    </div>
  );
}
