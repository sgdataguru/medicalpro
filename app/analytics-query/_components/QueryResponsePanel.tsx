'use client';

import type { NLQueryResponse, FeedbackRating } from '@/lib/analytics-query/analytics-query.types';
import { formatProcessingTime } from '@/lib/analytics-query/analytics-query.utils';
import StreamingAnswerText from './StreamingAnswerText';
import ConfidenceBadge from './ConfidenceBadge';
import DynamicVisualization from './DynamicVisualization';
import DataSourceCitations from './DataSourceCitations';
import ResponseFeedback from './ResponseFeedback';

interface QueryResponsePanelProps {
  response: NLQueryResponse | null;
  streamedText: string;
  isStreaming: boolean;
  error: string | null;
  queryId: string | null;
  hasRated: (queryId: string) => boolean;
  getRating: (queryId: string) => FeedbackRating | null;
  onRate: (queryId: string, rating: FeedbackRating, comment?: string) => void;
}

export default function QueryResponsePanel({
  response,
  streamedText,
  isStreaming,
  error,
  queryId,
  hasRated,
  getRating,
  onRate,
}: QueryResponsePanelProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
      {/* Header with confidence + processing time */}
      {response && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
          <ConfidenceBadge confidence={response.confidence} />
          <span className="text-xs text-on-surface-variant">
            {formatProcessingTime(response.processingTimeMs)}
          </span>
        </div>
      )}

      {/* Guardrail warnings */}
      {response?.guardrailFlags.map((flag, i) => (
        <div
          key={i}
          className="flex items-start gap-2 px-5 py-3 bg-warning/5 border-b border-warning/20"
        >
          <span className="material-symbols-outlined text-[18px] text-warning mt-0.5">
            {flag.severity === 'critical' ? 'error' : 'warning'}
          </span>
          <p className="text-sm text-on-surface">{flag.message}</p>
        </div>
      ))}

      {/* Answer text */}
      <div className="px-5 py-4">
        <StreamingAnswerText
          text={response?.answerText ?? streamedText}
          isStreaming={isStreaming}
        />
      </div>

      {/* Visualizations */}
      {response && response.visualizations.length > 0 && (
        <div className="px-5 pb-4 space-y-4">
          {response.visualizations.map((viz) => (
            <DynamicVisualization key={viz.id} spec={viz} />
          ))}
        </div>
      )}

      {/* Data source citations */}
      {response && response.dataSources.length > 0 && (
        <DataSourceCitations sources={response.dataSources} />
      )}

      {/* Feedback */}
      {response && queryId && !isStreaming && (
        <div className="px-5 py-3 border-t border-outline-variant/10">
          <ResponseFeedback
            queryId={queryId}
            hasRated={hasRated(queryId)}
            currentRating={getRating(queryId)}
            onRate={onRate}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 py-3 bg-error/5 border-t border-error/20">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  );
}
