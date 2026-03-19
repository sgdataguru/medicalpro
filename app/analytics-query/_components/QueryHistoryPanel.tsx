'use client';

import type { Conversation } from '@/lib/analytics-query/analytics-query.types';
import { formatRelativeTime, truncateQueryPreview } from '@/lib/analytics-query/analytics-query.utils';

interface QueryHistoryPanelProps {
  conversations: Conversation[];
  isLoading: boolean;
  onSelectConversation: (conversationId: string) => void;
}

export default function QueryHistoryPanel({
  conversations,
  isLoading,
  onSelectConversation,
}: QueryHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface-container-high rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">
          history
        </span>
        <p className="text-sm text-on-surface-variant">No query history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-surface-container-high/30 transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-secondary">
            chat_bubble_outline
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{conv.title}</p>
            <p className="text-xs text-on-surface-variant">
              {conv.turns.length} turn{conv.turns.length !== 1 ? 's' : ''} &middot;{' '}
              {formatRelativeTime(conv.lastActivityAt)}
            </p>
          </div>
          {conv.isSaved && (
            <span className="material-symbols-outlined text-[14px] text-secondary shrink-0">
              bookmark
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
