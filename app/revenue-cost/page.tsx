'use client';

import { useEffect, useCallback } from 'react';

import { useRevenueCost } from './_hooks/useRevenueCost';
import { useFinancialAnalysis } from './_hooks/useFinancialAnalysis';
import { useVarianceAnalysis } from './_hooks/useVarianceAnalysis';

import RevenueCostHeader from './_components/RevenueCostHeader';
import RevenueCostSidebar from './_components/RevenueCostSidebar';
import AIFinancialNarrative from './_components/AIFinancialNarrative';
import TotalRevenueCard from './_components/TotalRevenueCard';
import TotalCostCard from './_components/TotalCostCard';
import NetMarginCard from './_components/NetMarginCard';
import RevenueWaterfallChart from './_components/RevenueWaterfallChart';
import CostBreakdownTreemap from './_components/CostBreakdownTreemap';
import VarianceAnalysisTable from './_components/VarianceAnalysisTable';
import TopDriversPanel from './_components/TopDriversPanel';
import DepartmentComparisonChart from './_components/DepartmentComparisonChart';

import type { FinancialFilters } from '@/lib/revenue-cost/revenue-cost.types';

export default function RevenueCostPage() {
  const { state, dispatch, refreshData } = useRevenueCost();
  const { status: analysisStatus, runAnalysis } = useFinancialAnalysis({
    onComplete: (drivers, narrative) => {
      dispatch({ type: 'SET_DRIVERS', payload: drivers });
      dispatch({ type: 'SET_NARRATIVE', payload: narrative });
      dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'completed' });
    },
  });
  const {
    variances,
    loading: variancesLoading,
    loadVariances,
  } = useVarianceAnalysis();

  useEffect(() => {
    refreshData();
    loadVariances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
    loadVariances();
  }, [refreshData, loadVariances]);

  const handleFilterChange = useCallback(
    (partial: Partial<FinancialFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: partial });
    },
    [dispatch],
  );

  const handleRunAnalysis = useCallback(() => {
    dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'queued' });
    runAnalysis();
  }, [dispatch, runAnalysis]);

  const handleExport = useCallback(() => {
    alert('Export functionality coming soon');
  }, []);

  const handleRegenerate = useCallback(() => {
    dispatch({ type: 'SET_NARRATIVE', payload: null });
    dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'queued' });
    runAnalysis();
  }, [dispatch, runAnalysis]);

  const departments = state.departmentSummaries.map((d) => ({
    id: d.departmentId,
    name: d.departmentName,
  }));

  const comparisonTotal = state.summary
    ? state.summary.totalRevenue - state.summary.revenueYoYChange
    : 0;

  const priorMargin = state.summary
    ? state.summary.netMarginPercentage -
      (state.summary.revenueYoYPercentage - state.summary.costYoYPercentage)
    : 0;

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)]">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <RevenueCostSidebar
          filters={state.filters}
          departments={departments}
          onFilterChange={handleFilterChange}
          onRunAnalysis={handleRunAnalysis}
          onExportReport={handleExport}
          analysisJobStatus={analysisStatus}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <RevenueCostHeader
          periodLabel={state.summary?.periodLabel ?? 'Loading...'}
          lastSyncedAt={state.lastSyncedAt}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* AI Financial Narrative */}
        <AIFinancialNarrative
          narrative={state.narrative}
          isLoading={analysisStatus === 'queued' || analysisStatus === 'processing'}
          onRegenerate={handleRegenerate}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <TotalRevenueCard
            totalRevenue={state.summary?.totalRevenue ?? 0}
            yoyChange={state.summary?.revenueYoYChange ?? 0}
            yoyPercentage={state.summary?.revenueYoYPercentage ?? 0}
            budgetVariance={state.summary?.revenueBudgetVariance ?? 0}
            budgetVariancePercentage={state.summary?.revenueBudgetVariancePercentage ?? 0}
          />
          <TotalCostCard
            totalCost={state.summary?.totalCost ?? 0}
            yoyChange={state.summary?.costYoYChange ?? 0}
            yoyPercentage={state.summary?.costYoYPercentage ?? 0}
            budgetVariance={state.summary?.costBudgetVariance ?? 0}
            budgetVariancePercentage={state.summary?.costBudgetVariancePercentage ?? 0}
          />
          <NetMarginCard
            marginPercentage={state.summary?.netMarginPercentage ?? 0}
            marginTrend={state.summary?.marginTrend ?? []}
            priorMargin={priorMargin}
            budgetMargin={state.summary ? state.summary.netMarginPercentage + 0.4 : 0}
          />
        </div>

        {/* Revenue Waterfall Chart */}
        <RevenueWaterfallChart
          components={state.revenueBreakdown}
          comparisonTotal={comparisonTotal}
          currentTotal={state.summary?.totalRevenue ?? 0}
          onBarClick={(componentId: string) => {
            console.log('Drill down to component:', componentId);
          }}
        />

        {/* Cost Breakdown Treemap */}
        <CostBreakdownTreemap
          components={state.costBreakdown}
          onCellClick={(componentId: string) => {
            console.log('Drill down to cost category:', componentId);
          }}
        />

        {/* Variance Analysis Table */}
        <VarianceAnalysisTable
          variances={variancesLoading ? [] : variances}
          onRowClick={(varianceId: string) => {
            console.log('Open variance detail:', varianceId);
          }}
          threshold={state.filters.varianceThreshold}
        />

        {/* Drivers and Department Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopDriversPanel
            drivers={state.drivers}
            onDriverClick={(driverId: string) => {
              console.log('Open driver detail:', driverId);
            }}
          />
          <DepartmentComparisonChart
            departments={state.departmentSummaries}
            onDepartmentClick={(deptId: string) => {
              console.log('Navigate to department:', deptId);
            }}
          />
        </div>
      </main>
    </div>
  );
}
