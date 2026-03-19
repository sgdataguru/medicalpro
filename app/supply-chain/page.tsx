'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import { useSupplyChain } from './_hooks/useSupplyChain';
import { useInventoryForecast } from './_hooks/useInventoryForecast';
import { useSupplyRecommendations } from './_hooks/useSupplyRecommendations';
import { useExpirationTracking } from './_hooks/useExpirationTracking';

import SupplyChainHeader from './_components/SupplyChainHeader';
import SupplyChainSidebar from './_components/SupplyChainSidebar';
import InventoryHealthCard from './_components/InventoryHealthCard';
import StockoutRiskCard from './_components/StockoutRiskCard';
import CostSavingsOpportunityCard from './_components/CostSavingsOpportunityCard';
import InventoryRiskMatrix from './_components/InventoryRiskMatrix';
import InventoryTable from './_components/InventoryTable';
import OptimizationRecommendationPanel from './_components/OptimizationRecommendationPanel';
import ExpirationTracker from './_components/ExpirationTracker';
import ConsumptionTrendChart from './_components/ConsumptionTrendChart';

import { fetchConsumptionTrends } from '@/lib/supply-chain/supply-chain.service';
import { filterInventoryItems } from '@/lib/supply-chain/supply-chain.utils';
import { ITEMS_PER_PAGE } from '@/lib/supply-chain/supply-chain.constants';
import type {
  SupplyChainFilters,
  InventorySortField,
  ConsumptionTrendData,
  ConsumptionAnomaly,
  ExpirationAction,
  SupplyDemandForecast,
} from '@/lib/supply-chain/supply-chain.types';

export default function SupplyChainPage() {
  const { state, dispatch, refreshData } = useSupplyChain();
  const { status: forecastStatus, runForecast } = useInventoryForecast({
    onComplete: (forecast) => dispatch({ type: 'SET_FORECAST', payload: forecast as SupplyDemandForecast }),
  });
  const {
    recommendations,
    summary: recSummary,
    loadRecommendations,
    approveRecommendation,
    adjustRecommendation,
    dismissRecommendation,
  } = useSupplyRecommendations();
  const {
    alerts,
    activeWindow,
    setActiveWindow,
    loadAlerts,
    takeAction,
  } = useExpirationTracking();

  const [trends, setTrends] = useState<ConsumptionTrendData[]>([]);
  const [anomalies, setAnomalies] = useState<ConsumptionAnomaly[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');

  // Load initial data
  useEffect(() => {
    refreshData();
    loadRecommendations();
    loadAlerts();
    loadTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrends = useCallback(async () => {
    const result = await fetchConsumptionTrends(
      state.filters.categories.length > 0 ? state.filters.categories : ['DISPOSABLES', 'MEDICATIONS', 'PPE'],
      '14d',
    );
    setTrends(result.trends);
    setAnomalies(result.anomalies);
  }, [state.filters.categories]);

  const handleSync = useCallback(() => {
    refreshData();
    loadRecommendations();
    loadAlerts();
    loadTrends();
  }, [refreshData, loadRecommendations, loadAlerts, loadTrends]);

  const handleExport = useCallback(() => {
    alert('Export functionality coming soon');
  }, []);

  const handleFilterChange = useCallback(
    (filters: SupplyChainFilters) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      setCurrentPage(1);
    },
    [dispatch],
  );

  const handleSortChange = useCallback(
    (field: InventorySortField) => {
      const newDirection =
        state.filters.sortBy === field && state.filters.sortDirection === 'asc'
          ? 'desc'
          : 'asc';
      dispatch({
        type: 'SET_FILTERS',
        payload: { sortBy: field, sortDirection: newDirection },
      });
    },
    [dispatch, state.filters.sortBy, state.filters.sortDirection],
  );

  const handleSearchChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      dispatch({ type: 'SET_FILTERS', payload: { searchQuery: q } });
      setCurrentPage(1);
    },
    [dispatch],
  );

  const handleRunForecast = useCallback(() => {
    const categories = state.filters.categories.length > 0
      ? state.filters.categories
      : ['DISPOSABLES', 'MEDICATIONS', 'PPE', 'SURGICAL'] as const;
    runForecast([...categories], 14);
  }, [runForecast, state.filters.categories]);

  const handleOptimizeOrders = useCallback(async () => {
    setOptimizationStatus('processing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOptimizationStatus('completed');
    loadRecommendations();
  }, [loadRecommendations]);

  const handleExpirationAction = useCallback(
    (alertId: string, action: ExpirationAction) => {
      takeAction(alertId, action);
    },
    [takeAction],
  );

  // Filter and paginate inventory
  const filteredItems = useMemo(
    () => filterInventoryItems(state.inventory, { ...state.filters, searchQuery }),
    [state.inventory, state.filters, searchQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredItems, currentPage],
  );

  // Derive unique departments and suppliers from inventory for sidebar
  const departments = useMemo(() => {
    const map = new Map<string, string>();
    state.inventory.forEach((i) => map.set(i.departmentId, i.departmentName));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [state.inventory]);

  const suppliers = useMemo(() => {
    const map = new Map<string, string>();
    state.inventory.forEach((i) => map.set(i.supplierId, i.supplierName));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [state.inventory]);

  // Compute average days to stockout for critical+warning items
  const avgDaysToStockout = useMemo(() => {
    const atRisk = state.inventory.filter(
      (i) => i.riskLevel === 'CRITICAL' || i.riskLevel === 'WARNING',
    );
    if (atRisk.length === 0) return 0;
    return Math.round(
      atRisk.reduce((sum, i) => sum + i.daysToStockout, 0) / atRisk.length,
    );
  }, [state.inventory]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)]">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <SupplyChainSidebar
          filters={state.filters}
          departments={departments}
          suppliers={suppliers}
          onFilterChange={handleFilterChange}
          onRunForecast={handleRunForecast}
          onOptimizeOrders={handleOptimizeOrders}
          forecastJobStatus={forecastStatus}
          optimizationJobStatus={optimizationStatus}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <SupplyChainHeader
          lastSyncedAt={state.lastSyncedAt}
          onSync={handleSync}
          onExport={handleExport}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <InventoryHealthCard
            totalItems={state.inventoryTotals.totalItems}
            totalValue={state.inventoryTotals.totalValue}
            inventoryTurnover={state.inventoryTotals.inventoryTurnover}
          />
          <StockoutRiskCard
            criticalCount={state.inventoryTotals.criticalCount}
            warningCount={state.inventoryTotals.warningCount}
            avgDaysToStockout={avgDaysToStockout}
          />
          <CostSavingsOpportunityCard
            potentialAnnualSavings={recSummary?.totalPotentialSavings ?? 0}
            currentAnnualSpend={8_600_000}
            recommendationCount={recSummary?.total ?? 0}
          />
        </div>

        {/* Inventory Risk Matrix */}
        <InventoryRiskMatrix
          items={filteredItems}
          onItemClick={(itemId: string) => {
            console.log('Navigate to item:', itemId);
          }}
        />

        {/* Inventory Table */}
        <InventoryTable
          items={paginatedItems}
          onItemClick={(itemId: string) => {
            console.log('Navigate to item detail:', itemId);
          }}
          sortBy={state.filters.sortBy}
          sortDirection={state.filters.sortDirection}
          onSortChange={handleSortChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Recommendations and Expiration Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OptimizationRecommendationPanel
            recommendations={recommendations}
            onApprove={approveRecommendation}
            onAdjust={adjustRecommendation}
            onDismiss={dismissRecommendation}
          />
          <ExpirationTracker
            alerts={alerts}
            onAction={handleExpirationAction}
            activeWindow={activeWindow}
            onWindowChange={setActiveWindow}
          />
        </div>

        {/* Consumption Trends */}
        <ConsumptionTrendChart
          trends={trends}
          anomalies={anomalies}
          onAnomalyClick={(anomalyId: string) => {
            console.log('Anomaly clicked:', anomalyId);
          }}
        />
      </main>
    </div>
  );
}
