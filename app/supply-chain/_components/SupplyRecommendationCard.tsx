'use client';

import { useState } from 'react';
import type { ProcurementRecommendation } from '@/lib/supply-chain/supply-chain.types';
import { RECOMMENDATION_TYPE_LABELS } from '@/lib/supply-chain/supply-chain.constants';
import { formatCurrency, formatPercentage } from '@/lib/supply-chain/supply-chain.utils';

interface SupplyRecommendationCardProps {
  recommendation: ProcurementRecommendation;
  onApprove: (id: string) => void;
  onAdjust: (id: string, quantity: number) => void;
  onDismiss: (id: string, reason: string) => void;
}

const PRIORITY_STYLES: Record<
  ProcurementRecommendation['priority'],
  { border: string; badge: string; badgeText: string }
> = {
  CRITICAL: {
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Critical',
  },
  HIGH: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: 'High',
  },
  MEDIUM: {
    border: 'border-l-secondary-container',
    badge: 'bg-secondary-container/10 text-secondary-container',
    badgeText: 'Medium',
  },
  LOW: {
    border: 'border-l-gray-400',
    badge: 'bg-gray-100 text-gray-600',
    badgeText: 'Low',
  },
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  ADJUSTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Adjusted' },
  DISMISSED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Dismissed' },
};

export default function SupplyRecommendationCard({
  recommendation,
  onApprove,
  onAdjust,
  onDismiss,
}: SupplyRecommendationCardProps) {
  const [adjustQty, setAdjustQty] = useState<number>(
    recommendation.suggestedOrderDetails?.quantity ?? recommendation.recommendedValue,
  );
  const [showAdjust, setShowAdjust] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);
  const [dismissReason, setDismissReason] = useState('');

  const priority = PRIORITY_STYLES[recommendation.priority];
  const typeLabel =
    RECOMMENDATION_TYPE_LABELS[recommendation.type] ?? recommendation.type;
  const { costImpact } = recommendation;
  const isPending = recommendation.status === 'PENDING';

  return (
    <div
      className={`border rounded-lg p-4 border-l-4 ${priority.border}`}
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${priority.badge}`}
        >
          {priority.badgeText}
        </span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {typeLabel}
        </span>
        <span className="font-sans text-sm font-semibold text-on-surface ml-auto">
          {recommendation.itemName}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-on-surface mb-1">{recommendation.description}</p>

      {/* Rationale */}
      <p className="text-sm text-gray-600 italic mb-3">
        {recommendation.rationale}
      </p>

      {/* Cost impact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
        <div>
          <span className="block text-gray-500 text-xs">Current Annual</span>
          <span className="font-sans font-medium text-on-surface">
            {formatCurrency(costImpact.currentAnnualCost)}
          </span>
        </div>
        <div>
          <span className="block text-gray-500 text-xs">Projected Annual</span>
          <span className="font-sans font-medium text-on-surface">
            {formatCurrency(costImpact.projectedAnnualCost)}
          </span>
        </div>
        <div>
          <span className="block text-gray-500 text-xs">Savings</span>
          <span className="font-semibold text-success">
            {formatCurrency(costImpact.savings)}
          </span>
        </div>
        <div>
          <span className="block text-gray-500 text-xs">Savings %</span>
          <span className="font-semibold text-success">
            {formatPercentage(costImpact.savingsPercentage)}
          </span>
        </div>
      </div>

      {/* Actions / Status */}
      {isPending ? (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onApprove(recommendation.recommendationId)}
              className="bg-secondary text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setShowAdjust((v) => !v)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Adjust
            </button>
            <button
              type="button"
              onClick={() => setShowDismiss((v) => !v)}
              className="text-gray-500 text-sm hover:text-red-500 transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Adjust inline form */}
          {showAdjust && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-gray-500" htmlFor={`adj-${recommendation.recommendationId}`}>
                Qty:
              </label>
              <input
                id={`adj-${recommendation.recommendationId}`}
                type="number"
                min={1}
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
              />
              <button
                type="button"
                onClick={() => {
                  onAdjust(recommendation.recommendationId, adjustQty);
                  setShowAdjust(false);
                }}
                className="bg-secondary text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          )}

          {/* Dismiss inline form */}
          {showDismiss && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Reason for dismissal"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  onDismiss(recommendation.recommendationId, dismissReason);
                  setShowDismiss(false);
                  setDismissReason('');
                }}
                className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </>
      ) : (
        (() => {
          const badge = STATUS_BADGE[recommendation.status];
          return badge ? (
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>
          ) : null;
        })()
      )}
    </div>
  );
}
