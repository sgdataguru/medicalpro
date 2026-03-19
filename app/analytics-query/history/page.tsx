'use client';

import { useEffect } from 'react';
import { useQueryHistory } from '../_hooks/useQueryHistory';
import { formatRelativeTime } from '@/lib/analytics-query/analytics-query.utils';

export default function QueryHistoryPage() {
  const { conversations, total, isLoading, searchTerm, loadHistory, search, clearSearch } =
    useQueryHistory();

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">history</span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Query History
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Browse your past queries and conversations ({total} total).
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => search(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            history
          </span>
          <p className="text-lg font-headline font-semibold text-on-surface mb-1">
            No conversations found
          </p>
          <p className="text-sm text-on-surface-variant">
            {searchTerm ? 'Try a different search term.' : 'Your query history will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 hover:border-secondary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-sm font-bold text-on-surface truncate">
                    {conv.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {conv.turns.length} turn{conv.turns.length !== 1 ? 's' : ''} &middot;{' '}
                    {formatRelativeTime(conv.lastActivityAt)}
                  </p>
                  {conv.turns[0] && (
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                      {conv.turns[0].questionText}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {conv.isSaved && (
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      bookmark
                    </span>
                  )}
                  {conv.turns[0]?.feedback?.rating === 'helpful' && (
                    <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
                      thumb_up
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
