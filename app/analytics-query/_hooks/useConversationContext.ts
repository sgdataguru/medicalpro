'use client';

import { useState, useCallback } from 'react';
import type { Conversation, ConversationTurn } from '@/lib/analytics-query/analytics-query.types';
import { generateConversationTitle } from '@/lib/analytics-query/analytics-query.utils';

export function useConversationContext() {
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const startConversation = useCallback((firstQuestion: string) => {
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: `CONV-${Date.now()}`,
      hospitalId: 'HOSP-001',
      userId: 'USR-001',
      title: generateConversationTitle(firstQuestion),
      turns: [],
      createdAt: now,
      lastActivityAt: now,
      isSaved: false,
    };
    setConversation(newConversation);
    return newConversation;
  }, []);

  const addTurn = useCallback((turn: ConversationTurn) => {
    setConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        turns: [...prev.turns, turn],
        lastActivityAt: new Date().toISOString(),
      };
    });
  }, []);

  const endConversation = useCallback(() => {
    setConversation(null);
  }, []);

  const toggleSaved = useCallback(() => {
    setConversation((prev) => {
      if (!prev) return prev;
      return { ...prev, isSaved: !prev.isSaved };
    });
  }, []);

  return {
    conversation,
    startConversation,
    addTurn,
    endConversation,
    toggleSaved,
    isActive: conversation !== null,
    turnCount: conversation?.turns.length ?? 0,
  };
}
