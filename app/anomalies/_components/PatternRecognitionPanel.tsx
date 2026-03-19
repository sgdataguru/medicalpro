'use client';

import type { AnomalyPattern } from '@/lib/anomaly/anomaly.types';
import { formatAnomalyTimestamp } from '@/lib/anomaly/anomaly.utils';
import SeverityBadge from './SeverityBadge';
import ModuleTag from './ModuleTag';

interface PatternRecognitionPanelProps {
  patterns: AnomalyPattern[];
}

export default function PatternRecognitionPanel({ patterns }: PatternRecognitionPanelProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      <h3 className="font-headline text-base font-semibold text-secondary-container mb-4">
        Recurring Patterns
      </h3>
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <div
            key={pattern.patternId}
            className="p-3 rounded-lg bg-surface-container-high/30 border border-outline-variant/15"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <SeverityBadge severity={pattern.severity} />
              <ModuleTag module={pattern.module} />
              <span className="text-xs text-on-primary-container ml-auto">
                {pattern.occurrenceCount} occurrences
              </span>
            </div>
            <h4 className="text-sm font-medium text-on-surface mb-1">
              {pattern.title}
            </h4>
            <p className="text-xs text-on-surface-variant mb-2">
              {pattern.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-on-primary-container">
              <span>Avg interval: {pattern.avgFrequencyDays}d</span>
              <span>Last: {formatAnomalyTimestamp(pattern.lastOccurrence)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
