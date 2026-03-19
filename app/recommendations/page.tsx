'use client';

import { useEffect, useState, useCallback } from 'react';

import { useRecommendations } from './_hooks/useRecommendations';
import { useRecommendationFilters } from './_hooks/useRecommendationFilters';
import { useRecommendationActions } from './_hooks/useRecommendationActions';
import { useRecommendationDetail } from './_hooks/useRecommendationDetail';
import { useRecommendationOutcomes } from './_hooks/useRecommendationOutcomes';

import RecommendationDashboard from './_components/RecommendationDashboard';
import RecommendationFilters from './_components/RecommendationFilters';
import RecommendationList from './_components/RecommendationList';
import RecommendationDetail from './_components/RecommendationDetail';
import OutcomeSummaryCards from './_components/OutcomeSummaryCards';
import AcceptConfirmationDialog from './_components/AcceptConfirmationDialog';
import DeferDialog from './_components/DeferDialog';
import DismissDialog from './_components/DismissDialog';

import type { Recommendation, DismissReason } from '@/lib/recommendations/recommendations.types';

export default function RecommendationsPage() {
  const {
    state,
    loadRecommendations,
    filteredRecommendations,
    selectRecommendation,
    updateFilters,
    updateRecommendation,
  } = useRecommendations();

  const { setFilter, clearFilters, activeFilterCount } = useRecommendationFilters(
    state.filters,
    updateFilters,
  );

  const {
    recommendation: selectedDetail,
    relatedRecommendations,
    simulationPreview,
    isLoading: detailLoading,
  } = useRecommendationDetail(state.selectedRecommendation?.id ?? null);

  const { accept, defer, dismiss, isProcessing } = useRecommendationActions({
    onUpdate: updateRecommendation,
  });

  const { summary: outcomeSummary } = useRecommendationOutcomes();

  // Dialog state
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [deferringId, setDeferringId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCard = useCallback(
    (rec: Recommendation) => {
      selectRecommendation(rec);
    },
    [selectRecommendation],
  );

  const handleAcceptClick = useCallback((id: string) => {
    setAcceptingId(id);
  }, []);

  const handleDeferClick = useCallback((id: string) => {
    setDeferringId(id);
  }, []);

  const handleDismissClick = useCallback((id: string) => {
    setDismissingId(id);
  }, []);

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

  const handleCloseDetail = useCallback(() => {
    selectRecommendation(null);
  }, [selectRecommendation]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <RecommendationDashboard
        totalCount={state.totalCount}
        newCount={state.newCount}
        outcomeSummary={outcomeSummary}
      />

      <RecommendationFilters
        filters={state.filters}
        onChange={updateFilters}
        activeFilterCount={activeFilterCount}
        onClear={clearFilters}
      />

      {/* Main content: list + detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <RecommendationList
          recommendations={filteredRecommendations}
          selectedId={state.selectedRecommendation?.id ?? null}
          isLoading={state.isLoading}
          onSelect={handleSelectCard}
          onAccept={handleAcceptClick}
          onDefer={handleDeferClick}
          onDismiss={handleDismissClick}
        />

        <RecommendationDetail
          recommendation={state.selectedRecommendation}
          relatedRecommendations={relatedRecommendations}
          simulationPreview={simulationPreview}
          isLoading={detailLoading}
          isOpen={state.isDetailOpen}
          onClose={handleCloseDetail}
          onAccept={handleAcceptClick}
          onDefer={handleDeferClick}
          onDismiss={handleDismissClick}
        />
      </div>

      {/* Outcome summary */}
      {outcomeSummary && <OutcomeSummaryCards summary={outcomeSummary} />}

      {/* Dialogs */}
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
