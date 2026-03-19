'use client';

import { useParams } from 'next/navigation';
import { useRecommendationDetail } from '../_hooks/useRecommendationDetail';
import { useRecommendationActions } from '../_hooks/useRecommendationActions';
import { useState, useCallback } from 'react';
import RecommendationDetail from '../_components/RecommendationDetail';
import AcceptConfirmationDialog from '../_components/AcceptConfirmationDialog';
import DeferDialog from '../_components/DeferDialog';
import DismissDialog from '../_components/DismissDialog';
import type { DismissReason } from '@/lib/recommendations/recommendations.types';

export default function RecommendationDetailPage() {
  const params = useParams<{ recommendationId: string }>();
  const {
    recommendation,
    relatedRecommendations,
    simulationPreview,
    isLoading,
  } = useRecommendationDetail(params.recommendationId);

  const { accept, defer, dismiss, isProcessing } = useRecommendationActions({
    onUpdate: () => {},
  });

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [deferringId, setDeferringId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const handleAcceptClick = useCallback((id: string) => setAcceptingId(id), []);
  const handleDeferClick = useCallback((id: string) => setDeferringId(id), []);
  const handleDismissClick = useCallback((id: string) => setDismissingId(id), []);

  const handleAcceptConfirm = useCallback(
    (notes: string, targetDate: string) => {
      if (acceptingId) {
        accept(acceptingId, notes, targetDate);
        setAcceptingId(null);
      }
    },
    [acceptingId, accept],
  );

  const handleDeferConfirm = useCallback(
    (deferUntilDate: string, reason?: string) => {
      if (deferringId) {
        defer(deferringId, deferUntilDate, reason);
        setDeferringId(null);
      }
    },
    [deferringId, defer],
  );

  const handleDismissConfirm = useCallback(
    (reason: DismissReason, comment?: string) => {
      if (dismissingId) {
        dismiss(dismissingId, reason, comment);
        setDismissingId(null);
      }
    },
    [dismissingId, dismiss],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-on-surface-variant">Loading recommendation...</p>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
          <p className="text-lg font-headline font-semibold text-on-surface">Recommendation not found</p>
          <p className="text-sm text-on-surface-variant">The recommendation you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <RecommendationDetail
        recommendation={recommendation}
        relatedRecommendations={relatedRecommendations}
        simulationPreview={simulationPreview}
        isLoading={false}
        isOpen={true}
        onClose={() => window.history.back()}
        onAccept={handleAcceptClick}
        onDefer={handleDeferClick}
        onDismiss={handleDismissClick}
        fullPage
      />

      {acceptingId && (
        <AcceptConfirmationDialog
          onConfirm={handleAcceptConfirm}
          onCancel={() => setAcceptingId(null)}
          isProcessing={isProcessing}
        />
      )}
      {deferringId && (
        <DeferDialog
          onConfirm={handleDeferConfirm}
          onCancel={() => setDeferringId(null)}
          isProcessing={isProcessing}
        />
      )}
      {dismissingId && (
        <DismissDialog
          onConfirm={handleDismissConfirm}
          onCancel={() => setDismissingId(null)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
