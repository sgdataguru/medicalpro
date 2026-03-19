'use client';

import { useReducer, useCallback } from 'react';
import type {
  StaffAllocationState,
  StaffAllocationReducerAction,
  StaffAllocationFilters,
  StaffingTotals,
} from '@/lib/staff-allocation/staff-allocation.types';
import {
  fetchCurrentStaffing,
  fetchOvertimeProjections,
  fetchCoverageGaps,
} from '@/lib/staff-allocation/staff-allocation.service';
import { DEFAULT_FILTERS } from '@/lib/staff-allocation/staff-allocation.constants';

const initialState: StaffAllocationState = {
  filters: DEFAULT_FILTERS,
  currentStaffing: [],
  predictions: null,
  recommendations: [],
  predictionJobStatus: 'idle',
  compareMode: false,
  totals: { totalOnDuty: 0, totalRequired: 0, overallCoverage: 0, departmentCount: 0 },
  overtimeProjections: [],
  coverageGaps: [],
  loading: false,
  error: null,
};

function reducer(state: StaffAllocationState, action: StaffAllocationReducerAction): StaffAllocationState {
  switch (action.type) {
    case 'SET_DEPARTMENTS':
      return { ...state, currentStaffing: action.payload };
    case 'SET_TOTALS':
      return { ...state, totals: action.payload };
    case 'SET_PREDICTION':
      return { ...state, predictions: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'UPDATE_RECOMMENDATION':
      return {
        ...state,
        recommendations: state.recommendations.map((r) =>
          r.recommendationId === action.payload.recommendationId ? action.payload : r,
        ),
      };
    case 'SET_OVERTIME_PROJECTIONS':
      return { ...state, overtimeProjections: action.payload };
    case 'SET_COVERAGE_GAPS':
      return { ...state, coverageGaps: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PREDICTION_STATUS':
      return { ...state, predictionJobStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_COMPARE_MODE':
      return { ...state, compareMode: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useStaffAllocation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadStaffing = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const [staffingResult, overtimeResult, gapsResult] = await Promise.all([
        fetchCurrentStaffing(),
        fetchOvertimeProjections(),
        fetchCoverageGaps(),
      ]);
      dispatch({ type: 'SET_DEPARTMENTS', payload: staffingResult.departments });
      dispatch({ type: 'SET_TOTALS', payload: staffingResult.totals });
      dispatch({ type: 'SET_OVERTIME_PROJECTIONS', payload: overtimeResult.projections });
      dispatch({ type: 'SET_COVERAGE_GAPS', payload: gapsResult.gaps });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load staffing data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateFilters = useCallback((partial: Partial<StaffAllocationFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: partial });
  }, []);

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'SET_COMPARE_MODE', payload: !state.compareMode });
  }, [state.compareMode]);

  return { state, dispatch, loadStaffing, updateFilters, toggleCompareMode };
}
