'use client';

import { useState } from 'react';
import type { StaffingRecommendation } from '@/lib/staff-allocation/staff-allocation.types';
import RecommendationCard from './RecommendationCard';

interface RecommendationPanelProps {
  recommendations: StaffingRecommendation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
  rejectingId: string | null;
  onRejectConfirm: (reason: string) => void;
  onRejectCancel: () => void;
}

export default function RecommendationPanel({
  recommendations,
  onAccept,
  onReject,
  isPending,
  rejectingId,
  onRejectConfirm,
  onRejectCancel,
}: RecommendationPanelProps) {
  const [rejectReason, setRejectReason] = useState('');
  const pendingRecs = recommendations.filter((r) => r.status === 'PENDING');
  const actionedRecs = recommendations.filter((r) => r.status !== 'PENDING');

  const totalSavings = pendingRecs.reduce((s, r) => s + r.projectedOvertimeSavings, 0);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">recommend</span>
          <h3 className="font-headline text-sm font-bold text-on-surface">Recommendations</h3>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-secondary/10 text-secondary rounded-full">
            {pendingRecs.length} pending
          </span>
        </div>
        <div className="text-xs text-on-surface-variant">
          Projected savings: <span className="font-bold text-emerald-600">${totalSavings.toLocaleString()}</span>/week
        </div>
      </div>

      <div className="space-y-3">
        {pendingRecs.map((rec) => (
          <RecommendationCard
            key={rec.recommendationId}
            recommendation={rec}
            onAccept={onAccept}
            onReject={onReject}
            isPending={isPending}
          />
        ))}
      </div>

      {/* Reject confirmation */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full shadow-xl">
            <h4 className="font-headline text-base font-bold text-on-surface mb-3">Reject Recommendation</h4>
            <p className="text-sm text-on-surface-variant mb-4">Please provide a reason for rejecting this recommendation.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              className="w-full h-24 px-3 py-2 text-sm text-on-surface bg-surface-container-high rounded-lg border border-outline-variant/20 focus:outline-none focus:border-secondary resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { onRejectCancel(); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onRejectConfirm(rejectReason); setRejectReason(''); }}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actioned recommendations */}
      {actionedRecs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-outline-variant/10">
          <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
            Actioned ({actionedRecs.length})
          </h4>
          <div className="space-y-2">
            {actionedRecs.map((rec) => (
              <div key={rec.recommendationId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container-high/30">
                <span className={`material-symbols-outlined text-[16px] ${rec.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {rec.status === 'ACCEPTED' ? 'check_circle' : 'cancel'}
                </span>
                <span className="text-xs text-on-surface-variant flex-1 truncate">{rec.description}</span>
                <span className={`text-[10px] font-bold uppercase ${rec.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
