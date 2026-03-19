'use client';

import type { ProcurementRecommendation } from '@/lib/supply-chain/supply-chain.types';
import { sortRecommendations } from '@/lib/supply-chain/supply-chain.utils';
import SupplyRecommendationCard from './SupplyRecommendationCard';

interface OptimizationRecommendationPanelProps {
  recommendations: ProcurementRecommendation[];
  onApprove: (id: string) => void;
  onAdjust: (id: string, quantity: number) => void;
  onDismiss: (id: string, reason: string) => void;
}

export default function OptimizationRecommendationPanel({
  recommendations,
  onApprove,
  onAdjust,
  onDismiss,
}: OptimizationRecommendationPanelProps) {
  const sorted = sortRecommendations(recommendations);

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Procurement Recommendations
        </h2>
        <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
          {recommendations.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">
          No procurement recommendations at this time.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((rec) => (
            <SupplyRecommendationCard
              key={rec.recommendationId}
              recommendation={rec}
              onApprove={onApprove}
              onAdjust={onAdjust}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
