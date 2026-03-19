'use client';

import type { SavedQuery } from '@/lib/analytics-query/analytics-query.types';
import { formatRelativeTime } from '@/lib/analytics-query/analytics-query.utils';

interface SavedQueriesPanelProps {
  queries: SavedQuery[];
  isLoading: boolean;
  onRun: (questionText: string) => void;
  onDelete: (queryId: string) => void;
}

export default function SavedQueriesPanel({
  queries,
  isLoading,
  onRun,
  onDelete,
}: SavedQueriesPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface-container-high rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">
          bookmark_border
        </span>
        <p className="text-sm text-on-surface-variant">No saved queries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queries.map((sq) => (
        <div
          key={sq.id}
          className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:border-secondary/20 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{sq.label}</p>
            <p className="text-xs text-on-surface-variant truncate">{sq.questionText}</p>
            <p className="text-[10px] text-on-primary-container mt-0.5">
              {sq.runCount} runs &middot; {formatRelativeTime(sq.lastRunAt)}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRun(sq.questionText)}
              className="p-1 rounded-lg hover:bg-secondary/10 text-secondary"
              title="Run query"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            </button>
            <button
              onClick={() => onDelete(sq.id)}
              className="p-1 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
