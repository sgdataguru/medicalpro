'use client';

import { useEffect, useState, useCallback } from 'react';

import { useAnomalyFeed } from './_hooks/useAnomalyFeed';
import { useAnomalyFilters } from './_hooks/useAnomalyFilters';
import { useAnomalyActions } from './_hooks/useAnomalyActions';
import { useAnomalyTrends } from './_hooks/useAnomalyTrends';
import { useAnomalyRealtime } from './_hooks/useAnomalyRealtime';
import { useAnomalyDetail } from './_hooks/useAnomalyDetail';

import AnomalyPageHeader from './_components/AnomalyPageHeader';
import AnomalyStatsBar from './_components/AnomalyStatsBar';
import AnomalyFilterBar from './_components/AnomalyFilterBar';
import AnomalyFeedPanel from './_components/AnomalyFeedPanel';
import AnomalyDetailPanel from './_components/AnomalyDetailPanel';
import AnomalyTrendChart from './_components/AnomalyTrendChart';
import PatternRecognitionPanel from './_components/PatternRecognitionPanel';
import DismissConfirmDialog from './_components/DismissConfirmDialog';
import AnomalyHistoryDrawer from './_components/AnomalyHistoryDrawer';

import { fetchAnomalyPatterns } from '@/lib/anomaly/anomaly.service';
import type { AnomalyAlert, AnomalyPattern, InvestigationNote } from '@/lib/anomaly/anomaly.types';

export default function AnomalyDetectionPage() {
  const {
    state,
    dispatch,
    loadAlerts,
    loadMore,
    filteredAlerts,
    selectAlert,
    updateFilters,
    updateAlert,
  } = useAnomalyFeed();

  const { activeFilterCount } = useAnomalyFilters(state.filters, updateFilters);

  const {
    relatedAnomalies,
    notes: detailNotes,
    isLoading: detailLoading,
    addNote: addDetailNote,
  } = useAnomalyDetail(state.activeAlertId);

  const handleNoteAdded = useCallback(
    (note: InvestigationNote) => {
      addDetailNote(note);
    },
    [addDetailNote],
  );

  const { acknowledge, investigate, dismiss, addNote, isPending } = useAnomalyActions({
    onUpdate: updateAlert,
    onNoteAdded: handleNoteAdded,
  });

  const { trendData, period, changePeriod, isLoading: trendsLoading } = useAnomalyTrends();

  const handleNewAnomaly = useCallback(
    (alert: AnomalyAlert) => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    },
    [dispatch],
  );

  useAnomalyRealtime({
    enabled: true,
    onNewAnomaly: handleNewAnomaly,
  });

  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
    fetchAnomalyPatterns().then(setPatterns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAlert = state.activeAlertId
    ? state.alerts.find((a) => a.id === state.activeAlertId) ?? null
    : null;

  const handleAcknowledge = useCallback(() => {
    if (state.activeAlertId) acknowledge(state.activeAlertId);
  }, [state.activeAlertId, acknowledge]);

  const handleInvestigate = useCallback(() => {
    if (state.activeAlertId) investigate(state.activeAlertId);
  }, [state.activeAlertId, investigate]);

  const handleDismissClick = useCallback(() => {
    if (state.activeAlertId) setDismissingId(state.activeAlertId);
  }, [state.activeAlertId]);

  const handleDismissConfirm = useCallback(
    (reason: string, suppressSimilar: boolean) => {
      if (dismissingId) {
        dismiss(dismissingId, reason, suppressSimilar);
        setDismissingId(null);
      }
    },
    [dismissingId, dismiss],
  );

  const handleOpenHistory = useCallback(() => {
    setHistoryOpen(true);
  }, []);

  const handleAddNote = useCallback(
    (content: string) => {
      if (state.activeAlertId) {
        addNote(state.activeAlertId, content);
      }
    },
    [state.activeAlertId, addNote],
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      <AnomalyPageHeader />

      <AnomalyStatsBar stats={state.stats} />

      <AnomalyFilterBar
        filters={state.filters}
        onChange={updateFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Main content: 60/40 split */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        {/* Left: Feed panel */}
        <div className="min-h-[400px]">
          <AnomalyFeedPanel
            alerts={filteredAlerts}
            activeId={state.activeAlertId}
            onSelect={selectAlert}
            hasMore={state.hasMore}
            onLoadMore={loadMore}
            isLoading={state.loading}
          />
        </div>

        {/* Right: Detail panel */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 min-h-[400px]">
          <AnomalyDetailPanel
            anomaly={selectedAlert}
            relatedAnomalies={relatedAnomalies}
            notes={detailNotes}
            isDetailLoading={detailLoading}
            onAcknowledge={handleAcknowledge}
            onInvestigate={handleInvestigate}
            onDismiss={handleDismissClick}
            onOpenHistory={handleOpenHistory}
            onAddNote={handleAddNote}
            isPending={isPending}
          />
        </div>
      </div>

      {/* Trend chart */}
      <AnomalyTrendChart
        data={trendData}
        period={period}
        onPeriodChange={changePeriod}
        isLoading={trendsLoading}
      />

      {/* Pattern recognition */}
      <PatternRecognitionPanel patterns={patterns} />

      {/* Dismiss dialog */}
      {dismissingId && (
        <DismissConfirmDialog
          anomalyId={dismissingId}
          onConfirm={handleDismissConfirm}
          onCancel={() => setDismissingId(null)}
        />
      )}

      {/* History drawer */}
      <AnomalyHistoryDrawer
        entries={selectedAlert?.auditTrail ?? []}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
