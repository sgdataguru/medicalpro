// Supply Chain Module - Type Definitions
// All TypeScript types and interfaces for inventory, forecasting, procurement, and expiration tracking.

// ---------------------------------------------------------------------------
// Type Aliases
// ---------------------------------------------------------------------------

export type SupplyCategory =
  | 'DISPOSABLES'
  | 'MEDICATIONS'
  | 'PPE'
  | 'IMAGING'
  | 'SURGICAL'
  | 'LAB'
  | 'EQUIPMENT'
  | 'NUTRITIONAL';

export type RiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OVERSTOCK';

export type InventorySortField =
  | 'name'
  | 'category'
  | 'quantity'
  | 'consumptionRate'
  | 'daysToStockout'
  | 'value'
  | 'status';

export type ConsumptionTrendDirection = 'RISING' | 'STABLE' | 'DECLINING';

export type RecommendationType =
  | 'REORDER'
  | 'INCREASE_PAR'
  | 'DECREASE_PAR'
  | 'CONSOLIDATE_ORDERS'
  | 'SWITCH_SUPPLIER'
  | 'BULK_DISCOUNT';

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'ADJUSTED' | 'DISMISSED';

export type ExpirationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ExpirationAction = 'USE_FIRST' | 'TRANSFER' | 'RETURN_TO_SUPPLIER' | 'DISPOSE';

export type ExpirationActionTaken =
  | 'NONE'
  | 'PRIORITIZED'
  | 'TRANSFERRED'
  | 'RETURNED'
  | 'DISPOSED';

export type AnomalyType = 'SPIKE' | 'DROP' | 'TREND_CHANGE' | 'UNUSUAL_PATTERN';

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ForecastJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export type OptimizationJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

// ---------------------------------------------------------------------------
// Interfaces - Filters
// ---------------------------------------------------------------------------

export interface SupplyChainFilters {
  categories: SupplyCategory[];
  departmentIds: string[];
  supplierIds: string[];
  riskLevels: RiskLevel[];
  searchQuery: string;
  sortBy: InventorySortField;
  sortDirection: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Interfaces - Inventory
// ---------------------------------------------------------------------------

export interface InventoryItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: SupplyCategory;
  departmentId: string;
  departmentName: string;
  currentQuantity: number;
  unit: string;
  reorderPoint: number;
  reorderQuantity: number;
  parLevel: number;
  dailyConsumptionRate: number;
  weeklyConsumptionRate: number;
  daysToStockout: number;
  riskLevel: RiskLevel;
  unitCost: number;
  totalValue: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  lastOrderDate: string;
  lastReceivedDate: string;
  expirationDate: string | null;
  daysToExpiration: number | null;
  lotNumber: string | null;
  storageLocation: string;
  consumptionTrend: ConsumptionTrendDirection;
  consumptionVariance: number;
}

export interface InventoryTotals {
  totalItems: number;
  totalValue: number;
  inventoryTurnover: number;
  criticalCount: number;
  warningCount: number;
  overstockCount: number;
  healthyCount: number;
  expiringWithin30Days: number;
  expiringValueAtRisk: number;
}

// ---------------------------------------------------------------------------
// Interfaces - Forecasting
// ---------------------------------------------------------------------------

export interface SupplyDemandForecast {
  forecastId: string;
  generatedAt: string;
  horizonDays: number;
  confidence: number;
  modelVersion: string;
  categoryForecasts: CategoryForecast[];
  anomalies: ConsumptionAnomaly[];
}

export interface CategoryForecast {
  category: SupplyCategory;
  dailyForecasts: DailyConsumptionForecast[];
}

export interface DailyConsumptionForecast {
  date: string;
  predictedConsumption: number;
  confidenceInterval: { lower: number; upper: number };
  driverFactors: {
    patientVolume: number;
    scheduledProcedures: number;
    seasonalFactor: number;
  };
}

export interface ConsumptionAnomaly {
  anomalyId: string;
  itemId: string;
  itemName: string;
  detectedDate: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  expectedValue: number;
  actualValue: number;
  deviationPercentage: number;
}

// ---------------------------------------------------------------------------
// Interfaces - Procurement Recommendations
// ---------------------------------------------------------------------------

export interface ProcurementRecommendation {
  recommendationId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: RecommendationType;
  itemId: string;
  itemName: string;
  itemCode: string;
  category: SupplyCategory;
  description: string;
  rationale: string;
  currentValue: number;
  recommendedValue: number;
  costImpact: {
    currentAnnualCost: number;
    projectedAnnualCost: number;
    savings: number;
    savingsPercentage: number;
  };
  stockoutRiskReduction: {
    currentRisk: number;
    projectedRisk: number;
  };
  supplierInfo: {
    supplierId: string;
    supplierName: string;
    unitPrice: number;
    leadTimeDays: number;
    minimumOrderQuantity: number;
  };
  suggestedOrderDetails?: {
    quantity: number;
    estimatedCost: number;
    estimatedDeliveryDate: string;
  };
  status: RecommendationStatus;
  adjustedQuantity?: number;
  dismissalReason?: string;
}

// ---------------------------------------------------------------------------
// Interfaces - Expiration Alerts
// ---------------------------------------------------------------------------

export interface ExpirationAlert {
  alertId: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  category: SupplyCategory;
  lotNumber: string;
  expirationDate: string;
  daysToExpiration: number;
  quantity: number;
  valueAtRisk: number;
  storageLocation: string;
  departmentId: string;
  departmentName: string;
  severity: ExpirationSeverity;
  suggestedAction: ExpirationAction;
  actionTaken: ExpirationActionTaken;
}

// ---------------------------------------------------------------------------
// Interfaces - Consumption Trends
// ---------------------------------------------------------------------------

export interface ConsumptionTrendData {
  category: SupplyCategory;
  dataPoints: {
    date: string;
    actualConsumption: number;
    predictedConsumption?: number;
    cost: number;
  }[];
}

// ---------------------------------------------------------------------------
// State & Actions (Reducer Pattern)
// ---------------------------------------------------------------------------

export interface SupplyChainState {
  filters: SupplyChainFilters;
  inventory: InventoryItem[];
  inventoryTotals: InventoryTotals;
  forecast: SupplyDemandForecast | null;
  recommendations: ProcurementRecommendation[];
  expirationAlerts: ExpirationAlert[];
  forecastJobStatus: ForecastJobStatus;
  optimizationJobStatus: OptimizationJobStatus;
  lastSyncedAt: string | null;
}

export type SupplyChainAction =
  | { type: 'SET_INVENTORY'; payload: { items: InventoryItem[]; totals: InventoryTotals } }
  | { type: 'SET_FILTERS'; payload: Partial<SupplyChainFilters> }
  | { type: 'SET_FORECAST'; payload: SupplyDemandForecast }
  | { type: 'SET_FORECAST_STATUS'; payload: ForecastJobStatus }
  | { type: 'SET_OPTIMIZATION_STATUS'; payload: OptimizationJobStatus }
  | { type: 'SET_RECOMMENDATIONS'; payload: ProcurementRecommendation[] }
  | { type: 'UPDATE_RECOMMENDATION'; payload: ProcurementRecommendation }
  | { type: 'SET_EXPIRATION_ALERTS'; payload: ExpirationAlert[] }
  | { type: 'UPDATE_EXPIRATION_ALERT'; payload: ExpirationAlert }
  | { type: 'SET_LAST_SYNCED'; payload: string };
