'use client';

import type { PredictionJobStatus } from '@/lib/staff-allocation/staff-allocation.types';
import { formatConfidence } from '@/lib/staff-allocation/staff-allocation.utils';

interface PredictedDemandCardProps {
  predictionTotals: { forecastedNeed: number; gap: number; confidence: number } | null;
  predictionStatus: PredictionJobStatus;
  loading: boolean;
}

export default function PredictedDemandCard({ predictionTotals, predictionStatus, loading }: PredictedDemandCardProps) {
  const isProcessing = predictionStatus === 'queued' || predictionStatus === 'processing';

  if (loading && !predictionTotals) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 animate-pulse">
        <div className="h-5 w-40 bg-surface-container-high rounded mb-4" />
        <div className="h-10 w-20 bg-surface-container-high rounded mb-2" />
        <div className="h-4 w-60 bg-surface-container-high rounded" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[20px] text-secondary">insights</span>
        <h3 className="font-headline text-sm font-bold text-on-surface">Predicted Demand</h3>
        {isProcessing && (
          <span className="ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary rounded-full animate-pulse">
            {predictionStatus === 'queued' ? 'Queued' : 'Processing'}
          </span>
        )}
      </div>

      {isProcessing ? (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-on-surface-variant">Analyzing staffing patterns...</span>
        </div>
      ) : predictionTotals ? (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-headline text-3xl font-extrabold text-on-surface">
              {predictionTotals.forecastedNeed}
            </span>
            <span className="text-sm text-on-surface-variant">forecasted need</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">trending_up</span>
              <span className="text-sm font-bold text-amber-600">+{predictionTotals.gap} gap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span className="text-sm text-on-surface-variant">
                {formatConfidence(predictionTotals.confidence)} confidence
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">
          Run a prediction to see forecasted staffing demand.
        </p>
      )}
    </div>
  );
}
