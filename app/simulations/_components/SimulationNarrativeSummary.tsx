'use client';

import type { RiskAssessment } from '@/lib/simulation/simulation.types';
import { RISK_LEVEL_CONFIG } from '@/lib/simulation/simulation.constants';
import RiskLevelBadge from './RiskLevelBadge';

interface SimulationNarrativeSummaryProps {
  narrative: string;
  riskAssessment: RiskAssessment;
}

export default function SimulationNarrativeSummary({
  narrative,
  riskAssessment,
}: SimulationNarrativeSummaryProps) {
  // Split narrative into sentences for paragraph rendering
  const sentences = narrative
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s.endsWith('.') ? s : s + '.'));

  return (
    <div>
      {/* Section header with subtle gradient accent */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[22px] bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
          smart_toy
        </span>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          AI Analysis
        </h3>
      </div>

      {/* Content container */}
      <div className="bg-surface-container rounded-xl p-6 ring-1 ring-outline-variant/15 space-y-5">
        {/* Narrative paragraphs */}
        <div className="space-y-2">
          {sentences.map((sentence, idx) => (
            <p
              key={idx}
              className="font-body text-sm text-on-surface-variant leading-relaxed"
            >
              {sentence}
            </p>
          ))}
        </div>

        {/* Overall risk assessment */}
        <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
          <span className="font-body text-sm font-medium text-on-surface">
            Overall Risk Assessment:
          </span>
          <RiskLevelBadge risk={riskAssessment.overallRisk} size="md" />
        </div>

        {/* Risk factors list */}
        {riskAssessment.riskFactors.length > 0 && (
          <div>
            <h4 className="font-body text-sm font-medium text-on-surface mb-2">
              Risk Factors
            </h4>
            <ul className="space-y-2">
              {riskAssessment.riskFactors.map((factor, idx) => {
                const severityConfig = RISK_LEVEL_CONFIG[factor.severity];
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0"
                      style={{ color: severityConfig.color }}
                    >
                      {severityConfig.icon}
                    </span>
                    <span className="font-body text-sm text-on-surface-variant">
                      {factor.description}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Mitigation suggestions */}
        {riskAssessment.mitigationSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface">
                lightbulb
              </span>
              <h4 className="font-body text-sm font-medium text-on-surface">
                Recommendations
              </h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {riskAssessment.mitigationSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="font-body text-sm text-on-surface-variant list-disc"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer footer */}
        <p className="font-body text-xs text-on-surface-variant italic pt-2 border-t border-outline-variant/10">
          This analysis is AI-generated and should be reviewed by clinical
          leadership.
        </p>
      </div>
    </div>
  );
}
