// Supply Chain Module - Constants
// Lookup tables, thresholds, styling tokens, and default values for the supply chain module.

import type {
  SupplyCategory,
  RiskLevel,
  SupplyChainFilters,
} from './supply-chain.types';

// ---------------------------------------------------------------------------
// Category Labels & Abbreviations
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<SupplyCategory, string> = {
  DISPOSABLES: 'Disposables',
  MEDICATIONS: 'Medications',
  PPE: 'PPE',
  IMAGING: 'Imaging',
  SURGICAL: 'Surgical',
  LAB: 'Lab',
  EQUIPMENT: 'Equipment',
  NUTRITIONAL: 'Nutritional',
};

export const CATEGORY_ABBREVIATIONS: Record<SupplyCategory, string> = {
  DISPOSABLES: 'DISP',
  MEDICATIONS: 'MED',
  PPE: 'PPE',
  IMAGING: 'IMG',
  SURGICAL: 'SURG',
  LAB: 'LAB',
  EQUIPMENT: 'EQUIP',
  NUTRITIONAL: 'NUTR',
};

// ---------------------------------------------------------------------------
// Risk Thresholds
// ---------------------------------------------------------------------------

export const RISK_THRESHOLDS = {
  CRITICAL: { maxDaysToStockout: 3 },
  WARNING: { maxDaysToStockout: 7 },
  HEALTHY: { maxDaysToStockout: 30 },
  OVERSTOCK: { minDaysToStockout: 90 },
} as const;

// ---------------------------------------------------------------------------
// Risk Level UI Config (Tailwind utility classes)
// ---------------------------------------------------------------------------

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  WARNING: {
    label: 'Warning',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  HEALTHY: {
    label: 'Healthy',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  OVERSTOCK: {
    label: 'Overstock',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

// ---------------------------------------------------------------------------
// Expiration Windows
// ---------------------------------------------------------------------------

export const EXPIRATION_WINDOWS = [
  { value: 7, label: '7 Days', severity: 'CRITICAL' as const },
  { value: 30, label: '30 Days', severity: 'WARNING' as const },
  { value: 90, label: '90 Days', severity: 'INFO' as const },
];

// ---------------------------------------------------------------------------
// Recommendation Helpers
// ---------------------------------------------------------------------------

export const RECOMMENDATION_PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  REORDER: 'Reorder',
  INCREASE_PAR: 'Increase PAR Level',
  DECREASE_PAR: 'Decrease PAR Level',
  CONSOLIDATE_ORDERS: 'Consolidate Orders',
  SWITCH_SUPPLIER: 'Switch Supplier',
  BULK_DISCOUNT: 'Bulk Discount',
};

// ---------------------------------------------------------------------------
// Chart / Visualization Colors
// ---------------------------------------------------------------------------

export const CHART_COLORS = {
  actual: '#0058be',
  predicted: '#2170e4',
  confidence: 'rgba(33, 112, 228, 0.15)',
  anomaly: '#ba1a1a',
  grid: '#c6c6cd',
  criticalZone: 'rgba(186, 26, 26, 0.08)',
  warningZone: 'rgba(245, 158, 11, 0.08)',
  healthyZone: 'rgba(0, 150, 104, 0.08)',
  overstockZone: 'rgba(33, 112, 228, 0.08)',
} as const;

export const SCATTER_QUADRANT_LABELS = {
  topLeft: 'Critical: High usage, low stock',
  topRight: 'Watch: High usage, adequate stock',
  bottomLeft: 'Healthy: Low usage, low stock (but ok)',
  bottomRight: 'Overstock: Low usage, high stock',
} as const;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_FILTERS: SupplyChainFilters = {
  categories: [],
  departmentIds: [],
  supplierIds: [],
  riskLevels: [],
  searchQuery: '',
  sortBy: 'daysToStockout',
  sortDirection: 'asc',
};

export const ITEMS_PER_PAGE = 20;
