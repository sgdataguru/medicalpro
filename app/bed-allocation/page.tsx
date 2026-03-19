'use client';

import { useEffect, useState, useCallback } from 'react';

import { useBedAllocation } from './_hooks/useBedAllocation';
import { useBedForecast } from './_hooks/useBedForecast';
import { useReallocationRecommendations } from './_hooks/useReallocationRecommendations';
import { useCapacityAlerts } from './_hooks/useCapacityAlerts';

import BedAllocationHeader from './_components/BedAllocationHeader';
import BedAllocationSidebar from './_components/BedAllocationSidebar';
import OccupancyRateCard from './_components/OccupancyRateCard';
import ForecastSummaryCard from './_components/ForecastSummaryCard';
import RevenueImpactSummaryCard from './_components/RevenueImpactSummaryCard';
import OccupancyTrendChart from './_components/OccupancyTrendChart';
import DepartmentOccupancyTable from './_components/DepartmentOccupancyTable';
import ReallocationRecommendationPanel from './_components/ReallocationRecommendationPanel';
import CapacityAlertPanel from './_components/CapacityAlertPanel';
import ScenarioComparisonPanel from './_components/ScenarioComparisonPanel';

import { fetchOccupancyTrends } from '@/lib/bed-allocation/bed-allocation.service';
import type { BedAllocationFilters, OccupancyTrendSeries } from '@/lib/bed-allocation/bed-allocation.types';

export default function BedAllocationPage() {
  const { state, dispatch, refreshData } = useBedAllocation();
  const { runForecast, status: forecastStatus } = useBedForecast({
    onComplete: (forecast) => dispatch({ type: 'SET_FORECAST', payload: forecast }),
  });
  const {
    recommendations,
    loadRecommendations,
    approveRecommendation,
    rejectRecommendation,
  } = useReallocationRecommendations();
  const { alerts, loadAlerts, acknowledgeAlert } = useCapacityAlerts();

  const [trends, setTrends] = useState<OccupancyTrendSeries[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [showScenario, setShowScenario] = useState(false);

  const loadTrends = useCallback(async (filters?: BedAllocationFilters) => {
    const result = await fetchOccupancyTrends(filters);
    setTrends(result.trends);
  }, []);

  useEffect(() => {
    refreshData();
    loadRecommendations();
    loadAlerts();
    loadTrends(state.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
    loadRecommendations();
    loadAlerts();
    loadTrends(state.filters);
    setLastUpdated(new Date().toISOString());
  }, [refreshData, loadRecommendations, loadAlerts, loadTrends, state.filters]);

  const handleFilterChange = useCallback(
    (filters: BedAllocationFilters) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      loadTrends(filters);
    },
    [dispatch, loadTrends],
  );

  const handleRunForecast = useCallback(() => {
    const deptIds = state.filters.departmentIds.length > 0
      ? state.filters.departmentIds
      : state.occupancy.map((d) => d.departmentId);
    const days = state.filters.timePeriod === '30d' ? 30 : state.filters.timePeriod === '14d' ? 14 : 7;
    runForecast(deptIds, days);
  }, [runForecast, state.filters, state.occupancy]);

  const handleExport = useCallback(() => {
    // Placeholder: CSV export would be triggered here
    alert('Export functionality coming soon');
  }, []);

  const totalReallocationImpact = recommendations.reduce(
    (sum, r) => sum + r.revenueImpact.monthly,
    0,
  );

  return (
    <div className="space-y-6">
      <BedAllocationHeader
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Filter Panel (formerly sidebar) */}
      <BedAllocationSidebar
        filters={state.filters}
        departments={state.occupancy}
        onFilterChange={handleFilterChange}
        onRunForecast={handleRunForecast}
        forecastJobStatus={forecastStatus}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <OccupancyRateCard
          totalBeds={state.totals.totalBeds}
          occupiedBeds={state.totals.occupiedBeds}
          availableBeds={state.totals.availableBeds}
          occupancyRate={state.totals.overallOccupancyRate}
        />
        <ForecastSummaryCard
          forecast={state.forecast}
          forecastJobStatus={forecastStatus}
        />
        <RevenueImpactSummaryCard
          departments={state.occupancy}
          reallocationImpact={totalReallocationImpact}
        />
      </div>

      {/* Occupancy Trend Chart */}
      <OccupancyTrendChart trends={trends} forecast={state.forecast} />

      {/* Department Occupancy Table */}
      <DepartmentOccupancyTable
        departments={state.occupancy}
        onDepartmentClick={(deptId: string) => {
          console.log('Navigate to department:', deptId);
        }}
      />

      {/* Recommendations and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReallocationRecommendationPanel
          recommendations={recommendations}
          onApprove={approveRecommendation}
          onReject={rejectRecommendation}
        />
        <CapacityAlertPanel
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
        />
      </div>

      {/* Scenario Comparison */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowScenario(!showScenario)}
          className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
        >
          {showScenario ? 'Hide Scenario Comparison' : 'Show Scenario Comparison'}
        </button>
      </div>
      <ScenarioComparisonPanel
        currentOccupancy={state.occupancy}
        recommendations={recommendations}
        visible={showScenario}
      />
    </div>
  );
}
