'use client';

import type { ReallocationRecommendation } from '@/lib/bed-allocation/bed-allocation.types';
import { formatRevenue } from '@/lib/bed-allocation/bed-allocation.utils';
import { sortRecommendationsByImpact } from '@/lib/bed-allocation/bed-allocation.utils';
import ReallocationRecommendationCard from './ReallocationRecommendationCard';

interface ReallocationRecommendationPanelProps {
  recommendations: ReallocationRecommendation[];
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ReallocationRecommendationPanel({
  recommendations,
  onApprove,
  onReject,
}: ReallocationRecommendationPanelProps) {
  const sorted = sortRecommendationsByImpact(recommendations);

  const totalMonthlyImpact = recommendations.reduce(
    (sum, rec) => sum + rec.revenueImpact.monthly,
    0,
  );

  return (
    <div className="rounded-xl shadow-sm bg-surface-container-lowest p-6">
      <h2 className="font-headline text-lg font-semibold text-on-surface">
        Reallocation Recommendations
      </h2>

      <p className="mt-1 text-sm text-on-surface-variant">
        {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'} | Projected savings: {formatRevenue(Math.abs(totalMonthlyImpact))}
      </p>

      <div className="mt-4">
        {sorted.map((rec) => (
          <ReallocationRecommendationCard
            key={rec.recommendationId}
            recommendation={rec}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
