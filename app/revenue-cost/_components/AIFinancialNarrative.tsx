'use client';

import { useState } from 'react';
import type { FinancialNarrative } from '@/lib/revenue-cost/revenue-cost.types';

interface AIFinancialNarrativeProps {
  narrative: FinancialNarrative | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-teal-100 text-teal-700',
};

export default function AIFinancialNarrative({
  narrative,
  isLoading,
  onRegenerate,
}: AIFinancialNarrativeProps) {
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!narrative) return;
    navigator.clipboard.writeText(narrative.summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-xl shadow-md p-6 bg-white border-l-4 border-tertiary-fixed">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-on-tertiary-container"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2l1.09 3.36L14.47 6l-2.74 2.12L12.82 12 10 10.02 7.18 12l1.09-3.88L5.53 6l3.38-.64L10 2z" />
          </svg>
          <h3 className="font-headline text-lg font-semibold text-on-surface">
            AI Financial Summary
          </h3>
          <span className="rounded-full bg-tertiary-fixed/10 px-2 py-0.5 text-xs font-medium text-on-tertiary-container">
            AI-generated
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
        </div>
      )}

      {/* Narrative present */}
      {!isLoading && narrative && (
        <div className="mt-4 space-y-4">
          {/* Summary */}
          <p className="text-gray-700 leading-relaxed">{narrative.summary}</p>

          {/* Toggle full analysis */}
          <button
            type="button"
            onClick={() => setShowFull((prev) => !prev)}
            className="text-sm font-medium text-secondary-container hover:underline"
          >
            {showFull ? 'Hide Full Analysis' : 'Show Full Analysis'}
          </button>

          {showFull && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
              {narrative.fullAnalysis}
            </p>
          )}

          {/* Key Insights */}
          {narrative.keyInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-on-surface">Key Insights</h4>
              <ul className="flex flex-wrap gap-2">
                {narrative.keyInsights.map((item, idx) => (
                  <li
                    key={idx}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      SEVERITY_STYLES[item.severity] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{item.insight}</span>
                    {item.actionable && (
                      <span className="rounded bg-white/60 px-1 py-px text-[10px] font-semibold leading-none">
                        Actionable
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-secondary-container hover:bg-secondary-container/5 transition-colors"
            >
              Regenerate
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 pt-1">
            Based on {narrative.dataPointsUsed} data points &middot;{' '}
            {narrative.modelVersion} &middot; Generated at{' '}
            {new Date(narrative.generatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Empty placeholder */}
      {!isLoading && !narrative && (
        <p className="mt-4 text-sm text-gray-400 italic">
          Run analysis to generate narrative
        </p>
      )}
    </div>
  );
}
