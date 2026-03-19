import { useReducer, useCallback } from 'react';
import type {
  Recommendation,
  RecommendationFilterState,
  RecommendationPageState,
  RecommendationReducerAction,
} from '@/lib/recommendations/recommendations.types';
import { DEFAULT_FILTERS } from '@/lib/recommendations/recommendations.constants';
import { sortRecommendations } from '@/lib/recommendations/recommendations.utils';
import { fetchRecommendations } from '@/lib/recommendations/recommendations.service';

const initialState: RecommendationPageState = {
  recommendations: [],
  totalCount: 0,
  newCount: 0,
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  selectedRecommendation: null,
  isDetailOpen: false,
  relatedRecommendations: [],
  simulationPreview: null,
  isProcessing: false,
  pendingAction: null,
};

function reducer(
  state: RecommendationPageState,
  action: RecommendationReducerAction,
): RecommendationPageState {
  switch (action.type) {
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'UPDATE_RECOMMENDATION':
      return {
        ...state,
        recommendations: state.recommendations.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r,
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SELECTED':
      return { ...state, selectedRecommendation: action.payload };
    case 'SET_DETAIL_OPEN':
      return { ...state, isDetailOpen: action.payload };
    case 'SET_RELATED':
      return { ...state, relatedRecommendations: action.payload };
    case 'SET_SIMULATION_PREVIEW':
      return { ...state, simulationPreview: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_PENDING_ACTION':
      return { ...state, pendingAction: action.payload };
    case 'SET_COUNTS':
      return { ...state, totalCount: action.payload.totalCount, newCount: action.payload.newCount };
    default:
      return state;
  }
}

export function useRecommendations() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadRecommendations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const result = await fetchRecommendations(state.filters);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: result.recommendations });
      dispatch({ type: 'SET_COUNTS', payload: { totalCount: result.totalCount, newCount: result.newCount } });
    } catch (err: unknown) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load recommendations',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const filteredRecommendations = sortRecommendations(
    state.recommendations,
    state.filters.sortBy,
    state.filters.sortOrder,
  );

  const selectRecommendation = useCallback((recommendation: Recommendation | null) => {
    dispatch({ type: 'SET_SELECTED', payload: recommendation });
    dispatch({ type: 'SET_DETAIL_OPEN', payload: recommendation !== null });
  }, []);

  const updateFilters = useCallback((partial: Partial<RecommendationFilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: partial });
  }, []);

  const updateRecommendation = useCallback((update: Partial<Recommendation> & { id: string }) => {
    dispatch({ type: 'UPDATE_RECOMMENDATION', payload: update });
  }, []);

  return {
    state,
    dispatch,
    loadRecommendations,
    filteredRecommendations,
    selectRecommendation,
    updateFilters,
    updateRecommendation,
  };
}
