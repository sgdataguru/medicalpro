'use client';

import { useReducer, useCallback, useRef } from 'react';
import type {
  AnomalyAlert,
  AnomalyFilterState,
  AnomalyAction,
  AnomalyGlobalState,
} from '@/lib/anomaly/anomaly.types';
import { DEFAULT_FILTERS } from '@/lib/anomaly/anomaly.constants';
import { filterAnomalies } from '@/lib/anomaly/anomaly.utils';
import { fetchAnomalies } from '@/lib/anomaly/anomaly.service';

const initialState: AnomalyGlobalState = {
  alerts: [],
  activeAlertId: null,
  filters: DEFAULT_FILTERS,
  stats: { critical: 0, warning: 0, informational: 0, resolved: 0, meanTimeToAcknowledge: 0, meanTimeToResolve: 0, anomaliesLast24h: 0, anomaliesLast7d: 0 },
  loading: false,
  realtimeConnected: false,
  unreadCount: 0,
  hasMore: false,
};

function reducer(state: AnomalyGlobalState, action: AnomalyAction): AnomalyGlobalState {
  switch (action.type) {
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'APPEND_ALERTS':
      return { ...state, alerts: [...state.alerts, ...action.payload] };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts], unreadCount: state.unreadCount + 1 };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a,
        ),
      };
    case 'SET_ACTIVE_ALERT':
      return { ...state, activeAlertId: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REALTIME_CONNECTED':
      return { ...state, realtimeConnected: action.payload };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'INCREMENT_UNREAD':
      return { ...state, unreadCount: state.unreadCount + 1 };
    case 'RESET_UNREAD':
      return { ...state, unreadCount: 0 };
    default:
      return state;
  }
}

export function useAnomalyFeed() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pageRef = useRef(1);

  const loadAlerts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    pageRef.current = 1;
    try {
      const result = await fetchAnomalies({ ...state.filters, page: 1 });
      dispatch({ type: 'SET_ALERTS', payload: result.alerts });
      dispatch({ type: 'SET_STATS', payload: result.stats });
      dispatch({ type: 'SET_HAS_MORE', payload: result.hasMore });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    const nextPage = pageRef.current + 1;
    try {
      const result = await fetchAnomalies({ ...state.filters, page: nextPage });
      dispatch({ type: 'APPEND_ALERTS', payload: result.alerts });
      dispatch({ type: 'SET_HAS_MORE', payload: result.hasMore });
      pageRef.current = nextPage;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, state.loading, state.hasMore]);

  const filteredAlerts = filterAnomalies(state.alerts, state.filters);

  const selectAlert = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ALERT', payload: id });
    if (id) dispatch({ type: 'RESET_UNREAD' });
  }, []);

  const updateFilters = useCallback((partial: Partial<AnomalyFilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: partial });
  }, []);

  const updateAlert = useCallback((update: Partial<AnomalyAlert> & { id: string }) => {
    dispatch({ type: 'UPDATE_ALERT', payload: update });
  }, []);

  return {
    state,
    dispatch,
    loadAlerts,
    loadMore,
    filteredAlerts,
    selectAlert,
    updateFilters,
    updateAlert,
  };
}
