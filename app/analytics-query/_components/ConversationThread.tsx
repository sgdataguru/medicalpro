'use client';

import type { ConversationTurn, FeedbackRating } from '@/lib/analytics-query/analytics-query.types';
import { formatRelativeTime } from '@/lib/analytics-query/analytics-query.utils';
import AnswerRenderer from './AnswerRenderer';
import ConfidenceBadge from './ConfidenceBadge';

interface ConversationThreadProps {
  turns: ConversationTurn[];
  onFollowUp: (question: string) => void;
  hasRated: (queryId: string) => boolean;
  getRating: (queryId: string) => FeedbackRating | null;
  onRate: (queryId: string, rating: FeedbackRating, comment?: string) => void;
}

export default function ConversationThread({
  turns,
  onFollowUp,
  hasRated,
  getRating,
  onRate,
}: ConversationThreadProps) {
  if (turns.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
        Previous in this conversation
      </p>
      {turns.map((turn) => (
        <div
          key={turn.queryId}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 space-y-3"
        >
          {/* Question */}
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
              person
            </span>
            <p className="text-sm font-semibold text-on-surface">{turn.questionText}</p>
          </div>

          {/* Answer summary */}
          <div className="pl-7">
            <AnswerRenderer text={turn.response.answerText} />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pl-7">
            <ConfidenceBadge confidence={turn.response.confidence} />
            <span className="text-[10px] text-on-surface-variant">
              {formatRelativeTime(turn.timestamp)}
            </span>
            {turn.feedback && (
              <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">
                {turn.feedback.rating === 'helpful' ? 'thumb_up' : 'thumb_down'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
