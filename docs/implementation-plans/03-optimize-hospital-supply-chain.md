# 03 Optimize Hospital Supply Chain - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital administrator**, I want to **view supply chain optimization recommendations for medical supplies and equipment**, so that I can **reduce waste, prevent stockouts, and control procurement costs**.

## Pre-conditions
- Hospital inventory management system is integrated or supply data is importable (items, quantities, locations)
- Historical consumption data (minimum 12 months) is available in PostgreSQL for demand modeling
- Supplier catalog with pricing, lead times, and minimum order quantities is configured
- Expiration tracking is enabled for perishable items (medications, reagents, sterile supplies)
- Department-level consumption mapping is established (which departments consume which supplies)
- User has `ADMIN` or `SUPPLY_CHAIN_MANAGER` role with appropriate RBAC permissions
- Redis is operational for caching inventory snapshots and consumption rate calculations
- BullMQ workers are deployed for background demand forecasting and optimization jobs
- Claude API key is provisioned for consumption pattern analysis and procurement optimization insights

## Business Requirements
- **BR-1**: Reduce medical supply waste (expired or deteriorated items) by 25% within 6 months
  - *Success Metric*: Track monthly value of expired/wasted supplies pre/post deployment
- **BR-2**: Reduce stockout incidents by 40%
  - *Success Metric*: Count of stockout events (supply unavailable when needed) per month
- **BR-3**: Achieve 10% reduction in overall procurement costs through optimized ordering
  - *Success Metric*: Compare total procurement spend month-over-month and year-over-year
- **BR-4**: Provide 14-day supply demand forecasts with 80%+ accuracy
  - *Success Metric*: Compare predicted vs. actual consumption over rolling 30-day windows
- **BR-5**: Alert supply chain managers at least 7 days before projected stockouts
  - *Success Metric*: Percentage of stockout events with >= 7-day advance warning
- **BR-6**: Surface expiration risk items at least 30 days before expiration date
  - *Success Metric*: Percentage of expired items that had >= 30-day advance warning

## Technical Specifications

### Integration Points
| Integration | Protocol | Source | Purpose |
|---|---|---|---|
| Inventory Management System (Omnicell/Pyxis) | REST API / HL7 | Item master, current stock levels, locations | Real-time inventory quantities and locations |
| Materials Management (MMIS) | REST API / SFTP | Purchase orders, receiving, distribution | Procurement history and pipeline visibility |
| Group Purchasing Organization (GPO) | REST API | Contract pricing, preferred vendors | Optimized pricing for procurement recommendations |
| EHR System (Epic/Cerner) | HL7 FHIR R4 | Patient census, procedures scheduled | Demand driver data for consumption forecasting |
| Pharmacy Information System | REST API / HL7 | Medication stock, dispensing records | Pharmaceutical-specific inventory and consumption |
| BullMQ Job Queue | Redis | Internal | Asynchronous demand forecast and optimization job processing |
| Claude API | REST | Anthropic | Consumption pattern analysis, anomaly detection, procurement optimization NLP insights |
| Neo4j Graph DB | Bolt Protocol | Internal | Supplier relationship mapping, item substitution networks, departmental consumption pathways |

### Security Requirements
| Requirement | Implementation |
|---|---|
| HIPAA-Adjacent Compliance | Supply data does not contain PHI; patient census data used for demand modeling is aggregated (no individual patient identifiers in supply chain views) |
| Data Encryption | Supplier contract pricing and procurement data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Role-Based Access Control | `SUPPLY_CHAIN_MANAGER` can view inventory and recommendations; `PROCUREMENT_OFFICER` can approve purchase orders; `ADMIN` can configure reorder points and thresholds; `VIEWER` read-only |
| Audit Logging | Every procurement recommendation viewed, order approved, and threshold changed is logged to `audit_log` with user ID, timestamp, and parameters |
| Data Retention | Inventory snapshots and procurement records retained for 7 years per healthcare records policy |
| Supplier Data Protection | Supplier pricing and contractual terms encrypted; access restricted to `PROCUREMENT_OFFICER` and above |
| API Rate Limiting | Optimization endpoints throttled to 20 RPM per tenant; Redis-backed rate limiter |

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  [TopNav: MedicalPro Logo | Dashboard | Staff | Beds | Supply ]  |
+------------------------------------------------------------------+
|  Sidebar  |  Main Content Area                                   |
|           |                                                       |
|  Filters  |  +--------------------------------------------------+|
|  --------+|  | SupplyChainHeader                                 ||
|  Category |  |  "Supply Chain Optimizer"                         ||
|    [v]    |  |  [Last synced: 10m ago] [Sync Now] [Export]       ||
|  Dept [v] |  +--------------------------------------------------+|
|  Supplier |                                                       |
|    [v]    |  +------------+  +------------+  +------------------+|
|  Risk  [v]|  | Inventory  |  | Stockout   |  | Cost Savings    ||
|           |  | Health Card|  | Risk Card  |  | Opportunity Card||
|  Actions  |  | Items: 3247|  | At-Risk: 42|  | Potential:      ||
|  --------+|  | Value:$2.1M|  | Critical:8 |  | $340K/year      ||
|  [Run     |  | Turnover:  |  | Avg Days   |  | Current Spend:  ||
|  Forecast]|  | 4.2x/yr    |  | to Stockout|  | $8.6M/yr        ||
|           |  +------------+  | : 12       |  +------------------+|
|  [Optimize|                  +------------+                       |
|  Orders]  |  +--------------------------------------------------+|
|           |  | InventoryRiskMatrix                                ||
|  [Review  |  |  [Scatter plot: X=days-to-stockout,              ||
|  Expiring]|  |   Y=consumption-rate, size=item-value]            ||
|           |  |  Quadrants: Critical(top-left), Watch(top-right), ||
|           |  |  Overstock(bottom-right), Healthy(center)         ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | InventoryTable                                     ||
|           |  | Item | Cat | Dept | Qty | Rate | Days | Status   ||
|           |  | -----|-----|------|-----|------|------|--------   ||
|           |  | Syringe 10ml | Disp | ER | 1200 | 80/d | 15 | OK||
|           |  | Fentanyl 50mcg| Med | Surg| 48 | 6/d | 8 | WARN||
|           |  | Nitrile Glv L | PPE | All | 240 | 150/d| 1.6| CRIT|
|           |  | CT Contrast  | Img | Rad | 300 | 12/d | 25 | OK ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | OptimizationRecommendationPanel                    ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #1: Increase Nitrile Glove L reorder     | ||
|           |  |  |   point from 200 to 450 (3-day lead time)    | ||
|           |  |  | Savings: Prevent $8K stockout costs           | ||
|           |  |  | [Approve Order] [Adjust] [Dismiss]           | ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #2: Consolidate Syringe orders to monthly| ||
|           |  |  |   bulk: save 12% per unit                    | ||
|           |  |  | ...                                          | ||
|           |  |  +----------------------------------------------+ ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +------------------------+  +-----------------------+|
|           |  | ExpirationTracker      |  | ConsumptionTrendChart ||
|           |  | [List of items nearing |  | [Line chart: actual   ||
|           |  |  expiration with days  |  |  vs. predicted        ||
|           |  |  remaining and value   |  |  consumption rates    ||
|           |  |  at risk]              |  |  by category]         ||
|           |  +------------------------+  +-----------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
SupplyChainPage (Server Component - layout + data fetching)
├── SupplyChainHeader
│   ├── PageTitle
│   ├── LastSyncedIndicator
│   └── ActionButtonGroup (Sync Now, Export)
├── SupplyChainSidebar
│   ├── CategoryFilter (multi-select: Disposables, Medications, PPE, Imaging, Surgical, Lab)
│   ├── DepartmentFilter (multi-select dropdown)
│   ├── SupplierFilter (multi-select dropdown)
│   ├── RiskLevelFilter (Critical, Warning, Healthy, Overstock)
│   └── SidebarActions
│       ├── RunForecastButton
│       ├── OptimizeOrdersButton
│       └── ReviewExpiringButton
├── SupplySummaryRow
│   ├── InventoryHealthCard
│   ├── StockoutRiskCard
│   └── CostSavingsOpportunityCard
├── InventoryRiskMatrix (Recharts ScatterChart)
│   ├── RiskQuadrantOverlay
│   ├── ItemDot (repeated, sized by value)
│   └── RiskMatrixTooltip
├── InventoryTable
│   ├── InventoryTableHeader (sortable columns)
│   ├── InventoryTableRow (repeated)
│   │   ├── ItemNameCell
│   │   ├── ConsumptionRateCell
│   │   ├── DaysToStockoutCell (color-coded)
│   │   ├── InventoryStatusBadge
│   │   └── RowActions (View Detail, Reorder)
│   ├── TablePagination
│   └── TableSearch
├── OptimizationRecommendationPanel
│   ├── RecommendationSortControls
│   └── SupplyRecommendationCard (repeated)
│       ├── RecommendationSummary
│       ├── SavingsImpactBadge
│       ├── RecommendationRationale
│       └── RecommendationActions (Approve Order, Adjust, Dismiss)
├── ExpirationTracker
│   ├── ExpiringItemList
│   │   └── ExpiringItemRow (repeated)
│   │       ├── ItemInfo
│   │       ├── ExpirationCountdown
│   │       ├── ValueAtRiskBadge
│   │       └── ExpirationActions (Use First, Transfer, Dispose)
│   └── ExpirationFilterTabs (7-day, 30-day, 90-day)
└── ConsumptionTrendChart (Recharts LineChart)
    ├── ActualConsumptionLine
    ├── PredictedConsumptionLine
    ├── CategoryLegend
    └── AnomalyMarkers
```

### Design System Compliance
| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#031926` | Page background, table headers, primary text |
| `--color-teal` | `#007B7A` | Healthy inventory status badges, approve buttons, adequate stock indicators |
| `--color-cerulean` | `#00B3C6` | Predicted consumption lines, links, active filter tabs |
| `--color-gold` | `#C9A84A` | Warning-level stock badges, expiration approaching highlights, savings opportunity badges |
| `--color-danger` | `#DC2626` | Critical stockout alerts, expired item markers, overstock warnings |
| `--color-success` | `#059669` | Cost savings indicators, positive trend deltas |
| `--font-heading` | `Merriweather, serif` | Page title, card headers, item category labels |
| `--font-body` | `Inter, sans-serif` | Body text, table data, metrics, labels |
| `--font-mono` | `JetBrains Mono, monospace` | Item codes, quantities, reorder point values |
| `--spacing-card` | `p-6` (24px) | Internal card padding |
| `--spacing-gap` | `gap-6` (24px) | Grid gap between cards |
| `--radius-card` | `rounded-xl` (12px) | Card border radius |
| `--shadow-card` | `shadow-md` | Elevated card surfaces |

### Responsive Behavior
| Breakpoint | Layout | Behavior |
|---|---|---|
| `< 640px` (mobile) | Single column; sidebar collapses to bottom sheet | Summary cards stack vertically; inventory table scrolls horizontally with frozen item name column; risk matrix simplified to list view; recommendation cards stack |
| `640px - 1024px` (tablet) | Two-column grid; sidebar as collapsible drawer | Summary cards in 2-column row; table fits with horizontal scroll; risk matrix shows fewer labels; expiration tracker and consumption chart stack |
| `> 1024px` (desktop) | Full layout as shown in ASCII diagram | All panels visible; sidebar pinned left; table shows all columns; risk matrix fully interactive |

### Interaction Patterns
| Interaction | Behavior |
|---|---|
| **Run Forecast** | Button shows spinner + "Analyzing consumption patterns..."; disabled during processing; toast on completion |
| **Optimize Orders** | Triggers batch optimization job; progress bar in sidebar; generates consolidated purchase order recommendations |
| **Filter Change** | Debounced 300ms; skeleton loaders on data panels; URL search params updated |
| **Table Row Click** | Opens supply item detail modal with full consumption history chart, supplier info, and reorder configuration |
| **Table Search** | Real-time fuzzy search across item name, item code, and category; debounced 200ms |
| **Risk Matrix Dot Hover** | Tooltip shows item name, current quantity, consumption rate, days to stockout, and value |
| **Risk Matrix Dot Click** | Scrolls to and highlights corresponding row in inventory table |
| **Recommendation Approve Order** | Confirmation modal with order details (quantity, supplier, cost, delivery date); creates purchase order draft |
| **Recommendation Adjust** | Opens inline editor for quantity, reorder point, or supplier selection before approval |
| **Expiration Action: Use First** | Creates priority tag in inventory system; surfaces item in department consoles |
| **Expiration Action: Transfer** | Opens inter-department transfer modal with destination picker and quantity selector |
| **Anomaly Marker Click** | On consumption chart, opens detail panel explaining detected anomaly (spike, drop, unusual pattern) |
| **Loading States** | Skeleton placeholders; table rows pulse; chart area shows loading indicator |
| **Error States** | Inline error banners with retry; stale data indicator when inventory sync fails |

## Technical Architecture

### Component Structure
```
src/
├── app/
│   └── supply-chain/
│       ├── page.tsx                            # Server component: data fetching + layout
│       ├── layout.tsx                          # Supply chain section layout
│       ├── loading.tsx                         # Streaming skeleton UI
│       ├── error.tsx                           # Error boundary
│       ├── [itemId]/
│       │   ├── page.tsx                        # Item detail page with consumption history
│       │   └── loading.tsx
│       ├── _components/
│       │   ├── SupplyChainHeader.tsx
│       │   ├── SupplyChainSidebar.tsx
│       │   ├── InventoryHealthCard.tsx
│       │   ├── StockoutRiskCard.tsx
│       │   ├── CostSavingsOpportunityCard.tsx
│       │   ├── InventoryRiskMatrix.tsx
│       │   ├── RiskMatrixTooltip.tsx
│       │   ├── RiskQuadrantOverlay.tsx
│       │   ├── InventoryTable.tsx
│       │   ├── InventoryTableRow.tsx
│       │   ├── InventoryStatusBadge.tsx
│       │   ├── TableSearch.tsx
│       │   ├── OptimizationRecommendationPanel.tsx
│       │   ├── SupplyRecommendationCard.tsx
│       │   ├── ExpirationTracker.tsx
│       │   ├── ExpiringItemRow.tsx
│       │   ├── ConsumptionTrendChart.tsx
│       │   ├── AnomalyMarker.tsx
│       │   ├── CategoryFilter.tsx
│       │   ├── DepartmentFilter.tsx
│       │   ├── SupplierFilter.tsx
│       │   ├── RiskLevelFilter.tsx
│       │   ├── RunForecastButton.tsx
│       │   └── OptimizeOrdersButton.tsx
│       └── _hooks/
│           ├── useSupplyChain.ts
│           ├── useInventoryForecast.ts
│           ├── useSupplyRecommendations.ts
│           ├── useExpirationTracking.ts
│           └── useSupplyFilters.ts
├── lib/
│   └── supply-chain/
│       ├── supply-chain.service.ts             # API client functions
│       ├── supply-chain.types.ts               # TypeScript interfaces
│       ├── supply-chain.utils.ts               # Formatting, calculation helpers
│       └── supply-chain.constants.ts           # Categories, risk thresholds, reorder defaults
└── server/
    └── supply-chain/
        ├── supply-chain.controller.ts          # NestJS REST controller
        ├── supply-chain.service.ts             # Business logic
        ├── supply-chain.module.ts              # NestJS module
        ├── demand-forecast.processor.ts        # BullMQ job processor for demand forecasting
        ├── order-optimization.processor.ts     # BullMQ job processor for order optimization
        ├── expiration-scanner.service.ts       # Scheduled job scanning for expiring items
        ├── inventory-sync.service.ts           # Integration service for inventory system sync
        ├── dto/
        │   ├── get-inventory.dto.ts
        │   ├── run-demand-forecast.dto.ts
        │   ├── optimize-orders.dto.ts
        │   ├── approve-order.dto.ts
        │   └── transfer-item.dto.ts
        └── entities/
            ├── supply-item.entity.ts
            ├── inventory-level.entity.ts
            ├── consumption-record.entity.ts
            ├── supply-forecast.entity.ts
            ├── procurement-recommendation.entity.ts
            ├── purchase-order-draft.entity.ts
            ├── supplier.entity.ts
            └── expiration-alert.entity.ts
```

### State Management Architecture
```typescript
// --- Global State (React Context + useReducer) ---

interface SupplyChainGlobalState {
  filters: SupplyChainFilters;
  inventory: InventoryItem[];
  inventoryTotals: InventoryTotals;
  forecast: SupplyDemandForecast | null;
  recommendations: ProcurementRecommendation[];
  expirationAlerts: ExpirationAlert[];
  forecastJobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  optimizationJobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
}

interface SupplyChainFilters {
  categories: SupplyCategory[];
  departmentIds: string[];
  supplierIds: string[];
  riskLevels: RiskLevel[];
  searchQuery: string;
  sortBy: InventorySortField;
  sortDirection: 'asc' | 'desc';
}

type SupplyCategory = 'DISPOSABLES' | 'MEDICATIONS' | 'PPE' | 'IMAGING' | 'SURGICAL' | 'LAB' | 'EQUIPMENT' | 'NUTRITIONAL';
type RiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OVERSTOCK';
type InventorySortField = 'name' | 'category' | 'quantity' | 'consumptionRate' | 'daysToStockout' | 'value' | 'status';

// --- Domain Types ---

interface InventoryItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: SupplyCategory;
  departmentId: string;
  departmentName: string;
  currentQuantity: number;
  unit: string;                        // 'units', 'boxes', 'cases', 'vials', 'liters'
  reorderPoint: number;
  reorderQuantity: number;
  parLevel: number;                    // Target inventory level
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
  lastOrderDate: string;               // ISO date
  lastReceivedDate: string;            // ISO date
  expirationDate: string | null;       // ISO date, null if non-perishable
  daysToExpiration: number | null;
  lotNumber: string | null;
  storageLocation: string;
  consumptionTrend: 'RISING' | 'STABLE' | 'DECLINING';
  consumptionVariance: number;         // coefficient of variation
}

interface InventoryTotals {
  totalItems: number;
  totalValue: number;
  inventoryTurnover: number;           // annual turns
  criticalCount: number;
  warningCount: number;
  overstockCount: number;
  healthyCount: number;
  expiringWithin30Days: number;
  expiringValueAtRisk: number;
}

interface SupplyDemandForecast {
  forecastId: string;
  generatedAt: string;
  horizonDays: number;
  confidence: number;
  modelVersion: string;
  categoryForecasts: CategoryForecast[];
  anomalies: ConsumptionAnomaly[];
}

interface CategoryForecast {
  category: SupplyCategory;
  dailyForecasts: DailyConsumptionForecast[];
}

interface DailyConsumptionForecast {
  date: string;                        // ISO date
  predictedConsumption: number;
  confidenceInterval: { lower: number; upper: number };
  driverFactors: {
    patientVolume: number;
    scheduledProcedures: number;
    seasonalFactor: number;
  };
}

interface ConsumptionAnomaly {
  anomalyId: string;
  itemId: string;
  itemName: string;
  detectedDate: string;
  type: 'SPIKE' | 'DROP' | 'TREND_CHANGE' | 'UNUSUAL_PATTERN';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviationPercentage: number;
}

interface ProcurementRecommendation {
  recommendationId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'REORDER' | 'INCREASE_PAR' | 'DECREASE_PAR' | 'CONSOLIDATE_ORDERS' | 'SWITCH_SUPPLIER' | 'BULK_DISCOUNT';
  itemId: string;
  itemName: string;
  itemCode: string;
  category: SupplyCategory;
  description: string;
  rationale: string;                   // AI-generated explanation
  currentValue: number;                // e.g., current reorder point or current quantity
  recommendedValue: number;            // e.g., new reorder point or order quantity
  costImpact: {
    currentAnnualCost: number;
    projectedAnnualCost: number;
    savings: number;
    savingsPercentage: number;
  };
  stockoutRiskReduction: {
    currentRisk: number;               // 0.0 - 1.0
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
  status: 'PENDING' | 'APPROVED' | 'ADJUSTED' | 'DISMISSED';
  adjustedQuantity?: number;
  dismissalReason?: string;
}

interface ExpirationAlert {
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
  severity: 'CRITICAL' | 'WARNING' | 'INFO';     // <7 days, <30 days, <90 days
  suggestedAction: 'USE_FIRST' | 'TRANSFER' | 'RETURN_TO_SUPPLIER' | 'DISPOSE';
  actionTaken: 'NONE' | 'PRIORITIZED' | 'TRANSFERRED' | 'RETURNED' | 'DISPOSED';
}
```

### API Integration Schema
```typescript
// ============================================================
// GET /api/v1/supply-chain/inventory
// Fetch current inventory levels with filters
// ============================================================
interface GetInventoryRequest {
  params: {
    categories?: SupplyCategory[];
    departmentIds?: string[];
    supplierIds?: string[];
    riskLevels?: RiskLevel[];
    search?: string;
    sortBy?: InventorySortField;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  };
}

interface GetInventoryResponse {
  data: {
    items: InventoryItem[];
    totals: InventoryTotals;
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  meta: {
    lastSyncedAt: string;
    cached: boolean;
  };
}

// ============================================================
// GET /api/v1/supply-chain/inventory/:itemId
// Fetch detailed item information with consumption history
// ============================================================
interface GetItemDetailRequest {
  params: { itemId: string };
}

interface GetItemDetailResponse {
  data: {
    item: InventoryItem;
    consumptionHistory: {
      date: string;
      consumed: number;
      received: number;
      endingBalance: number;
    }[];
    orderHistory: {
      orderId: string;
      orderDate: string;
      quantity: number;
      cost: number;
      supplier: string;
      status: 'ORDERED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';
    }[];
    substitutes: {
      itemId: string;
      itemName: string;
      currentQuantity: number;
      compatibility: 'DIRECT' | 'PARTIAL' | 'EMERGENCY_ONLY';
    }[];
  };
}

// ============================================================
// POST /api/v1/supply-chain/forecast
// Trigger a supply demand forecast job
// ============================================================
interface RunDemandForecastRequest {
  body: {
    categories: SupplyCategory[];
    horizonDays: 7 | 14 | 30;
    includeSeasonalPatterns: boolean;
    includeScheduledProcedures: boolean;
  };
}

interface RunDemandForecastResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/supply-chain/forecast/:jobId
// Poll forecast job status and results
// ============================================================
interface GetForecastResultRequest {
  params: { jobId: string };
}

interface GetForecastResultResponse {
  data: {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    forecast?: SupplyDemandForecast;
    error?: string;
  };
}

// ============================================================
// POST /api/v1/supply-chain/optimize
// Trigger order optimization job
// ============================================================
interface RunOptimizationRequest {
  body: {
    categories?: SupplyCategory[];
    departmentIds?: string[];
    optimizationGoal: 'MINIMIZE_COST' | 'MINIMIZE_STOCKOUTS' | 'BALANCED';
  };
}

interface RunOptimizationResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/supply-chain/recommendations
// Fetch procurement recommendations
// ============================================================
interface GetRecommendationsRequest {
  params: {
    forecastId?: string;
    optimizationJobId?: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type?: ProcurementRecommendation['type'];
    status?: 'PENDING' | 'APPROVED' | 'ADJUSTED' | 'DISMISSED';
    page?: number;
    pageSize?: number;
  };
}

interface GetRecommendationsResponse {
  data: {
    recommendations: ProcurementRecommendation[];
    summary: {
      totalRecommendations: number;
      criticalCount: number;
      projectedAnnualSavings: number;
      stockoutRisksAddressed: number;
    };
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

// ============================================================
// PATCH /api/v1/supply-chain/recommendations/:id
// Approve, adjust, or dismiss a recommendation
// ============================================================
interface UpdateRecommendationRequest {
  params: { id: string };
  body: {
    status: 'APPROVED' | 'ADJUSTED' | 'DISMISSED';
    adjustedQuantity?: number;
    dismissalReason?: string;
  };
}

interface UpdateRecommendationResponse {
  data: {
    recommendation: ProcurementRecommendation;
    purchaseOrderDraft?: {
      draftId: string;
      totalCost: number;
      estimatedDeliveryDate: string;
    };
    auditLogId: string;
  };
}

// ============================================================
// GET /api/v1/supply-chain/expiration-alerts
// Fetch items approaching expiration
// ============================================================
interface GetExpirationAlertsRequest {
  params: {
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    categories?: SupplyCategory[];
    departmentIds?: string[];
    windowDays?: 7 | 30 | 90;
  };
}

interface GetExpirationAlertsResponse {
  data: {
    alerts: ExpirationAlert[];
    summary: {
      criticalCount: number;
      warningCount: number;
      totalValueAtRisk: number;
      itemsExpiringSoon: number;
    };
  };
}

// ============================================================
// PATCH /api/v1/supply-chain/expiration-alerts/:id/action
// Take action on an expiring item
// ============================================================
interface TakeExpirationActionRequest {
  params: { id: string };
  body: {
    action: 'PRIORITIZED' | 'TRANSFERRED' | 'RETURNED' | 'DISPOSED';
    targetDepartmentId?: string;       // Required for TRANSFERRED
    notes?: string;
  };
}

interface TakeExpirationActionResponse {
  data: {
    alert: ExpirationAlert;
    auditLogId: string;
  };
}

// ============================================================
// GET /api/v1/supply-chain/consumption-trends
// Fetch consumption trend data for charts
// ============================================================
interface GetConsumptionTrendsRequest {
  params: {
    categories?: SupplyCategory[];
    period: '7d' | '14d' | '30d' | '90d';
    granularity: 'daily' | 'weekly';
    itemIds?: string[];
  };
}

interface GetConsumptionTrendsResponse {
  data: {
    trends: {
      category: SupplyCategory;
      dataPoints: {
        date: string;
        actualConsumption: number;
        predictedConsumption?: number;
        cost: number;
      }[];
    }[];
    anomalies: ConsumptionAnomaly[];
  };
}

// ============================================================
// POST /api/v1/supply-chain/items/:itemId/transfer
// Transfer inventory between departments
// ============================================================
interface TransferInventoryRequest {
  params: { itemId: string };
  body: {
    sourceDepartmentId: string;
    targetDepartmentId: string;
    quantity: number;
    reason: string;
    lotNumber?: string;
  };
}

interface TransferInventoryResponse {
  data: {
    transferId: string;
    status: 'COMPLETED';
    auditLogId: string;
  };
}
```

## Implementation Requirements

### Core Components
| Component | File | Purpose |
|---|---|---|
| `SupplyChainPage` | `src/app/supply-chain/page.tsx` | Server component; fetches initial inventory data via RSC; renders layout |
| `SupplyChainHeader` | `src/app/supply-chain/_components/SupplyChainHeader.tsx` | Page title, last-synced timestamp, sync now and export buttons |
| `SupplyChainSidebar` | `src/app/supply-chain/_components/SupplyChainSidebar.tsx` | Filter panel with category, department, supplier, and risk-level selectors |
| `InventoryHealthCard` | `src/app/supply-chain/_components/InventoryHealthCard.tsx` | Summary card showing total items, inventory value, turnover rate |
| `StockoutRiskCard` | `src/app/supply-chain/_components/StockoutRiskCard.tsx` | Summary card showing items at risk of stockout with severity breakdown |
| `CostSavingsOpportunityCard` | `src/app/supply-chain/_components/CostSavingsOpportunityCard.tsx` | Summary card showing potential cost savings from optimization |
| `InventoryRiskMatrix` | `src/app/supply-chain/_components/InventoryRiskMatrix.tsx` | Recharts scatter plot showing items by stockout risk vs. consumption rate |
| `InventoryTable` | `src/app/supply-chain/_components/InventoryTable.tsx` | Paginated, sortable, searchable table of inventory items |
| `InventoryTableRow` | `src/app/supply-chain/_components/InventoryTableRow.tsx` | Table row with consumption rate, days-to-stockout, and status badge |
| `InventoryStatusBadge` | `src/app/supply-chain/_components/InventoryStatusBadge.tsx` | Color-coded badge (Critical/Warning/Healthy/Overstock) |
| `OptimizationRecommendationPanel` | `src/app/supply-chain/_components/OptimizationRecommendationPanel.tsx` | Scrollable list of procurement recommendations |
| `SupplyRecommendationCard` | `src/app/supply-chain/_components/SupplyRecommendationCard.tsx` | Individual recommendation with cost impact and actions |
| `ExpirationTracker` | `src/app/supply-chain/_components/ExpirationTracker.tsx` | List of items nearing expiration with action buttons |
| `ExpiringItemRow` | `src/app/supply-chain/_components/ExpiringItemRow.tsx` | Row with expiration countdown, value at risk, and action options |
| `ConsumptionTrendChart` | `src/app/supply-chain/_components/ConsumptionTrendChart.tsx` | Recharts line chart with actual vs. predicted consumption by category |
| `AnomalyMarker` | `src/app/supply-chain/_components/AnomalyMarker.tsx` | Custom chart marker for consumption anomalies |

### Custom Hooks
| Hook | File | Description |
|---|---|---|
| `useSupplyChain` | `src/app/supply-chain/_hooks/useSupplyChain.ts` | Manages global supply chain state; provides actions for filter updates, data refresh |
| `useInventoryForecast` | `src/app/supply-chain/_hooks/useInventoryForecast.ts` | Handles demand forecast job lifecycle: trigger, poll, receive results |
| `useSupplyRecommendations` | `src/app/supply-chain/_hooks/useSupplyRecommendations.ts` | Fetches, sorts, and manages procurement recommendation state; handles approve/adjust/dismiss |
| `useExpirationTracking` | `src/app/supply-chain/_hooks/useExpirationTracking.ts` | Fetches expiration alerts; manages action-taking; auto-refresh |
| `useSupplyFilters` | `src/app/supply-chain/_hooks/useSupplyFilters.ts` | Syncs filter state with URL search params; includes search query; debounced |

### Utility Functions
| Utility | File | Description |
|---|---|---|
| `calculateDaysToStockout` | `src/lib/supply-chain/supply-chain.utils.ts` | Computes days-to-stockout from current quantity and consumption rate |
| `getRiskLevel` | `src/lib/supply-chain/supply-chain.utils.ts` | Determines risk level based on days-to-stockout and lead time |
| `getRiskColor` | `src/lib/supply-chain/supply-chain.utils.ts` | Returns Tailwind color class based on risk level |
| `formatConsumptionRate` | `src/lib/supply-chain/supply-chain.utils.ts` | Formats consumption as "N units/day" or "N units/week" |
| `formatInventoryValue` | `src/lib/supply-chain/supply-chain.utils.ts` | Currency formatting with K/M abbreviations |
| `calculateTurnoverRate` | `src/lib/supply-chain/supply-chain.utils.ts` | Computes annual inventory turnover from cost-of-goods and average inventory value |
| `sortInventoryItems` | `src/lib/supply-chain/supply-chain.utils.ts` | Multi-field sorting for inventory table |
| `buildInventoryQueryParams` | `src/lib/supply-chain/supply-chain.utils.ts` | Serializes filter state to URL search params |
| `SUPPLY_CATEGORIES` | `src/lib/supply-chain/supply-chain.constants.ts` | Category enum to display label and icon mapping |
| `RISK_THRESHOLDS` | `src/lib/supply-chain/supply-chain.constants.ts` | Days-to-stockout thresholds for risk level classification |
| `EXPIRATION_WINDOWS` | `src/lib/supply-chain/supply-chain.constants.ts` | Expiration alert windows: 7, 30, 90 days |
| `DEFAULT_REORDER_MULTIPLIER` | `src/lib/supply-chain/supply-chain.constants.ts` | Default safety stock multiplier by category |

## Acceptance Criteria

### Functional Requirements
1. The dashboard displays current inventory levels with item name, category, department, quantity, consumption rate, days to stockout, and status
2. Users can filter by supply category, department, supplier, and risk level; and search by item name or code
3. The inventory risk matrix visualizes all items on a scatter plot with quadrants indicating risk categories
4. Hovering a dot on the risk matrix reveals item details; clicking scrolls to the item in the table
5. Items at risk of stockout (days-to-stockout < lead-time + safety buffer) are flagged with CRITICAL or WARNING badges
6. Clicking "Run Forecast" triggers a background demand forecast and displays a progress indicator
7. Forecast results overlay predicted consumption on the consumption trend chart with confidence bands
8. The consumption trend chart highlights detected anomalies with clickable markers showing explanations
9. Procurement recommendations include the type of action, affected item, cost savings, and stockout risk reduction
10. Users can approve (creates purchase order draft), adjust (modify quantity/supplier), or dismiss (with reason) recommendations
11. Items approaching expiration are listed with countdown timers, value at risk, and suggested actions
12. Users can take expiration actions: prioritize for use, transfer to another department, return to supplier, or dispose
13. The comparison view shows current procurement patterns against optimized suggestions
14. Cost savings projections display projected annual savings from recommended adjustments
15. All filter selections and search queries persist in URL parameters

### Non-Functional Requirements
| Category | Requirement |
|---|---|
| **Performance** | Initial page load with server-rendered inventory completes within 1.5s |
| **Performance** | Inventory table renders up to 500 items with sorting/filtering at 60fps |
| **Performance** | Demand forecast job completes within 60 seconds |
| **Performance** | Table search returns results within 200ms |
| **Accessibility** | WCAG 2.1 AA compliant; risk matrix data accessible via table fallback; screen reader announces alerts |
| **Security** | Supplier pricing requires `PROCUREMENT_OFFICER` role; all data encrypted in transit/at rest |
| **Security** | Approved orders create audit trail with point-of-no-return confirmation |
| **Reliability** | Graceful degradation with cached inventory data if sync fails; staleness indicator |
| **Scalability** | Supports 3,000+ unique inventory items across 20+ departments without performance degradation |

## Modified Files
```
src/
├── app/
│   └── supply-chain/
│       ├── page.tsx                                      [NEW]
│       ├── layout.tsx                                    [NEW]
│       ├── loading.tsx                                   [NEW]
│       ├── error.tsx                                     [NEW]
│       ├── [itemId]/
│       │   ├── page.tsx                                  [NEW]
│       │   └── loading.tsx                               [NEW]
│       ├── _components/
│       │   ├── SupplyChainHeader.tsx                     [NEW]
│       │   ├── SupplyChainSidebar.tsx                    [NEW]
│       │   ├── InventoryHealthCard.tsx                   [NEW]
│       │   ├── StockoutRiskCard.tsx                      [NEW]
│       │   ├── CostSavingsOpportunityCard.tsx            [NEW]
│       │   ├── InventoryRiskMatrix.tsx                   [NEW]
│       │   ├── RiskMatrixTooltip.tsx                     [NEW]
│       │   ├── RiskQuadrantOverlay.tsx                   [NEW]
│       │   ├── InventoryTable.tsx                        [NEW]
│       │   ├── InventoryTableRow.tsx                     [NEW]
│       │   ├── InventoryStatusBadge.tsx                  [NEW]
│       │   ├── TableSearch.tsx                           [NEW]
│       │   ├── OptimizationRecommendationPanel.tsx       [NEW]
│       │   ├── SupplyRecommendationCard.tsx              [NEW]
│       │   ├── ExpirationTracker.tsx                     [NEW]
│       │   ├── ExpiringItemRow.tsx                       [NEW]
│       │   ├── ConsumptionTrendChart.tsx                 [NEW]
│       │   ├── AnomalyMarker.tsx                         [NEW]
│       │   ├── CategoryFilter.tsx                        [NEW]
│       │   ├── DepartmentFilter.tsx                      [NEW]
│       │   ├── SupplierFilter.tsx                        [NEW]
│       │   ├── RiskLevelFilter.tsx                       [NEW]
│       │   ├── RunForecastButton.tsx                     [NEW]
│       │   └── OptimizeOrdersButton.tsx                  [NEW]
│       └── _hooks/
│           ├── useSupplyChain.ts                         [NEW]
│           ├── useInventoryForecast.ts                   [NEW]
│           ├── useSupplyRecommendations.ts               [NEW]
│           ├── useExpirationTracking.ts                  [NEW]
│           └── useSupplyFilters.ts                       [NEW]
├── lib/
│   └── supply-chain/
│       ├── supply-chain.service.ts                       [NEW]
│       ├── supply-chain.types.ts                         [NEW]
│       ├── supply-chain.utils.ts                         [NEW]
│       └── supply-chain.constants.ts                     [NEW]
├── server/
│   └── supply-chain/
│       ├── supply-chain.controller.ts                    [NEW]
│       ├── supply-chain.service.ts                       [NEW]
│       ├── supply-chain.module.ts                        [NEW]
│       ├── demand-forecast.processor.ts                  [NEW]
│       ├── order-optimization.processor.ts               [NEW]
│       ├── expiration-scanner.service.ts                 [NEW]
│       ├── inventory-sync.service.ts                     [NEW]
│       ├── dto/
│       │   ├── get-inventory.dto.ts                      [NEW]
│       │   ├── run-demand-forecast.dto.ts                [NEW]
│       │   ├── optimize-orders.dto.ts                    [NEW]
│       │   ├── approve-order.dto.ts                      [NEW]
│       │   └── transfer-item.dto.ts                      [NEW]
│       └── entities/
│           ├── supply-item.entity.ts                     [NEW]
│           ├── inventory-level.entity.ts                 [NEW]
│           ├── consumption-record.entity.ts              [NEW]
│           ├── supply-forecast.entity.ts                 [NEW]
│           ├── procurement-recommendation.entity.ts      [NEW]
│           ├── purchase-order-draft.entity.ts            [NEW]
│           ├── supplier.entity.ts                        [NEW]
│           └── expiration-alert.entity.ts                [NEW]
├── components/ui/
│   ├── Skeleton.tsx                                      [MODIFIED] - Add scatter chart and table skeleton variants
│   ├── Badge.tsx                                         [MODIFIED] - Add inventory risk badge variants
│   └── Table.tsx                                         [MODIFIED] - Add search header variant
└── middleware.ts                                          [MODIFIED] - Add /supply-chain route auth guard
```

## Implementation Status
OVERALL STATUS: NOT STARTED

### Phase 1: Foundation & Setup
| Task | Status |
|---|---|
| Create `src/app/supply-chain/` route directory and layout | Not Started |
| Define TypeScript interfaces in `supply-chain.types.ts` | Not Started |
| Define constants (categories, risk thresholds, expiration windows) in `supply-chain.constants.ts` | Not Started |
| Set up NestJS module, controller, and service stubs | Not Started |
| Create PostgreSQL migration for `supply_items`, `inventory_levels`, `consumption_records`, `supply_forecasts`, `procurement_recommendations`, `purchase_order_drafts`, `suppliers`, `expiration_alerts` tables | Not Started |
| Configure BullMQ queues `supply-demand-forecast` and `order-optimization` with processor stubs | Not Started |
| Set up inventory sync service for integration with hospital inventory system | Not Started |
| Set up expiration scanner as scheduled cron job (daily at 2 AM) | Not Started |
| Add route auth guard in middleware for `/supply-chain` | Not Started |

### Phase 2: Core Implementation
| Task | Status |
|---|---|
| Implement `SupplyChainPage` server component with RSC data fetching | Not Started |
| Build `InventoryHealthCard`, `StockoutRiskCard`, `CostSavingsOpportunityCard` summary components | Not Started |
| Build `InventoryTable` with pagination, sorting, search, and status badges | Not Started |
| Build `InventoryRiskMatrix` with scatter plot and quadrant overlays | Not Started |
| Implement `SupplyChainSidebar` with all filter components | Not Started |
| Implement `GET /api/v1/supply-chain/inventory` endpoint with PostgreSQL queries and pagination | Not Started |
| Implement `POST /api/v1/supply-chain/forecast` endpoint and BullMQ job dispatch | Not Started |
| Build `useInventoryForecast` hook with polling logic | Not Started |
| Implement demand forecast processor with Claude API for pattern analysis | Not Started |

### Phase 3: Enhanced Features
| Task | Status |
|---|---|
| Build `OptimizationRecommendationPanel` and `SupplyRecommendationCard` components | Not Started |
| Implement `POST /api/v1/supply-chain/optimize` order optimization endpoint | Not Started |
| Implement `PATCH /api/v1/supply-chain/recommendations/:id` with audit logging and PO draft creation | Not Started |
| Build `ExpirationTracker` and `ExpiringItemRow` components with action buttons | Not Started |
| Implement expiration alert endpoints and action tracking | Not Started |
| Build `ConsumptionTrendChart` with anomaly markers | Not Started |
| Build item detail page `[itemId]/page.tsx` with consumption history and order history | Not Started |
| Implement inventory transfer endpoint for inter-department transfers | Not Started |
| Add Neo4j integration for supplier relationship mapping and item substitution networks | Not Started |

### Phase 4: Polish & Testing
| Task | Status |
|---|---|
| Add loading skeletons and error boundary | Not Started |
| Implement responsive breakpoints for mobile and tablet | Not Started |
| Add WCAG 2.1 AA accessibility (aria labels, keyboard nav, table fallback for charts) | Not Started |
| Write unit tests for utility functions and hooks | Not Started |
| Write integration tests for page rendering and user interactions | Not Started |
| Write E2E tests for critical flows (forecast, approve order, expiration actions, transfers) | Not Started |
| Performance audit: table rendering with 500+ items, chart performance, bundle size | Not Started |

## Dependencies

### Internal Dependencies
| Dependency | Purpose | Status |
|---|---|---|
| Shared UI component library (`@/components/ui`) | Buttons, cards, tables, badges, modals, skeleton | Assumed available |
| Authentication middleware (`@/middleware.ts`) | JWT validation, role extraction | Assumed available |
| Database connection module (`@/server/database`) | PostgreSQL connection pool | Assumed available |
| Redis connection module (`@/server/redis`) | Redis client for caching and BullMQ | Assumed available |
| Neo4j connection module (`@/server/neo4j`) | Graph DB for supplier relationships and item substitutions | Assumed available |
| Audit logging service (`@/server/audit`) | Immutable audit trail writes | Assumed available |
| Bed Allocation module (`@/server/bed-allocation`) | Patient volume data used as demand driver for supply forecasting | Planned (Feature 02) |

### External Dependencies
| Package | Version | Purpose |
|---|---|---|
| `recharts` | `^2.12.x` | Scatter chart (risk matrix) and line chart (consumption trends) |
| `date-fns` | `^3.x` | Date manipulation, expiration countdown formatting |
| `@tanstack/react-query` | `^5.x` | Server state management, polling, cache invalidation |
| `@tanstack/react-table` | `^8.x` | Headless table primitives for sortable, paginated, searchable inventory table |
| `bullmq` | `^5.x` | Background job queue for forecasting and optimization |
| `@anthropic-ai/sdk` | `^0.30.x` | Claude API for consumption pattern analysis and anomaly detection |
| `zod` | `^3.x` | Request/response validation |
| `csv-stringify` | `^6.x` | CSV generation for inventory and recommendation exports |
| `fuse.js` | `^7.x` | Client-side fuzzy search for inventory table search |

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Inventory sync failures causing stale data | Medium | High | Implement retry with exponential backoff; periodic full reconciliation; staleness indicator on UI; alert on sync failure |
| Large item catalog (5000+ items) causing slow queries | Medium | Medium | PostgreSQL indexes on category, department, risk_level; materialized views for aggregations; pagination with cursor-based approach |
| Consumption anomaly false positives eroding trust | Medium | Medium | Tune anomaly detection thresholds; allow users to dismiss false positives; feedback loop to improve model |
| Claude API cost escalation with frequent optimization runs | Low | Medium | Cache optimization results for 4 hours; batch item analysis; limit concurrent optimization jobs per tenant |
| Order approval creates real procurement obligations | Low | High | Always generate DRAFT purchase orders; require explicit secondary approval before submission to procurement system; clear "draft" labeling |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Supply chain managers distrust AI ordering recommendations | High | High | Start with visibility-only mode (no order creation); show detailed rationale; allow manual adjustments; track accuracy over time |
| Expiration tracking misaligned with actual pharmacy/storage workflows | Medium | High | Integrate with pharmacy information system; validate expiration dates against lot-level records; configurable alert windows |
| Procurement savings projections inaccurate | Medium | Medium | Conservative estimates with explicit assumption statements; monthly reconciliation with actual spend; adjusted projections based on historical accuracy |
| Seasonal demand patterns not applicable to this specific hospital | Low | Medium | Allow manual seasonal factors; validate against local history before applying; option to disable seasonal modeling |

## Testing Strategy

### Unit Tests (Jest)
```
tests/unit/supply-chain/
├── supply-chain.utils.test.ts
│   ├── calculateDaysToStockout: handles zero consumption, high consumption, various rates
│   ├── getRiskLevel: returns correct risk for threshold boundaries
│   ├── getRiskColor: maps risk levels to correct Tailwind classes
│   ├── formatConsumptionRate: handles daily and weekly rates with units
│   ├── formatInventoryValue: currency formatting with K/M abbreviations
│   ├── calculateTurnoverRate: handles zero average inventory, normal cases
│   └── sortInventoryItems: multi-field sorting correctness
├── supply-chain.constants.test.ts
│   └── validates risk thresholds are non-overlapping and cover full range
├── useSupplyFilters.test.ts
│   ├── initializes from URL search params including search query
│   ├── debounces search and filter changes
│   └── resets all filters and search to defaults
└── useInventoryForecast.test.ts
    ├── triggers forecast job and transitions to polling state
    ├── polls at correct interval and stops on completion
    └── handles optimization job independently from forecast
```

### Integration Tests (React Testing Library)
```
tests/integration/supply-chain/
├── SupplyChainPage.test.tsx
│   ├── renders loading skeleton on initial load
│   ├── displays inventory data after fetch
│   ├── applies category filter and re-fetches data
│   └── shows error boundary on API failure
├── InventoryTable.test.tsx
│   ├── renders all items with correct columns
│   ├── sorts by column on header click
│   ├── paginates correctly with navigation
│   ├── search filters items in real-time
│   └── shows correct status badges based on risk level
├── InventoryRiskMatrix.test.tsx
│   ├── renders scatter dots for all items
│   ├── displays tooltip on dot hover
│   └── scrolls to table row on dot click
├── OptimizationRecommendationPanel.test.tsx
│   ├── renders recommendation cards sorted by priority
│   ├── approve creates purchase order draft
│   ├── adjust opens inline quantity editor
│   └── dismiss requires reason
└── ExpirationTracker.test.tsx
    ├── renders expiring items with countdown
    ├── filters by time window (7/30/90 days)
    ├── prioritize action updates item status
    └── transfer action opens department picker modal
```

### E2E Tests (Playwright)
```
tests/e2e/supply-chain/
├── supply-chain-forecast.spec.ts
│   ├── full forecast flow: set filters -> run forecast -> view consumption chart
│   ├── forecast results show anomaly markers on chart
│   └── anomaly click reveals explanation detail
├── supply-chain-recommendations.spec.ts
│   ├── approve order -> verify PO draft created
│   ├── adjust quantity -> verify updated recommendation
│   ├── dismiss recommendation -> verify reason captured
│   └── bulk approve -> verify multiple PO drafts
├── supply-chain-expiration.spec.ts
│   ├── view expiring items within 30 days
│   ├── prioritize item -> verify status update
│   ├── transfer item -> verify department transfer modal and completion
│   └── dispose item -> verify disposal confirmation and audit log
├── supply-chain-search.spec.ts
│   ├── search by item name -> correct results
│   ├── search by item code -> correct results
│   └── clear search -> shows all items
└── supply-chain-responsive.spec.ts
    ├── mobile: sidebar collapses, table scrolls with frozen column
    ├── tablet: drawer toggle, risk matrix responsive
    └── desktop: full layout visible
```

## Performance Considerations
| Area | Target | Strategy |
|---|---|---|
| **Initial Page Load (LCP)** | < 1.5s | Server-side rendering via RSC; stream inventory data; Suspense boundaries for chart and recommendation panels |
| **Inventory Table** | 60fps with 500 items | Virtual scrolling with `@tanstack/react-table`; paginate server-side (50 items per page); memoize row rendering |
| **Table Search** | < 200ms | Client-side fuzzy search with `fuse.js` for loaded page; server-side search for cross-page queries |
| **Risk Matrix** | 60fps with 500 dots | Canvas rendering fallback for > 200 items; cluster overlapping dots; memoize dot positions |
| **Demand Forecast** | < 60s | BullMQ dedicated worker; batch Claude API calls by category; Redis-cached intermediate results |
| **Order Optimization** | < 90s | Parallelized optimization per category; precomputed supplier pricing in Redis |
| **API Response (Inventory)** | < 500ms | PostgreSQL indexes on filter columns; cursor-based pagination; Redis cache with 5-minute TTL |
| **Bundle Size** | < 140KB (route) | Dynamic import for `InventoryRiskMatrix` and `ConsumptionTrendChart`; tree-shake Recharts |
| **Memory** | < 50MB client | Paginate inventory (50 items per page); limit chart data to visible window; dispose Fuse.js index on unmount |

## Deployment Plan
| Step | Action | Environment | Gate |
|---|---|---|---|
| 1 | Database migration: create supply chain tables and indexes | Staging -> Production | Migration scripts reviewed |
| 2 | Deploy inventory sync service and validate initial data import | Staging | Sync completes successfully; data verification |
| 3 | Deploy expiration scanner cron job | Staging | Scanner identifies known expiring items correctly |
| 4 | Deploy NestJS backend with feature flag `SUPPLY_CHAIN_ENABLED=false` | Staging | API integration tests pass |
| 5 | Deploy BullMQ forecast and optimization workers | Staging | Workers process test jobs successfully |
| 6 | Deploy frontend behind feature flag | Staging | E2E tests pass in staging |
| 7 | Internal QA with pilot hospital inventory data | Staging | QA sign-off checklist completed |
| 8 | Enable feature flag for pilot hospital | Production | Monitoring active; rollback documented |
| 9 | Monitor for 7 days: sync reliability, forecast accuracy, recommendation quality | Production | Sync success > 99%, forecast accuracy > 75% |
| 10 | General availability: enable for all tenants | Production | Pilot metrics meet thresholds |

## Monitoring & Analytics
| Metric | Tool | Alert Threshold |
|---|---|---|
| API error rate (`/supply-chain/*`) | CloudWatch + DataDog | > 1% over 5-minute window |
| Inventory sync success rate | Custom health check | < 99% over 24-hour window |
| Inventory sync latency | Custom middleware | > 5 minutes since last successful sync |
| Demand forecast job duration | BullMQ metrics | P95 > 90s |
| Order optimization job duration | BullMQ metrics | P95 > 120s |
| Forecast/optimization job failure rate | BullMQ dead-letter queue | Any job in DLQ |
| Expiration scanner execution | Cron job monitoring | Missed execution or failure |
| Claude API latency and token usage | Custom middleware | P95 > 15s; > 80% monthly budget |
| Page load time (LCP) | Vercel Analytics / Web Vitals | > 2.5s |
| Recommendation approval rate | Custom analytics | < 15% (indicates low recommendation quality) |
| Stockout events post-deployment | Custom event tracking | Any stockout after system predicted adequate supply |

## Documentation Requirements
| Document | Audience | Content |
|---|---|---|
| API Reference (OpenAPI spec) | Backend developers | All `/supply-chain/*` endpoints with schemas |
| Component Storybook Stories | Frontend developers | Interactive examples for all components |
| Supply Chain Manager User Guide | Hospital staff | How to interpret risk levels, approve orders, manage expiration |
| Inventory Integration Guide | Implementation team | How to connect hospital inventory systems (Omnicell, Pyxis); data mapping |
| Supplier Setup Guide | Implementation team | How to configure supplier catalog, GPO contracts, pricing |
| Runbook: Inventory Sync Failures | DevOps/SRE | Diagnostics and manual reconciliation procedures |
| Runbook: Forecast/Optimization Failures | DevOps/SRE | Job recovery and fallback procedures |

## Post-Launch Review
| Review Item | Timeline | Owner |
|---|---|---|
| Demand forecast accuracy (predicted vs. actual consumption) | 2 weeks post-launch | Data Science |
| Inventory sync reliability and data accuracy | 1 week post-launch | Engineering |
| Stockout prevention rate (stockouts avoided vs. baseline) | 4 weeks post-launch | Operations |
| Expiration tracking effectiveness (waste reduction vs. baseline) | 4 weeks post-launch | Operations |
| Procurement cost savings (actual vs. projected) | 8 weeks post-launch | Finance + Operations |
| User engagement (daily active users, recommendation actions) | 2 weeks post-launch | Product |
| Anomaly detection precision (true positives vs. false positives) | 3 weeks post-launch | Data Science |
| Performance audit (table rendering, API latency) | 1 week post-launch | Engineering |
| User feedback interviews with supply chain managers | 3 weeks post-launch | Product |
| Decision: Phase 2 features (automated PO submission, vendor scoring, substitution engine) | 6 weeks post-launch | Product + Engineering Lead |
