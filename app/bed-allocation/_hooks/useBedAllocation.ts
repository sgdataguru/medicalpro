'use client';

import { useReducer, useCallback } from 'react';
import type {
  BedAllocationState,
  BedAllocationFilters,
  BedDemandForecast,
  ReallocationRecommendation,
  CapacityAlert,
  DepartmentOccupancy,
  ForecastJobStatus,
} from '@/lib/bed-allocation/bed-allocation.types';
import {
  fetchOccupancyData,
  fetchRecommendations,
  fetchCapacityAlerts,
} from '@/lib/bed-allocation/bed-allocation.service';
import { DEFAULT_FILTERS } from '@/lib/bed-allocation/bed-allocation.constants';
import { calculateOccupancyTotals } from '@/lib/bed-allocation/bed-allocation.utils';

type BedAllocationAction =
  | { type: 'SET_OCCUPANCY'; payload: DepartmentOccupancy[] }
  | { type: 'SET_FORECAST'; payload: BedDemandForecast | null }
  | { type: 'SET_RECOMMENDATIONS'; payload: ReallocationRecommendation[] }
  | { type: 'SET_ALERTS'; payload: CapacityAlert[] }
  | { type: 'SET_FILTERS'; payload: BedAllocationFilters }
  | { type: 'SET_FORECAST_STATUS'; payload: ForecastJobStatus }
  | { type: 'SET_TOTALS'; payload: BedAllocationState['totals'] };

const initialState: BedAllocationState = {
  filters: DEFAULT_FILTERS,
  occupancy: [],
  forecast: null,
  recommendations: [],
  capacityAlerts: [],
  forecastJobStatus: 'idle',
  totals: {
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    overallOccupancyRate: 0,
  },
};

function reducer(state: BedAllocationState, action: BedAllocationAction): BedAllocationState {
  switch (action.type) {
    case 'SET_OCCUPANCY':
      return { ...state, occupancy: action.payload };
    case 'SET_FORECAST':
      return { ...state, forecast: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_ALERTS':
      return { ...state, capacityAlerts: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_FORECAST_STATUS':
      return { ...state, forecastJobStatus: action.payload };
    case 'SET_TOTALS':
      return { ...state, totals: action.payload };
    default:
      return state;
  }
}

export function useBedAllocation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshData = useCallback(async () => {
    const [occupancyResult, recommendationsResult, alertsResult] = await Promise.all([
      fetchOccupancyData(state.filters),
      fetchRecommendations(),
      fetchCapacityAlerts(),
    ]);

    dispatch({ type: 'SET_OCCUPANCY', payload: occupancyResult.departments });
    dispatch({ type: 'SET_TOTALS', payload: calculateOccupancyTotals(occupancyResult.departments) });
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendationsResult.recommendations });
    dispatch({ type: 'SET_ALERTS', payload: alertsResult.alerts });
  }, [state.filters]);

  return { state, dispatch, refreshData };
}
