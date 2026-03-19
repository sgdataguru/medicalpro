import type { InventoryItem, InventoryTotals, RiskLevel, SupplyChainFilters, ProcurementRecommendation } from './supply-chain.types';
import { RISK_THRESHOLDS, RECOMMENDATION_PRIORITY_ORDER } from './supply-chain.constants';

export function calculateDaysToStockout(currentQuantity: number, dailyConsumptionRate: number): number {
  if (dailyConsumptionRate <= 0) return Infinity;
  return Math.round((currentQuantity / dailyConsumptionRate) * 10) / 10;
}

export function getRiskLevel(daysToStockout: number, leadTimeDays: number): RiskLevel {
  if (daysToStockout <= RISK_THRESHOLDS.CRITICAL.maxDaysToStockout) return 'CRITICAL';
  if (daysToStockout <= RISK_THRESHOLDS.WARNING.maxDaysToStockout + leadTimeDays) return 'WARNING';
  if (daysToStockout >= RISK_THRESHOLDS.OVERSTOCK.minDaysToStockout) return 'OVERSTOCK';
  return 'HEALTHY';
}

export function getRiskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    CRITICAL: 'text-red-600',
    WARNING: 'text-amber-600',
    HEALTHY: 'text-emerald-600',
    OVERSTOCK: 'text-blue-600',
  };
  return map[risk];
}

export function getRiskBgColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    CRITICAL: 'bg-red-50',
    WARNING: 'bg-amber-50',
    HEALTHY: 'bg-emerald-50',
    OVERSTOCK: 'bg-blue-50',
  };
  return map[risk];
}

export function formatConsumptionRate(rate: number, unit: string): string {
  if (rate >= 1) return `${Math.round(rate)}/${unit}/day`;
  const weekly = rate * 7;
  return `${Math.round(weekly * 10) / 10}/${unit}/week`;
}

export function formatInventoryValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function calculateTurnoverRate(annualCOGS: number, averageInventoryValue: number): number {
  if (averageInventoryValue <= 0) return 0;
  return Math.round((annualCOGS / averageInventoryValue) * 10) / 10;
}

export function calculateInventoryTotals(items: InventoryItem[]): InventoryTotals {
  return {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
    inventoryTurnover: 4.2, // Mock value
    criticalCount: items.filter(i => i.riskLevel === 'CRITICAL').length,
    warningCount: items.filter(i => i.riskLevel === 'WARNING').length,
    overstockCount: items.filter(i => i.riskLevel === 'OVERSTOCK').length,
    healthyCount: items.filter(i => i.riskLevel === 'HEALTHY').length,
    expiringWithin30Days: items.filter(i => i.daysToExpiration !== null && i.daysToExpiration <= 30).length,
    expiringValueAtRisk: items
      .filter(i => i.daysToExpiration !== null && i.daysToExpiration <= 30)
      .reduce((sum, i) => sum + i.totalValue, 0),
  };
}

export function sortRecommendations(recs: ProcurementRecommendation[]): ProcurementRecommendation[] {
  return [...recs].sort((a, b) => {
    const pa = RECOMMENDATION_PRIORITY_ORDER[a.priority] ?? 99;
    const pb = RECOMMENDATION_PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return b.costImpact.savings - a.costImpact.savings;
  });
}

export function sortInventoryItems(items: InventoryItem[], sortBy: string, direction: 'asc' | 'desc'): InventoryItem[] {
  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'name': cmp = a.itemName.localeCompare(b.itemName); break;
      case 'category': cmp = a.category.localeCompare(b.category); break;
      case 'quantity': cmp = a.currentQuantity - b.currentQuantity; break;
      case 'consumptionRate': cmp = a.dailyConsumptionRate - b.dailyConsumptionRate; break;
      case 'daysToStockout': cmp = a.daysToStockout - b.daysToStockout; break;
      case 'value': cmp = a.totalValue - b.totalValue; break;
      case 'status': {
        const riskOrder: Record<RiskLevel, number> = { CRITICAL: 0, WARNING: 1, HEALTHY: 2, OVERSTOCK: 3 };
        cmp = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]; break;
      }
      default: cmp = 0;
    }
    return cmp;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

export function buildInventoryQueryParams(filters: SupplyChainFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
  if (filters.departmentIds.length > 0) params.set('departments', filters.departmentIds.join(','));
  if (filters.supplierIds.length > 0) params.set('suppliers', filters.supplierIds.join(','));
  if (filters.riskLevels.length > 0) params.set('risk', filters.riskLevels.join(','));
  if (filters.searchQuery) params.set('q', filters.searchQuery);
  params.set('sort', filters.sortBy);
  params.set('dir', filters.sortDirection);
  return params;
}

export function filterInventoryItems(items: InventoryItem[], filters: SupplyChainFilters): InventoryItem[] {
  let filtered = items;

  if (filters.categories.length > 0) {
    filtered = filtered.filter(i => filters.categories.includes(i.category));
  }
  if (filters.departmentIds.length > 0) {
    filtered = filtered.filter(i => filters.departmentIds.includes(i.departmentId));
  }
  if (filters.supplierIds.length > 0) {
    filtered = filtered.filter(i => filters.supplierIds.includes(i.supplierId));
  }
  if (filters.riskLevels.length > 0) {
    filtered = filtered.filter(i => filters.riskLevels.includes(i.riskLevel));
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(i =>
      i.itemName.toLowerCase().includes(q) ||
      i.itemCode.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  }

  return sortInventoryItems(filtered, filters.sortBy, filters.sortDirection);
}

export function formatDaysToStockout(days: number): string {
  if (days === Infinity) return 'N/A';
  if (days < 1) return '<1 day';
  if (days === 1) return '1 day';
  return `${Math.round(days)} days`;
}

export function getExpirationSeverity(daysToExpiration: number): 'CRITICAL' | 'WARNING' | 'INFO' {
  if (daysToExpiration <= 7) return 'CRITICAL';
  if (daysToExpiration <= 30) return 'WARNING';
  return 'INFO';
}
