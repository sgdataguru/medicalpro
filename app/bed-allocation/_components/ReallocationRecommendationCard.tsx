'use client';

import { useState } from 'react';
import type { ReallocationRecommendation } from '@/lib/bed-allocation/bed-allocation.types';
import { PRIORITY_CONFIG, REALLOCATION_TYPE_LABELS } from '@/lib/bed-allocation/bed-allocation.constants';
import { formatRevenueWithSign } from '@/lib/bed-allocation/bed-allocation.utils';

interface ReallocationRecommendationCardProps {
  recommendation: ReallocationRecommendation;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ReallocationRecommendationCard({
  recommendation,
  onApprove,
  onReject,
}: ReallocationRecommendationCardProps) {
  const [showApproveInput, setShowApproveInput] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const priorityStyle = PRIORITY_CONFIG[recommendation.priority] ?? {
    bg: 'bg-surface-container',
    text: 'text-on-surface-variant',
    border: 'border-outline-variant/15',
  };
  const typeLabel =
    REALLOCATION_TYPE_LABELS[recommendation.type] ?? recommendation.type;

  const revenueMonthly = recommendation.revenueImpact.monthly;
  const revenueColorClass = revenueMonthly >= 0 ? 'text-emerald-600' : 'text-red-600';

  const isPending = recommendation.status === 'PENDING';

  function handleApprove() {
    onApprove(recommendation.recommendationId, approvalNote);
    setShowApproveInput(false);
    setApprovalNote('');
  }

  function handleReject() {
    onReject(recommendation.recommendationId, rejectionReason);
    setShowRejectInput(false);
    setRejectionReason('');
  }

  return (
    <div className="border border-outline-variant/15 rounded-lg p-4 mb-3">
      {/* Top row: Priority badge, Type label, Bed count pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
        >
          {recommendation.priority}
        </span>
        <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
          {typeLabel}
        </span>
        <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          {recommendation.bedCount} {recommendation.bedCount === 1 ? 'bed' : 'beds'}
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 font-medium text-on-surface">{recommendation.description}</p>

      {/* Rationale */}
      <p className="mt-1 text-sm text-on-surface-variant italic">{recommendation.rationale}</p>

      {/* Impact metrics row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Revenue */}
        <div className="bg-surface-container rounded-lg p-3 text-center">
          <p className="text-xs text-on-surface-variant mb-1">Revenue</p>
          <p className={`text-sm font-semibold ${revenueColorClass}`}>
            {formatRevenueWithSign(revenueMonthly)}/mo
          </p>
        </div>
        {/* Wait Time */}
        <div className="bg-surface-container rounded-lg p-3 text-center">
          <p className="text-xs text-on-surface-variant mb-1">Wait Time</p>
          <p className="text-sm font-semibold text-emerald-600">
            -{recommendation.waitTimeImpact.reductionPercentage}%
          </p>
        </div>
        {/* Throughput */}
        <div className="bg-surface-container rounded-lg p-3 text-center">
          <p className="text-xs text-on-surface-variant mb-1">Throughput</p>
          <p className="text-sm font-semibold text-emerald-600">
            +{recommendation.throughputImpact.improvementPercentage}%
          </p>
        </div>
      </div>

      {/* Constraints */}
      {recommendation.constraints.length > 0 && (
        <div className="mt-3">
          <ul className="list-disc list-inside space-y-0.5">
            {recommendation.constraints.map((constraint, idx) => (
              <li key={idx} className="text-xs text-on-surface-variant">
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons / Status badge */}
      <div className="mt-4">
        {isPending ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="bg-secondary text-on-secondary rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary/85 transition-colors"
                onClick={() => {
                  setShowApproveInput(true);
                  setShowRejectInput(false);
                }}
              >
                Approve
              </button>
              <button
                type="button"
                className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                onClick={() => {
                  setShowRejectInput(true);
                  setShowApproveInput(false);
                }}
              >
                Reject
              </button>
            </div>

            {/* Approve input */}
            {showApproveInput && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Approval note (optional)"
                  className="flex-1 border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button
                  type="button"
                  className="bg-secondary text-on-secondary rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-secondary/85 transition-colors"
                  onClick={handleApprove}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="text-on-surface-variant text-sm hover:text-on-surface"
                  onClick={() => setShowApproveInput(false)}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Reject input */}
            {showRejectInput && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason"
                  className="flex-1 border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition-colors"
                  onClick={handleReject}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="text-on-surface-variant text-sm hover:text-on-surface"
                  onClick={() => setShowRejectInput(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              recommendation.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : recommendation.status === 'REJECTED'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/15'
            }`}
          >
            {recommendation.status}
          </span>
        )}
      </div>
    </div>
  );
}
