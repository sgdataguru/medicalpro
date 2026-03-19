'use client';

import { useReducer, useCallback } from 'react';
import type {
  SupplyChainState,
  SupplyChainAction,
  SupplyChainFilters,
} from '@/lib/supply-chain/supply-chain.types';
import { DEFAULT_FILTERS } from '@/lib/supply-chain/supply-chain.constants';
import { fetchInventory } from '@/lib/supply-chain/supply-chain.service';

const initialState: SupplyChainState = {
  filters: DEFAULT_FILTERS,
  inventory: [],
  inventoryTotals: {
    totalItems: 0,
    totalValue: 0,
    inventoryTurnover: 0,
    criticalCount: 0,
    warningCount: 0,
    overstockCount: 0,
    healthyCount: 0,
    expiringWithin30Days: 0,
    expiringValueAtRisk: 0,
  },
  forecast: null,
  recommendations: [],
  expirationAlerts: [],
  forecastJobStatus: 'idle',
  optimizationJobStatus: 'idle',
  lastSyncedAt: null,
};

function reducer(
  state: SupplyChainState,
  action: SupplyChainAction,
): SupplyChainState {
  switch (action.type) {
    case 'SET_INVENTORY':
      return {
        ...state,
        inventory: action.payload.items,
        inventoryTotals: action.payload.totals,
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_FORECAST':
      return {
        ...state,
        forecast: action.payload,
        forecastJobStatus: 'completed',
      };
    case 'SET_FORECAST_STATUS':
      return { ...state, forecastJobStatus: action.payload };
    case 'SET_OPTIMIZATION_STATUS':
      return { ...state, optimizationJobStatus: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'UPDATE_RECOMMENDATION':
      return {
        ...state,
        recommendations: state.recommendations.map((r) =>
          r.recommendationId === action.payload.recommendationId
            ? action.payload
            : r,
        ),
      };
    case 'SET_EXPIRATION_ALERTS':
      return { ...state, expirationAlerts: action.payload };
    case 'UPDATE_EXPIRATION_ALERT':
      return {
        ...state,
        expirationAlerts: state.expirationAlerts.map((a) =>
          a.alertId === action.payload.alertId ? action.payload : a,
        ),
      };
    case 'SET_LAST_SYNCED':
      return { ...state, lastSyncedAt: action.payload };
    default:
      return state;
  }
}

export function useSupplyChain() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshData = useCallback(
    async (filters?: SupplyChainFilters) => {
      const result = await fetchInventory(filters ?? state.filters);
      dispatch({
        type: 'SET_INVENTORY',
        payload: { items: result.items, totals: result.totals },
      });
      dispatch({ type: 'SET_LAST_SYNCED', payload: result.lastSyncedAt });
    },
    [state.filters],
  );

  return { state, dispatch, refreshData };
}
