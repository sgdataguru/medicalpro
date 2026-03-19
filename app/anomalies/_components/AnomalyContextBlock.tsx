'use client';

import type { AnomalyContext } from '@/lib/anomaly/anomaly.types';
import { formatFinancialImpact } from '@/lib/anomaly/anomaly.utils';

interface AnomalyContextBlockProps {
  context: AnomalyContext;
}

export default function AnomalyContextBlock({ context }: AnomalyContextBlockProps) {
  return (
    <div className="space-y-4">
      {/* AI Summary */}
      <div>
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          AI Analysis
        </h4>
        <p className="text-sm text-on-surface leading-relaxed">
          {context.summary}
        </p>
      </div>

      {/* Root Cause */}
      <div>
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          Root Cause Hypothesis
        </h4>
        <p className="text-sm text-on-surface-variant leading-relaxed italic">
          {context.rootCauseHypothesis}
        </p>
      </div>

      {/* Recommended Actions */}
      <div>
        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
          Recommended Actions
        </h4>
        <ul className="space-y-1.5">
          {context.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="text-secondary-container mt-0.5 shrink-0">→</span>
              {action}
            </li>
          ))}
        </ul>
      </div>

      {/* Impact Assessment */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-high/30 border border-outline-variant/15">
        {context.impactAssessment.affectedPatients > 0 && (
          <div className="text-center">
            <p className="font-mono text-lg font-bold text-on-surface">
              {context.impactAssessment.affectedPatients}
            </p>
            <p className="text-xs text-on-surface-variant">Patients</p>
          </div>
        )}
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-on-surface">
            {formatFinancialImpact(context.impactAssessment.financialImpact)}
          </p>
          <p className="text-xs text-on-surface-variant">Financial Impact</p>
        </div>
        <div className="text-center">
          <p className={`font-mono text-lg font-bold ${
            context.impactAssessment.operationalRisk === 'high' ? 'text-red-400' :
            context.impactAssessment.operationalRisk === 'medium' ? 'text-on-tertiary-container' : 'text-secondary'
          }`}>
            {context.impactAssessment.operationalRisk.toUpperCase()}
          </p>
          <p className="text-xs text-on-surface-variant">Op. Risk</p>
        </div>
      </div>
    </div>
  );
}
