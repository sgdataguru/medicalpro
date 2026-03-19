'use client';

import { useState, useCallback } from 'react';
import type { SavedQuery } from '@/lib/analytics-query/analytics-query.types';
import { fetchSavedQueries, saveQuery, deleteSavedQuery } from '@/lib/analytics-query/analytics-query.service';

export function useSavedQueries() {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSavedQueries = useCallback(async () => {
    setIsLoading(true);
    try {
      const queries = await fetchSavedQueries();
      setSavedQueries(queries);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (questionText: string, label: string, tags: string[]) => {
    setIsSaving(true);
    try {
      const newQuery = await saveQuery(questionText, label, tags);
      setSavedQueries((prev) => [newQuery, ...prev]);
      return newQuery;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(async (queryId: string) => {
    await deleteSavedQuery(queryId);
    setSavedQueries((prev) => prev.filter((q) => q.id !== queryId));
  }, []);

  return {
    savedQueries,
    isLoading,
    isSaving,
    loadSavedQueries,
    save,
    remove,
  };
}
