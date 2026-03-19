'use client';

import { useReducer, useCallback } from 'react';

import type {
  RevenueCostState,
  RevenueCostAction,
  FinancialFilters,
} from '@/lib/revenue-cost/revenue-cost.types';
import { DEFAULT_FILTERS } from '@/lib/revenue-cost/revenue-cost.constants';
import {
  fetchFinancialSummary,
  fetchRevenueBreakdown,
  fetchCostBreakdown,
} from '@/lib/revenue-cost/revenue-cost.service';

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: RevenueCostState = {
  filters: DEFAULT_FILTERS,
  summary: null,
  revenueBreakdown: [],
  costBreakdown: [],
  variances: [],
  drivers: null,
  narrative: null,
  departmentSummaries: [],
  analysisJobStatus: 'idle',
  drillDownPath: [],
  lastSyncedAt: '',
};

// ─── Reducer ────────────────────────────────────────────────────────────────

function revenueCostReducer(
  state: RevenueCostState,
  action: RevenueCostAction,
): RevenueCostState {
  switch (action.type) {
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };

    case 'SET_REVENUE_BREAKDOWN':
      return { ...state, revenueBreakdown: action.payload };

    case 'SET_COST_BREAKDOWN':
      return { ...state, costBreakdown: action.payload };

    case 'SET_VARIANCES':
      return { ...state, variances: action.payload };

    case 'SET_DRIVERS':
      return { ...state, drivers: action.payload };

    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };

    case 'SET_DEPARTMENT_SUMMARIES':
      return { ...state, departmentSummaries: action.payload };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_ANALYSIS_STATUS':
      return { ...state, analysisJobStatus: action.payload };

    case 'SET_DRILL_DOWN_PATH':
      return { ...state, drillDownPath: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useRevenueCost() {
  const [state, dispatch] = useReducer(revenueCostReducer, initialState);

  const refreshData = useCallback(
    async (filters?: Partial<FinancialFilters>) => {
      const activeFilters = filters ?? state.filters;

      const [summaryResult, revenueResult, costResult] = await Promise.all([
        fetchFinancialSummary(activeFilters),
        fetchRevenueBreakdown(activeFilters),
        fetchCostBreakdown(activeFilters),
      ]);

      dispatch({ type: 'SET_SUMMARY', payload: summaryResult.summary });
      dispatch({
        type: 'SET_DEPARTMENT_SUMMARIES',
        payload: summaryResult.departmentSummaries,
      });
      dispatch({
        type: 'SET_REVENUE_BREAKDOWN',
        payload: revenueResult.components,
      });
      dispatch({
        type: 'SET_COST_BREAKDOWN',
        payload: costResult.components,
      });
    },
    [state.filters],
  );

  return { state, dispatch, refreshData } as const;
}
