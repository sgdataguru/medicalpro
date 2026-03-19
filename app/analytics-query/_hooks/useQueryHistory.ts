'use client';

import { useState, useCallback } from 'react';
import type { Conversation } from '@/lib/analytics-query/analytics-query.types';
import { fetchQueryHistory } from '@/lib/analytics-query/analytics-query.service';

export function useQueryHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const result = await fetchQueryHistory(search);
      setConversations(result.conversations);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (term: string) => {
    setSearchTerm(term);
    await loadHistory(term || undefined);
  }, [loadHistory]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    loadHistory();
  }, [loadHistory]);

  return {
    conversations,
    total,
    isLoading,
    searchTerm,
    loadHistory,
    search,
    clearSearch,
  };
}
