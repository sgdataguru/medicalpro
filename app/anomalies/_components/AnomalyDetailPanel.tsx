'use client';

import type { AnomalyAlert, InvestigationNote } from '@/lib/anomaly/anomaly.types';
import { formatAnomalyDate } from '@/lib/anomaly/anomaly.utils';
import { STATUS_CONFIG } from '@/lib/anomaly/anomaly.constants';
import SeverityBadge from './SeverityBadge';
import ModuleTag from './ModuleTag';
import AnomalyContextBlock from './AnomalyContextBlock';
import AnomalyActionBar from './AnomalyActionBar';
import InvestigationWorksheet from './InvestigationWorksheet';

interface AnomalyDetailPanelProps {
  anomaly: AnomalyAlert | null;
  relatedAnomalies?: AnomalyAlert[];
  notes?: InvestigationNote[];
  isDetailLoading?: boolean;
  onAcknowledge: () => void;
  onInvestigate: () => void;
  onDismiss: () => void;
  onOpenHistory?: () => void;
  onAddNote?: (content: string) => void;
  isPending: boolean;
}

export default function AnomalyDetailPanel({
  anomaly,
  relatedAnomalies = [],
  notes = [],
  isDetailLoading,
  onAcknowledge,
  onInvestigate,
  onDismiss,
  onOpenHistory,
  onAddNote,
  isPending,
}: AnomalyDetailPanelProps) {
  if (!anomaly) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <svg className="w-12 h-12 text-on-surface-variant mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <p className="text-sm text-on-surface-variant">
          Select an anomaly to view details
        </p>
      </div>
    );
  }

  if (isDetailLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent mb-3" />
        <p className="text-sm text-on-surface-variant">Loading details...</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[anomaly.status];

  return (
    <div className="p-5 space-y-5 overflow-auto max-h-[calc(100vh-280px)]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <SeverityBadge severity={anomaly.severity} />
          <ModuleTag module={anomaly.module} />
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusCfg.bgClass}`}>
            {statusCfg.label}
          </span>
        </div>
        <h2 className="font-headline text-lg font-semibold text-on-surface mb-2">
          {anomaly.title}
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {anomaly.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-on-primary-container text-xs">Detected</span>
          <p className="text-on-surface-variant font-mono text-xs">{formatAnomalyDate(anomaly.detectedAt)}</p>
        </div>
        {anomaly.acknowledgedAt && (
          <div>
            <span className="text-on-primary-container text-xs">Acknowledged</span>
            <p className="text-on-surface-variant font-mono text-xs">{formatAnomalyDate(anomaly.acknowledgedAt)}</p>
          </div>
        )}
        <div>
          <span className="text-on-primary-container text-xs">ID</span>
          <p className="text-on-surface-variant font-mono text-xs">{anomaly.id}</p>
        </div>
        {anomaly.assignedTo && (
          <div>
            <span className="text-on-primary-container text-xs">Assigned To</span>
            <p className="text-on-surface-variant font-mono text-xs">{anomaly.assignedTo}</p>
          </div>
        )}
      </div>

      {/* Triggered By */}
      {anomaly.triggeredBy.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
            Triggered By
          </h4>
          <div className="space-y-2">
            {anomaly.triggeredBy.map((trigger, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-surface-container-high/30 border border-outline-variant/15 text-xs">
                <p className="text-on-surface-variant font-mono mb-1">{trigger.field}</p>
                <p className="text-on-surface-variant">
                  Expected: <span className="text-secondary font-mono">{String(trigger.expectedValue)}</span>
                  {' → '}
                  Actual: <span className="text-red-400 font-mono">{String(trigger.actualValue)}</span>
                </p>
                <p className="text-on-primary-container mt-1">Source: {trigger.dataSource}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Context */}
      <AnomalyContextBlock context={anomaly.context} />

      {/* Related Anomalies */}
      {relatedAnomalies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
            Related Anomalies
          </h4>
          <div className="space-y-2">
            {relatedAnomalies.map((related) => (
              <div key={related.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-high/30 border border-outline-variant/15">
                <SeverityBadge severity={related.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{related.title}</p>
                  <p className="text-[10px] text-on-primary-container">{related.id}</p>
                </div>
                <ModuleTag module={related.module} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Worksheet */}
      {anomaly.status === 'investigating' && onAddNote && (
        <InvestigationWorksheet
          anomalyId={anomaly.id}
          notes={notes}
          onAddNote={onAddNote}
        />
      )}

      {/* Audit Trail */}
      {anomaly.auditTrail.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
              Audit Trail
            </h4>
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-xs text-secondary hover:text-secondary/80 transition-colors font-medium"
              >
                View Full History
              </button>
            )}
          </div>
          <div className="space-y-2">
            {anomaly.auditTrail.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary-container mt-1.5 shrink-0" />
                <div>
                  <span className="text-on-surface-variant">{entry.actorName}</span>
                  <span className="text-on-primary-container mx-1">·</span>
                  <span className="text-on-primary-container capitalize">{entry.action.replace('_', ' ')}</span>
                  {entry.reason && (
                    <p className="text-on-primary-container mt-0.5 italic">&ldquo;{entry.reason}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <AnomalyActionBar
        anomaly={anomaly}
        onAcknowledge={onAcknowledge}
        onInvestigate={onInvestigate}
        onDismiss={onDismiss}
        isPending={isPending}
      />
    </div>
  );
}
