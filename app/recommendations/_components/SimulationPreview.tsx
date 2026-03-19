'use client';

import type { SimulationPreviewData } from '@/lib/recommendations/recommendations.types';

interface SimulationPreviewProps {
  preview: SimulationPreviewData | null;
}

export default function SimulationPreview({
  preview,
}: SimulationPreviewProps) {
  if (!preview) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[22px] text-secondary">
          labs
        </span>
        <h3 className="font-headline text-base font-semibold text-on-surface">
          Simulation Preview
        </h3>
      </div>

      {/* Summary */}
      <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
        {preview.summary}
      </p>

      {/* Key Metrics */}
      <div className="flex flex-wrap gap-2 mb-4">
        {preview.keyMetrics.map((metric) => (
          <div
            key={metric.name}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-high/40 px-3 py-1.5"
          >
            <span className="text-xs text-on-surface-variant">{metric.name}</span>
            <span className="text-sm font-semibold text-on-surface">
              {metric.value.toLocaleString()}
              {metric.unit && (
                <span className="text-xs text-on-surface-variant ml-0.5">
                  {metric.unit}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Link to full simulation */}
      <a
        href="#"
        className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
      >
        <span>View full simulation</span>
        <span className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </a>
    </div>
  );
}
