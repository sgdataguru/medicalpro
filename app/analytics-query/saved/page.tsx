'use client';

import { useEffect, useState } from 'react';
import { useSavedQueries } from '../_hooks/useSavedQueries';
import { formatRelativeTime } from '@/lib/analytics-query/analytics-query.utils';

export default function SavedQueriesPage() {
  const { savedQueries, isLoading, loadSavedQueries, remove } = useSavedQueries();
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await remove(id);
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-secondary">bookmark</span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Saved Queries
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Quickly re-run your saved questions.
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedQueries.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            bookmark_border
          </span>
          <p className="text-lg font-headline font-semibold text-on-surface mb-1">
            No saved queries
          </p>
          <p className="text-sm text-on-surface-variant">
            Save frequently-used queries for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedQueries.map((sq) => (
            <div
              key={sq.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4 hover:border-secondary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-sm font-bold text-on-surface">
                    {sq.label}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">{sq.questionText}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-on-primary-container">
                      Run {sq.runCount} time{sq.runCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Last run {formatRelativeTime(sq.lastRunAt)}
                    </span>
                    {sq.tags.length > 0 && (
                      <div className="flex gap-1">
                        {sq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(sq.id)}
                  disabled={removingId === sq.id}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
