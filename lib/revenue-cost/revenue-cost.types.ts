// ─── Type Aliases ───────────────────────────────────────────────────────────

export type TimePeriodType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export type ComparisonBase = 'PRIOR_YEAR' | 'BUDGET' | 'PRIOR_QUARTER' | 'CUSTOM';

export type CostCategory =
  | 'STAFFING'
  | 'SUPPLIES'
  | 'EQUIPMENT'
  | 'OVERHEAD'
  | 'FACILITIES'
  | 'PHARMACEUTICALS'
  | 'INSURANCE'
  | 'DEPRECIATION'
  | 'OTHER';

export type RevenueCategory =
  | 'INPATIENT'
  | 'OUTPATIENT'
  | 'SURGICAL'
  | 'EMERGENCY'
  | 'PHARMACY'
  | 'IMAGING'
  | 'LABORATORY'
  | 'REHABILITATION'
  | 'OTHER';

export type VarianceSeverity = 'CRITICAL' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR';

export type VarianceDirection = 'FAVORABLE' | 'UNFAVORABLE';

export type DriverDirection = 'INCREASE' | 'DECREASE';

export type CostTrend = 'RISING' | 'STABLE' | 'DECLINING';

export type DrillDownLevel = 'TOTAL' | 'CATEGORY' | 'DEPARTMENT' | 'LINE_ITEM';

export type AnalysisJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface FinancialFilters {
  timePeriod: TimePeriodType;
  dateRange: { start: string; end: string };
  comparisonBase: ComparisonBase;
  comparisonDateRange?: { start: string; end: string };
  departmentIds: string[];
  costCategories: CostCategory[];
  varianceThreshold: number;
}

export interface MonthlyMargin {
  month: string;
  marginPercentage: number;
}

export interface FinancialSummary {
  periodLabel: string;
  totalRevenue: number;
  totalCost: number;
  netIncome: number;
  netMarginPercentage: number;
  revenueYoYChange: number;
  revenueYoYPercentage: number;
  costYoYChange: number;
  costYoYPercentage: number;
  revenueBudgetVariance: number;
  revenueBudgetVariancePercentage: number;
  costBudgetVariance: number;
  costBudgetVariancePercentage: number;
  marginTrend: MonthlyMargin[];
  comparisonPeriodLabel: string;
}

export interface RevenueComponent {
  componentId: string;
  name: string;
  category: RevenueCategory;
  departmentId: string;
  departmentName: string;
  currentAmount: number;
  comparisonAmount: number;
  delta: number;
  deltaPercentage: number;
  contributionPercentage: number;
  isPositive: boolean;
  subComponents?: RevenueComponent[];
}

export interface CostComponent {
  componentId: string;
  name: string;
  category: CostCategory;
  departmentId?: string;
  departmentName?: string;
  currentAmount: number;
  comparisonAmount: number;
  delta: number;
  deltaPercentage: number;
  percentageOfTotal: number;
  trend: CostTrend;
  trendPercentage: number;
  subComponents?: CostComponent[];
  budgetAmount?: number;
  budgetVariance?: number;
  budgetVariancePercentage?: number;
}

export interface VarianceRecord {
  varianceId: string;
  lineItem: string;
  lineItemCode: string;
  departmentId: string;
  departmentName: string;
  category: CostCategory | RevenueCategory;
  type: 'REVENUE' | 'COST';
  actualAmount: number;
  budgetAmount: number;
  priorYearAmount: number;
  varianceToBudget: number;
  varianceToBudgetPercentage: number;
  varianceToPriorYear: number;
  varianceToPriorYearPercentage: number;
  severity: VarianceSeverity;
  direction: VarianceDirection;
  flagged: boolean;
  rootCauseNotes?: string;
  monthlyTrend: { month: string; amount: number }[];
}

export interface FinancialDriver {
  driverId: string;
  rank: number;
  name: string;
  category: string;
  departmentId?: string;
  departmentName?: string;
  impactAmount: number;
  impactPercentage: number;
  direction: DriverDirection;
  confidence: number;
  description: string;
  supportingDataPoints: { metric: string; value: string; context: string }[];
  relatedVarianceIds: string[];
}

export interface FinancialDriverAnalysis {
  analysisId: string;
  generatedAt: string;
  modelVersion: string;
  confidence: number;
  revenueDrivers: FinancialDriver[];
  costDrivers: FinancialDriver[];
}

export interface FinancialNarrative {
  narrativeId: string;
  generatedAt: string;
  summary: string;
  fullAnalysis: string;
  keyInsights: { insight: string; severity: InsightSeverity; actionable: boolean }[];
  dataPointsUsed: number;
  modelVersion: string;
}

export interface DrillDownBreadcrumb {
  label: string;
  level: DrillDownLevel;
  filterId?: string;
}

export interface DepartmentFinancialSummary {
  departmentId: string;
  departmentName: string;
  revenue: number;
  cost: number;
  netIncome: number;
  marginPercentage: number;
  revenueYoYChange: number;
  costYoYChange: number;
  topRevenueSource: string;
  topCostCategory: string;
  headcount: number;
  revenuePerEmployee: number;
}

export interface WaterfallDataPoint {
  name: string;
  value: number;
  cumulativeStart: number;
  cumulativeEnd: number;
  isTotal: boolean;
  isPositive: boolean;
  componentId: string;
}

export interface TreemapDataPoint {
  name: string;
  value: number;
  category: CostCategory;
  trend: CostTrend;
  trendPercentage: number;
  percentageOfTotal: number;
  budgetVariance?: number;
  [key: string]: unknown;
}

// ─── State & Reducer ────────────────────────────────────────────────────────

export interface RevenueCostState {
  filters: FinancialFilters;
  summary: FinancialSummary | null;
  revenueBreakdown: RevenueComponent[];
  costBreakdown: CostComponent[];
  variances: VarianceRecord[];
  drivers: FinancialDriverAnalysis | null;
  narrative: FinancialNarrative | null;
  departmentSummaries: DepartmentFinancialSummary[];
  analysisJobStatus: AnalysisJobStatus;
  drillDownPath: DrillDownBreadcrumb[];
  lastSyncedAt: string;
}

export type RevenueCostAction =
  | { type: 'SET_SUMMARY'; payload: FinancialSummary }
  | { type: 'SET_REVENUE_BREAKDOWN'; payload: RevenueComponent[] }
  | { type: 'SET_COST_BREAKDOWN'; payload: CostComponent[] }
  | { type: 'SET_VARIANCES'; payload: VarianceRecord[] }
  | { type: 'SET_DRIVERS'; payload: FinancialDriverAnalysis }
  | { type: 'SET_NARRATIVE'; payload: FinancialNarrative | null }
  | { type: 'SET_DEPARTMENT_SUMMARIES'; payload: DepartmentFinancialSummary[] }
  | { type: 'SET_FILTERS'; payload: Partial<FinancialFilters> }
  | { type: 'SET_ANALYSIS_STATUS'; payload: AnalysisJobStatus }
  | { type: 'SET_DRILL_DOWN_PATH'; payload: DrillDownBreadcrumb[] }
  | { type: 'RESET' };
