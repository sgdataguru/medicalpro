'use client';

import { useReducer, useCallback, useRef } from 'react';
import type {
  NLQueryPageState,
  NLQueryReducerAction,
  NLQueryResponse,
  ConversationTurn,
} from '@/lib/analytics-query/analytics-query.types';
import { submitNLQuery, fetchSuggestedQuestions } from '@/lib/analytics-query/analytics-query.service';

const initialState: NLQueryPageState = {
  currentInput: '',
  isSubmitting: false,
  isStreaming: false,
  streamedText: '',
  error: null,
  currentResponse: null,
  activeConversation: null,
  turns: [],
  suggestions: [],
  suggestionsLoading: false,
};

function reducer(state: NLQueryPageState, action: NLQueryReducerAction): NLQueryPageState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, currentInput: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };
    case 'APPEND_STREAM_TEXT':
      return { ...state, streamedText: state.streamedText + action.payload };
    case 'SET_STREAM_TEXT':
      return { ...state, streamedText: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RESPONSE':
      return { ...state, currentResponse: action.payload };
    case 'SET_CONVERSATION':
      return { ...state, activeConversation: action.payload };
    case 'ADD_TURN':
      return { ...state, turns: [...state.turns, action.payload] };
    case 'SET_TURNS':
      return { ...state, turns: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'SET_SUGGESTIONS_LOADING':
      return { ...state, suggestionsLoading: action.payload };
    case 'RESET_QUERY':
      return {
        ...state,
        currentInput: '',
        isSubmitting: false,
        isStreaming: false,
        streamedText: '',
        error: null,
        currentResponse: null,
      };
    default:
      return state;
  }
}

export function useNLQuery() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(false);

  const setInput = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT', payload: text });
  }, []);

  const submitQuery = useCallback(async (questionText: string) => {
    if (!questionText.trim()) return;

    abortRef.current = false;
    dispatch({ type: 'SET_INPUT', payload: questionText });
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'SET_STREAMING', payload: true });
    dispatch({ type: 'SET_STREAM_TEXT', payload: '' });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_RESPONSE', payload: null });

    try {
      const response = await submitNLQuery(
        questionText,
        state.activeConversation?.id,
        (chunk) => {
          if (!abortRef.current) {
            dispatch({ type: 'APPEND_STREAM_TEXT', payload: chunk });
          }
        },
        (finalResponse) => {
          if (!abortRef.current) {
            dispatch({ type: 'SET_RESPONSE', payload: finalResponse });
          }
        },
      );

      if (!abortRef.current) {
        const turn: ConversationTurn = {
          queryId: response.queryId,
          questionText,
          response,
          feedback: null,
          timestamp: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_TURN', payload: turn });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to process query' });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      dispatch({ type: 'SET_STREAMING', payload: false });
    }
  }, [state.activeConversation?.id]);

  const cancelQuery = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'SET_SUBMITTING', payload: false });
    dispatch({ type: 'SET_STREAMING', payload: false });
  }, []);

  const resetQuery = useCallback(() => {
    dispatch({ type: 'RESET_QUERY' });
  }, []);

  const loadSuggestions = useCallback(async () => {
    dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: true });
    try {
      const suggestions = await fetchSuggestedQuestions();
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
    } finally {
      dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: false });
    }
  }, []);

  const clearConversation = useCallback(() => {
    dispatch({ type: 'SET_TURNS', payload: [] });
    dispatch({ type: 'SET_CONVERSATION', payload: null });
    dispatch({ type: 'RESET_QUERY' });
  }, []);

  return {
    state,
    dispatch,
    setInput,
    submitQuery,
    cancelQuery,
    resetQuery,
    loadSuggestions,
    clearConversation,
  };
}
