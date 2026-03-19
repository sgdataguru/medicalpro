'use client';

import { useEffect } from 'react';
import { useNLQuery } from './_hooks/useNLQuery';
import { useConversationContext } from './_hooks/useConversationContext';
import { useQueryFeedback } from './_hooks/useQueryFeedback';

import NLQueryInterface from './_components/NLQueryInterface';
import QueryInputBar from './_components/QueryInputBar';
import SuggestedQuestions from './_components/SuggestedQuestions';
import QueryResponsePanel from './_components/QueryResponsePanel';
import ConversationThread from './_components/ConversationThread';
import FollowUpSuggestions from './_components/FollowUpSuggestions';

export default function AnalyticsQueryPage() {
  const {
    state,
    setInput,
    submitQuery,
    cancelQuery,
    resetQuery,
    loadSuggestions,
    clearConversation,
  } = useNLQuery();

  const {
    conversation,
    startConversation,
    addTurn,
    endConversation,
    isActive: isConversationActive,
    turnCount,
  } = useConversationContext();

  const { submitRating, hasRated, getRating } = useQueryFeedback();

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (question: string) => {
    if (!isConversationActive) {
      startConversation(question);
    }
    await submitQuery(question);
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    handleSubmit(question);
  };

  const handleFollowUp = (question: string) => {
    setInput(question);
    handleSubmit(question);
  };

  const handleNewConversation = () => {
    resetQuery();
    endConversation();
    clearConversation();
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <NLQueryInterface
        turnCount={turnCount}
        isConversationActive={isConversationActive}
        onNewConversation={handleNewConversation}
      />

      {/* Query input */}
      <QueryInputBar
        value={state.currentInput}
        onChange={setInput}
        onSubmit={handleSubmit}
        onCancel={cancelQuery}
        isSubmitting={state.isSubmitting}
        isStreaming={state.isStreaming}
      />

      {/* Suggested questions (only when no active response) */}
      {!state.currentResponse && !state.isStreaming && state.turns.length === 0 && (
        <SuggestedQuestions
          questions={state.suggestions}
          isLoading={state.suggestionsLoading}
          onSelect={handleSuggestionClick}
        />
      )}

      {/* Conversation thread for multi-turn */}
      {state.turns.length > 1 && (
        <ConversationThread
          turns={state.turns.slice(0, -1)}
          onFollowUp={handleFollowUp}
          hasRated={hasRated}
          getRating={getRating}
          onRate={submitRating}
        />
      )}

      {/* Current response */}
      {(state.isStreaming || state.currentResponse) && (
        <QueryResponsePanel
          response={state.currentResponse}
          streamedText={state.streamedText}
          isStreaming={state.isStreaming}
          error={state.error}
          queryId={state.currentResponse?.queryId ?? null}
          hasRated={hasRated}
          getRating={getRating}
          onRate={submitRating}
        />
      )}

      {/* Follow-up suggestions */}
      {state.currentResponse && !state.isStreaming && (
        <FollowUpSuggestions
          suggestions={state.currentResponse.followUpSuggestions}
          onSelect={handleFollowUp}
        />
      )}

      {/* Error */}
      {state.error && !state.isStreaming && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4">
          <p className="text-sm text-error font-medium">{state.error}</p>
        </div>
      )}
    </div>
  );
}
