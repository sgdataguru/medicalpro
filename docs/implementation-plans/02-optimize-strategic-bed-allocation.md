# 02 Optimize Strategic Bed Allocation - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital administrator**, I want to **receive data-driven recommendations for strategic bed allocation across departments**, so that I can **maximize hospital revenue, reduce patient wait times, and improve throughput**.

## Pre-conditions
- Hospital department and ward structure is configured in the system with bed counts per ward
- ADT (Admission, Discharge, Transfer) data feed is active and streaming events to PostgreSQL
- Historical occupancy data (minimum 12 months) is available for predictive modeling
- Scheduled procedures calendar is integrated or importable from the surgical scheduling system
- Department-level revenue data is available from the billing/financial system
- User has `ADMIN` or `BED_MANAGER` role with appropriate RBAC permissions
- Redis is operational for caching occupancy snapshots and real-time census data
- BullMQ workers are deployed for background forecast job processing
- Claude API key is provisioned for demand pattern analysis and NLP-driven insights

## Business Requirements
- **BR-1**: Increase average bed utilization from current baseline by 8% within 6 months
  - *Success Metric*: Track weekly average occupancy percentage across all departments
- **BR-2**: Reduce average patient wait time for bed assignment by 20%
  - *Success Metric*: Measure time from admission order to bed assignment pre/post deployment
- **BR-3**: Reduce revenue loss from unoccupied beds by 10%
  - *Success Metric*: Calculate lost revenue from empty beds in high-demand departments
- **BR-4**: Provide 7-day bed demand forecasts with 80%+ accuracy
  - *Success Metric*: Compare forecasted occupancy vs. actual occupancy over rolling 30-day windows
- **BR-5**: Alert administrators at least 24 hours before projected capacity breaches
  - *Success Metric*: Percentage of capacity events identified with >= 24-hour lead time
- **BR-6**: Enable department-level revenue impact modeling for reallocation scenarios
  - *Success Metric*: Revenue projections within 5% of actual outcomes for accepted recommendations

## Technical Specifications

### Integration Points
| Integration | Protocol | Source | Purpose |
|---|---|---|---|
| ADT System (Epic/Cerner) | HL7 FHIR R4 / ADT feeds | Real-time admissions, discharges, transfers | Live bed occupancy tracking and census updates |
| Surgical Scheduling System | REST API / HL7 SIU | Scheduled procedures calendar | Forecasted post-surgical bed demand |
| Financial/Billing System | REST API / SFTP | Department revenue data | Revenue impact calculations for reallocation scenarios |
| Census Management System | REST API | Real-time patient census | Current bed assignments and patient acuity levels |
| BullMQ Job Queue | Redis | Internal | Asynchronous forecast computation and scenario analysis |
| Claude API | REST | Anthropic | Demand pattern analysis, seasonal trend detection, NLP insights |
| Neo4j Graph DB | Bolt Protocol | Internal | Department adjacency modeling, patient flow pathways, transfer route optimization |

### Security Requirements
| Requirement | Implementation |
|---|---|
| HIPAA-Adjacent Compliance | Bed occupancy data is aggregated at ward level (no individual patient identifiers in dashboard views); patient IDs used only in backend processing, never exposed to frontend |
| Data Encryption | All occupancy and revenue data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Role-Based Access Control | `BED_MANAGER` can view recommendations and run scenarios; `ADMIN` can approve reallocations; `FINANCE` can view revenue projections; `VIEWER` read-only |
| Audit Logging | Every reallocation recommendation viewed, scenario run, and approval action logged to `audit_log` with user ID, timestamp, and parameters |
| Data Retention | Occupancy snapshots retained for 7 years; forecast results retained for 3 years |
| API Rate Limiting | Forecast endpoints throttled to 30 RPM per tenant; Redis-backed rate limiter |

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  [TopNav: MedicalPro Logo | Dashboard | Staff | Beds | ... ]     |
+------------------------------------------------------------------+
|  Sidebar  |  Main Content Area                                   |
|           |                                                       |
|  Filters  |  +--------------------------------------------------+|
|  --------+|  | BedAllocationHeader                               ||
|  Dept [v] |  |  "Strategic Bed Allocation"                       ||
|  Ward [v] |  |  [Last updated: 2m ago]  [Refresh] [Export]       ||
|  Period[v]|  +--------------------------------------------------+|
|           |                                                       |
|  Actions  |  +------------+  +------------+  +------------------+|
|  --------+|  | Occupancy  |  | Forecast   |  | Revenue Impact  ||
|  [Run     |  | Rate Card  |  | Summary    |  | Summary Card    ||
|   Forecast|  | Overall:   |  | Card       |  | Monthly Rev:    ||
|   ]       |  | 78.4%      |  | 7-Day Pred:|  | $4.2M           ||
|           |  | Beds: 342/ |  | Peak: 91%  |  | Realloc Impact: ||
|  [Scenario|  | 436        |  | Low: 68%   |  | +$180K/mo       ||
|   Builder]|  +------------+  +------------+  +------------------+|
|           |                                                       |
|  [Compare |  +--------------------------------------------------+|
|   Layouts]|  | OccupancyTrendChart                                ||
|           |  |  [Area chart: occupancy % over time by dept]      ||
|           |  |  [Overlay: forecast projection with confidence    ||
|           |  |   band]                                           ||
|           |  |  [Threshold lines: capacity limit, target range]  ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | DepartmentOccupancyTable                           ||
|           |  |  Dept | Ward | Total | Occ | Avail | Trend | Rev ||
|           |  |  -----|------|-------|-----|-------|-------|------||
|           |  |  ICU  | A    | 24    | 22  | 2     | ↑     | $1.2M|
|           |  |  ER   | Main | 40    | 38  | 2     | ↑     | $890K|
|           |  |  Surg | B    | 32    | 21  | 11    | →     | $650K|
|           |  |  Onco | C    | 28    | 18  | 10    | ↓     | $420K|
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | ReallocationRecommendationPanel                    ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #1: Transfer 4 beds from Oncology Ward C | ||
|           |  |  |   to ICU Ward A                              | ||
|           |  |  | Revenue Impact: +$85K/mo | Wait Time: -18%   | ||
|           |  |  | [Approve] [Reject] [Simulate]                | ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #2: Add 2 overflow beds to ER from       | ||
|           |  |  |   Step-Down Unit during peak hours           | ||
|           |  |  | ...                                          | ||
|           |  |  +----------------------------------------------+ ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +------------------------+  +-----------------------+|
|           |  | CapacityAlertPanel     |  | ScenarioComparison    ||
|           |  | [List of upcoming      |  | [Side-by-side layout  ||
|           |  |  capacity breaches     |  |  comparison: current  ||
|           |  |  with countdown timers |  |  vs. proposed bed     ||
|           |  |  and severity badges]  |  |  distribution]        ||
|           |  +------------------------+  +-----------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
BedAllocationPage (Server Component - layout + data fetching)
├── BedAllocationHeader
│   ├── PageTitle
│   ├── LastUpdatedIndicator
│   └── ActionButtonGroup (Refresh, Export)
├── BedAllocationSidebar
│   ├── DepartmentFilter (multi-select dropdown)
│   ├── WardFilter (cascading from department selection)
│   ├── TimeperiodSelector (7-day, 14-day, 30-day)
│   └── SidebarActions
│       ├── RunForecastButton
│       ├── ScenarioBuilderButton
│       └── CompareLayoutsButton
├── OccupancySummaryRow
│   ├── OccupancyRateCard
│   ├── ForecastSummaryCard
│   └── RevenueImpactSummaryCard
├── OccupancyTrendChart (Recharts AreaChart)
│   ├── ActualOccupancyLine
│   ├── ForecastProjectionArea
│   ├── ConfidenceBand
│   └── ThresholdLines
├── DepartmentOccupancyTable
│   ├── TableHeader (sortable columns)
│   ├── DepartmentOccupancyRow (repeated)
│   │   ├── OccupancyBar (inline progress bar)
│   │   ├── TrendIndicator (arrow icon)
│   │   └── RevenueCell
│   └── TablePagination
├── ReallocationRecommendationPanel
│   ├── RecommendationSortControls
│   └── ReallocationRecommendationCard (repeated)
│       ├── ReallocationSummary
│       ├── RevenueImpactBadge
│       ├── WaitTimeImpactBadge
│       └── RecommendationActions (Approve, Reject, Simulate)
├── CapacityAlertPanel
│   ├── CapacityAlertList
│   │   └── CapacityAlertItem (repeated)
│   │       ├── AlertSeverityBadge
│   │       ├── AlertCountdown
│   │       └── AlertDepartmentInfo
│   └── AlertFilterTabs (All, Critical, Warning)
└── ScenarioComparisonPanel
    ├── CurrentLayoutDiagram
    ├── ProposedLayoutDiagram
    └── ImpactDeltaSummary
```

### Design System Compliance
| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#031926` | Page background, table headers, primary text |
| `--color-teal` | `#007B7A` | Adequate occupancy indicators, approve buttons, healthy occupancy zones on chart |
| `--color-cerulean` | `#00B3C6` | Forecast projection lines, links, active tab indicators |
| `--color-gold` | `#C9A84A` | Revenue impact badges, warning-level capacity alerts, threshold lines |
| `--color-danger` | `#DC2626` | Critical capacity alerts, over-capacity zones, reject buttons |
| `--color-success` | `#059669` | Positive revenue impact deltas, improved wait-time metrics |
| `--font-heading` | `Merriweather, serif` | Page title, card headers, department names in table |
| `--font-body` | `Inter, sans-serif` | Body text, table data, metrics, labels |
| `--spacing-card` | `p-6` (24px) | Internal card padding |
| `--spacing-gap` | `gap-6` (24px) | Grid gap between cards |
| `--radius-card` | `rounded-xl` (12px) | Card border radius |
| `--shadow-card` | `shadow-md` | Elevated card surfaces |
| `--chart-grid` | `stroke: #E5E7EB` | Chart gridlines (subtle gray) |

### Responsive Behavior
| Breakpoint | Layout | Behavior |
|---|---|---|
| `< 640px` (mobile) | Single column; sidebar collapses to bottom sheet | Summary cards stack vertically; table scrolls horizontally; chart simplified (fewer data points); recommendation cards stack |
| `640px - 1024px` (tablet) | Two-column grid; sidebar as collapsible drawer | Summary cards in 2-column row; table fits with horizontal scroll; chart responsive; scenario comparison stacks |
| `> 1024px` (desktop) | Full layout as shown in ASCII diagram | All panels visible; sidebar pinned left; table shows all columns; scenario comparison side-by-side |

### Interaction Patterns
| Interaction | Behavior |
|---|---|
| **Run Forecast** | Button shows spinner + "Forecasting..."; disabled during processing; SSE or polling for progress updates; toast on completion |
| **Filter Change** | Debounced 300ms; skeleton loaders on data panels; URL search params updated for deep-linking |
| **Table Row Hover** | Row highlights with subtle background; shows "View Details" action icon |
| **Table Row Click** | Opens department drill-down modal with ward-level bed breakdown and mini occupancy chart |
| **Recommendation Approve** | Confirmation modal showing full impact analysis; requires typed approval note; logged to audit trail |
| **Recommendation Simulate** | Opens ScenarioComparisonPanel with animated transition; shows side-by-side current vs. proposed layout |
| **Capacity Alert Click** | Scrolls to and highlights relevant department row in table; opens detail popover with recommended actions |
| **Chart Hover** | Crosshair cursor with tooltip showing date, actual occupancy, forecasted occupancy, and delta |
| **Chart Zoom** | Click-and-drag to zoom into date range; double-click to reset zoom; pinch-to-zoom on touch |
| **Export** | Background job; toast with "Preparing export..." then "Download ready" with download link |
| **Loading States** | Skeleton placeholders matching card/table/chart dimensions; pulse animation |
| **Error States** | Inline error banners with retry action; stale data indicator when cache is used |

## Technical Architecture

### Component Structure
```
src/
├── app/
│   └── bed-allocation/
│       ├── page.tsx                           # Server component: data fetching + layout
│       ├── layout.tsx                         # Bed allocation section layout
│       ├── loading.tsx                        # Streaming skeleton UI
│       ├── error.tsx                          # Error boundary
│       ├── [departmentId]/
│       │   ├── page.tsx                       # Department drill-down detail page
│       │   └── loading.tsx
│       ├── _components/
│       │   ├── BedAllocationHeader.tsx
│       │   ├── BedAllocationSidebar.tsx
│       │   ├── OccupancyRateCard.tsx
│       │   ├── ForecastSummaryCard.tsx
│       │   ├── RevenueImpactSummaryCard.tsx
│       │   ├── OccupancyTrendChart.tsx
│       │   ├── DepartmentOccupancyTable.tsx
│       │   ├── DepartmentOccupancyRow.tsx
│       │   ├── OccupancyBar.tsx
│       │   ├── TrendIndicator.tsx
│       │   ├── ReallocationRecommendationPanel.tsx
│       │   ├── ReallocationRecommendationCard.tsx
│       │   ├── CapacityAlertPanel.tsx
│       │   ├── CapacityAlertItem.tsx
│       │   ├── ScenarioComparisonPanel.tsx
│       │   ├── CurrentLayoutDiagram.tsx
│       │   ├── ProposedLayoutDiagram.tsx
│       │   ├── DepartmentFilter.tsx
│       │   ├── WardFilter.tsx
│       │   ├── TimePeriodSelector.tsx
│       │   ├── RunForecastButton.tsx
│       │   └── ScenarioBuilderButton.tsx
│       └── _hooks/
│           ├── useBedAllocation.ts
│           ├── useBedForecast.ts
│           ├── useReallocationRecommendations.ts
│           ├── useCapacityAlerts.ts
│           └── useBedFilters.ts
├── lib/
│   └── bed-allocation/
│       ├── bed-allocation.service.ts          # API client functions
│       ├── bed-allocation.types.ts            # TypeScript interfaces
│       ├── bed-allocation.utils.ts            # Formatting, calculation helpers
│       └── bed-allocation.constants.ts        # Occupancy thresholds, ward types
└── server/
    └── bed-allocation/
        ├── bed-allocation.controller.ts       # NestJS REST controller
        ├── bed-allocation.service.ts          # Business logic
        ├── bed-allocation.module.ts           # NestJS module
        ├── forecast.processor.ts              # BullMQ job processor for demand forecasting
        ├── adt-listener.service.ts            # ADT event stream listener for real-time census
        ├── dto/
        │   ├── get-occupancy.dto.ts
        │   ├── run-forecast.dto.ts
        │   ├── create-scenario.dto.ts
        │   └── approve-reallocation.dto.ts
        └── entities/
            ├── bed.entity.ts
            ├── ward.entity.ts
            ├── occupancy-snapshot.entity.ts
            ├── bed-forecast.entity.ts
            ├── reallocation-recommendation.entity.ts
            └── capacity-alert.entity.ts
```

### State Management Architecture
```typescript
// --- Global State (React Context + useReducer) ---

interface BedAllocationGlobalState {
  filters: BedAllocationFilters;
  occupancy: DepartmentOccupancy[];
  forecast: BedDemandForecast | null;
  recommendations: ReallocationRecommendation[];
  capacityAlerts: CapacityAlert[];
  forecastJobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  scenarioMode: boolean;
  activeScenario: ReallocationScenario | null;
}

interface BedAllocationFilters {
  departmentIds: string[];
  wardIds: string[];
  timePeriod: '7d' | '14d' | '30d';
  dateRange: { start: Date; end: Date };
}

// --- Domain Types ---

type WardType = 'ICU' | 'EMERGENCY' | 'SURGICAL' | 'MEDICAL' | 'PEDIATRIC' | 'MATERNITY' | 'PSYCHIATRIC' | 'STEPDOWN' | 'REHAB';
type BedStatus = 'OCCUPIED' | 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE' | 'BLOCKED';

interface DepartmentOccupancy {
  departmentId: string;
  departmentName: string;
  wards: WardOccupancy[];
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;           // 0.0 - 1.0
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  trendPercentage: number;         // e.g., +3.2 or -1.5
  monthlyRevenue: number;
  revenuePerBedDay: number;
  averageLengthOfStay: number;     // days
}

interface WardOccupancy {
  wardId: string;
  wardName: string;
  wardType: WardType;
  totalBeds: number;
  beds: BedSummary[];
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  averagePatientAcuity: number;    // 1-5 scale
}

interface BedSummary {
  bedId: string;
  bedNumber: string;
  status: BedStatus;
  wardId: string;
  patientAcuity?: number;
  estimatedDischargeDate?: string; // ISO date
  admissionDate?: string;          // ISO date
}

interface BedDemandForecast {
  forecastId: string;
  generatedAt: string;             // ISO datetime
  horizonDays: number;
  confidence: number;              // 0.0 - 1.0
  modelVersion: string;
  departmentForecasts: DepartmentForecast[];
  peakOccupancyDate: string;
  peakOccupancyRate: number;
  troughOccupancyDate: string;
  troughOccupancyRate: number;
}

interface DepartmentForecast {
  departmentId: string;
  departmentName: string;
  dailyForecasts: DailyBedForecast[];
}

interface DailyBedForecast {
  date: string;                    // ISO date
  predictedAdmissions: number;
  predictedDischarges: number;
  predictedOccupancy: number;
  predictedOccupancyRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  isOverCapacity: boolean;
  isBelowThreshold: boolean;
  scheduledProcedures: number;
}

interface ReallocationRecommendation {
  recommendationId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'TRANSFER_BEDS' | 'ADD_OVERFLOW' | 'CONVERT_WARD' | 'TEMPORARY_EXPANSION';
  sourceDepartmentId: string;
  sourceDepartmentName: string;
  sourceWardId: string;
  sourceWardName: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  targetWardId: string;
  targetWardName: string;
  bedCount: number;
  description: string;
  rationale: string;               // AI-generated explanation
  revenueImpact: {
    monthly: number;
    annual: number;
    revenuePerBedDayDelta: number;
  };
  waitTimeImpact: {
    currentAvgMinutes: number;
    projectedAvgMinutes: number;
    reductionPercentage: number;
  };
  throughputImpact: {
    currentDailyDischarges: number;
    projectedDailyDischarges: number;
    improvementPercentage: number;
  };
  constraints: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  approvalNote?: string;
  rejectionReason?: string;
}

interface CapacityAlert {
  alertId: string;
  departmentId: string;
  departmentName: string;
  wardId?: string;
  wardName?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: 'OVER_CAPACITY' | 'NEAR_CAPACITY' | 'BELOW_THRESHOLD' | 'SURGE_PREDICTED';
  message: string;
  projectedDate: string;           // ISO datetime
  hoursUntilEvent: number;
  currentOccupancyRate: number;
  projectedOccupancyRate: number;
  recommendedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface ReallocationScenario {
  scenarioId: string;
  name: string;
  changes: BedReallocationChange[];
  projectedRevenueDelta: number;
  projectedWaitTimeDelta: number;
  projectedThroughputDelta: number;
  createdAt: string;
}

interface BedReallocationChange {
  sourceDepartmentId: string;
  targetDepartmentId: string;
  sourceWardId: string;
  targetWardId: string;
  bedCount: number;
}
```

### API Integration Schema
```typescript
// ============================================================
// GET /api/v1/bed-allocation/occupancy
// Fetch current bed occupancy data
// ============================================================
interface GetOccupancyRequest {
  params: {
    departmentIds?: string[];
    wardIds?: string[];
    includeWardDetail?: boolean;
  };
}

interface GetOccupancyResponse {
  data: {
    departments: DepartmentOccupancy[];
    totals: {
      totalBeds: number;
      occupiedBeds: number;
      availableBeds: number;
      overallOccupancyRate: number;
    };
    asOf: string;
  };
  meta: {
    cached: boolean;
    cacheExpiry: string;
  };
}

// ============================================================
// GET /api/v1/bed-allocation/occupancy/trends
// Fetch historical occupancy trend data for charts
// ============================================================
interface GetOccupancyTrendsRequest {
  params: {
    departmentIds?: string[];
    period: '7d' | '14d' | '30d' | '90d';
    granularity: 'hourly' | 'daily';
  };
}

interface GetOccupancyTrendsResponse {
  data: {
    trends: {
      departmentId: string;
      departmentName: string;
      dataPoints: {
        timestamp: string;
        occupancyRate: number;
        occupiedBeds: number;
        totalBeds: number;
      }[];
    }[];
    period: { start: string; end: string };
  };
}

// ============================================================
// POST /api/v1/bed-allocation/forecast
// Trigger a bed demand forecast job (async via BullMQ)
// ============================================================
interface RunForecastRequest {
  body: {
    departmentIds: string[];
    horizonDays: 7 | 14 | 30;
    includeSeasonalPatterns: boolean;
    includeScheduledProcedures: boolean;
  };
}

interface RunForecastResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/bed-allocation/forecast/:jobId
// Poll forecast job status and results
// ============================================================
interface GetForecastResultRequest {
  params: { jobId: string };
}

interface GetForecastResultResponse {
  data: {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    forecast?: BedDemandForecast;
    error?: string;
  };
}

// ============================================================
// GET /api/v1/bed-allocation/recommendations
// Fetch AI-generated reallocation recommendations
// ============================================================
interface GetReallocationRecommendationsRequest {
  params: {
    forecastId: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

interface GetReallocationRecommendationsResponse {
  data: {
    recommendations: ReallocationRecommendation[];
    summary: {
      totalRecommendations: number;
      criticalCount: number;
      projectedTotalRevenueImpact: number;
      projectedAvgWaitTimeReduction: number;
    };
  };
}

// ============================================================
// PATCH /api/v1/bed-allocation/recommendations/:id
// Approve or reject a reallocation recommendation
// ============================================================
interface UpdateReallocationRequest {
  params: { id: string };
  body: {
    status: 'APPROVED' | 'REJECTED';
    approvalNote?: string;
    rejectionReason?: string;
  };
}

interface UpdateReallocationResponse {
  data: {
    recommendation: ReallocationRecommendation;
    auditLogId: string;
  };
}

// ============================================================
// POST /api/v1/bed-allocation/scenarios
// Create a what-if reallocation scenario
// ============================================================
interface CreateScenarioRequest {
  body: {
    name: string;
    changes: BedReallocationChange[];
  };
}

interface CreateScenarioResponse {
  data: {
    scenario: ReallocationScenario;
  };
}

// ============================================================
// GET /api/v1/bed-allocation/capacity-alerts
// Fetch upcoming capacity alerts
// ============================================================
interface GetCapacityAlertsRequest {
  params: {
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    departmentIds?: string[];
    acknowledged?: boolean;
  };
}

interface GetCapacityAlertsResponse {
  data: {
    alerts: CapacityAlert[];
    summary: {
      criticalCount: number;
      warningCount: number;
      earliestCritical: string | null;
    };
  };
}

// ============================================================
// PATCH /api/v1/bed-allocation/capacity-alerts/:id/acknowledge
// Acknowledge a capacity alert
// ============================================================
interface AcknowledgeAlertRequest {
  params: { id: string };
}

interface AcknowledgeAlertResponse {
  data: {
    alert: CapacityAlert;
  };
}

// ============================================================
// GET /api/v1/bed-allocation/revenue-impact
// Revenue projection for allocation changes
// ============================================================
interface GetRevenueImpactRequest {
  params: {
    scenarioId?: string;
    recommendationId?: string;
    departmentIds?: string[];
  };
}

interface GetRevenueImpactResponse {
  data: {
    currentMonthlyRevenue: number;
    projectedMonthlyRevenue: number;
    delta: number;
    deltaPercentage: number;
    departmentBreakdown: {
      departmentId: string;
      departmentName: string;
      currentRevenue: number;
      projectedRevenue: number;
      delta: number;
    }[];
  };
}
```

## Implementation Requirements

### Core Components
| Component | File | Purpose |
|---|---|---|
| `BedAllocationPage` | `src/app/bed-allocation/page.tsx` | Server component; fetches initial occupancy data via RSC; renders layout shell |
| `BedAllocationHeader` | `src/app/bed-allocation/_components/BedAllocationHeader.tsx` | Page title, last-updated timestamp, refresh and export action buttons |
| `BedAllocationSidebar` | `src/app/bed-allocation/_components/BedAllocationSidebar.tsx` | Filter panel with department, ward, and time-period selectors; action buttons |
| `OccupancyRateCard` | `src/app/bed-allocation/_components/OccupancyRateCard.tsx` | Summary card showing overall occupancy rate, bed counts |
| `ForecastSummaryCard` | `src/app/bed-allocation/_components/ForecastSummaryCard.tsx` | Summary card showing forecast peak/trough occupancy and confidence |
| `RevenueImpactSummaryCard` | `src/app/bed-allocation/_components/RevenueImpactSummaryCard.tsx` | Summary card showing monthly revenue and projected reallocation impact |
| `OccupancyTrendChart` | `src/app/bed-allocation/_components/OccupancyTrendChart.tsx` | Recharts area chart with actual and forecasted occupancy lines |
| `DepartmentOccupancyTable` | `src/app/bed-allocation/_components/DepartmentOccupancyTable.tsx` | Sortable table with department-level bed occupancy data |
| `DepartmentOccupancyRow` | `src/app/bed-allocation/_components/DepartmentOccupancyRow.tsx` | Table row with inline occupancy bar, trend indicator, and revenue cell |
| `ReallocationRecommendationPanel` | `src/app/bed-allocation/_components/ReallocationRecommendationPanel.tsx` | Scrollable list of reallocation recommendations with sort/filter |
| `ReallocationRecommendationCard` | `src/app/bed-allocation/_components/ReallocationRecommendationCard.tsx` | Individual recommendation with revenue/wait-time impacts and actions |
| `CapacityAlertPanel` | `src/app/bed-allocation/_components/CapacityAlertPanel.tsx` | List of upcoming capacity alerts with severity badges and countdowns |
| `CapacityAlertItem` | `src/app/bed-allocation/_components/CapacityAlertItem.tsx` | Individual alert with countdown timer and acknowledge action |
| `ScenarioComparisonPanel` | `src/app/bed-allocation/_components/ScenarioComparisonPanel.tsx` | Side-by-side current vs. proposed bed layout comparison |

### Custom Hooks
| Hook | File | Description |
|---|---|---|
| `useBedAllocation` | `src/app/bed-allocation/_hooks/useBedAllocation.ts` | Manages global bed allocation state; provides actions for filter updates, data refresh |
| `useBedForecast` | `src/app/bed-allocation/_hooks/useBedForecast.ts` | Handles forecast job lifecycle: trigger, poll status, receive results |
| `useReallocationRecommendations` | `src/app/bed-allocation/_hooks/useReallocationRecommendations.ts` | Fetches, sorts, and manages recommendation state; handles approve/reject mutations |
| `useCapacityAlerts` | `src/app/bed-allocation/_hooks/useCapacityAlerts.ts` | Fetches capacity alerts; manages acknowledge actions; auto-refresh on interval |
| `useBedFilters` | `src/app/bed-allocation/_hooks/useBedFilters.ts` | Syncs filter state with URL search params; cascading ward filter from department; debounced changes |

### Utility Functions
| Utility | File | Description |
|---|---|---|
| `formatOccupancyRate` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Formats decimal to percentage string (e.g., 0.784 -> "78.4%") |
| `getOccupancyColor` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Returns Tailwind color class based on occupancy thresholds (green/yellow/red) |
| `getTrendIcon` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Returns trend arrow icon component based on RISING/STABLE/DECLINING |
| `formatRevenue` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Currency formatting with K/M abbreviations for revenue values |
| `calculateRevenuePerBedDay` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Computes revenue per occupied bed per day |
| `buildOccupancyQueryParams` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Serializes filter state to URL search params |
| `sortRecommendationsByImpact` | `src/lib/bed-allocation/bed-allocation.utils.ts` | Multi-criteria sort: priority, revenue impact, wait time improvement |
| `OCCUPANCY_THRESHOLDS` | `src/lib/bed-allocation/bed-allocation.constants.ts` | Over-capacity (>95%), warning (>85%), target (70-85%), low (<60%) thresholds |
| `WARD_TYPE_LABELS` | `src/lib/bed-allocation/bed-allocation.constants.ts` | Ward type enum to display label mapping |
| `BED_STATUS_COLORS` | `src/lib/bed-allocation/bed-allocation.constants.ts` | Bed status to Tailwind color mapping |

## Acceptance Criteria

### Functional Requirements
1. The dashboard displays current bed occupancy rates by department and ward with real-time census data
2. Users can filter the view by departments, wards, and time periods (7-day, 14-day, 30-day)
3. The occupancy trend chart shows historical occupancy data with a configurable time window
4. Clicking "Run Forecast" triggers a background forecast job and shows progress until results are ready
5. Forecast results overlay on the trend chart with a confidence band and threshold lines
6. The department occupancy table is sortable by any column and shows inline occupancy bars and trend indicators
7. Clicking a department row opens a drill-down view with ward-level bed breakdown
8. Reallocation recommendations include source/target department, bed count, revenue impact, and wait-time impact
9. Users can approve (with note), reject (with reason), or simulate each recommendation
10. The scenario comparison panel shows side-by-side current vs. proposed bed distribution
11. Capacity alerts display countdown timers with severity-coded badges for upcoming breaches
12. Alerts when occupancy is projected to exceed 95% capacity or drop below 60% threshold
13. Revenue impact projections are shown for each recommended reallocation change
14. All filter selections persist in URL search parameters for shareability and browser navigation

### Non-Functional Requirements
| Category | Requirement |
|---|---|
| **Performance** | Initial page load with server-rendered occupancy data completes within 1.5s |
| **Performance** | Occupancy trend chart renders up to 30 days of hourly data (720 data points) smoothly at 60fps |
| **Performance** | Forecast job completes within 45 seconds for a 500-bed hospital |
| **Performance** | Real-time census updates reflected in dashboard within 30 seconds of ADT event |
| **Accessibility** | WCAG 2.1 AA compliant; chart data available in accessible table format; screen reader announces alerts |
| **Security** | No patient identifiers exposed in any frontend view; all data aggregated at ward/department level |
| **Security** | Approval actions require re-authentication for CRITICAL priority recommendations |
| **Reliability** | Graceful degradation with cached data if forecast service is unavailable |
| **Scalability** | Supports 40 concurrent users viewing bed allocation dashboards |

## Modified Files
```
src/
├── app/
│   └── bed-allocation/
│       ├── page.tsx                                     [NEW]
│       ├── layout.tsx                                   [NEW]
│       ├── loading.tsx                                  [NEW]
│       ├── error.tsx                                    [NEW]
│       ├── [departmentId]/
│       │   ├── page.tsx                                 [NEW]
│       │   └── loading.tsx                              [NEW]
│       ├── _components/
│       │   ├── BedAllocationHeader.tsx                  [NEW]
│       │   ├── BedAllocationSidebar.tsx                 [NEW]
│       │   ├── OccupancyRateCard.tsx                    [NEW]
│       │   ├── ForecastSummaryCard.tsx                  [NEW]
│       │   ├── RevenueImpactSummaryCard.tsx             [NEW]
│       │   ├── OccupancyTrendChart.tsx                  [NEW]
│       │   ├── DepartmentOccupancyTable.tsx             [NEW]
│       │   ├── DepartmentOccupancyRow.tsx               [NEW]
│       │   ├── OccupancyBar.tsx                         [NEW]
│       │   ├── TrendIndicator.tsx                       [NEW]
│       │   ├── ReallocationRecommendationPanel.tsx      [NEW]
│       │   ├── ReallocationRecommendationCard.tsx       [NEW]
│       │   ├── CapacityAlertPanel.tsx                   [NEW]
│       │   ├── CapacityAlertItem.tsx                    [NEW]
│       │   ├── ScenarioComparisonPanel.tsx              [NEW]
│       │   ├── CurrentLayoutDiagram.tsx                 [NEW]
│       │   ├── ProposedLayoutDiagram.tsx                [NEW]
│       │   ├── DepartmentFilter.tsx                     [NEW]
│       │   ├── WardFilter.tsx                           [NEW]
│       │   ├── TimePeriodSelector.tsx                   [NEW]
│       │   ├── RunForecastButton.tsx                    [NEW]
│       │   └── ScenarioBuilderButton.tsx                [NEW]
│       └── _hooks/
│           ├── useBedAllocation.ts                      [NEW]
│           ├── useBedForecast.ts                        [NEW]
│           ├── useReallocationRecommendations.ts        [NEW]
│           ├── useCapacityAlerts.ts                     [NEW]
│           └── useBedFilters.ts                         [NEW]
├── lib/
│   └── bed-allocation/
│       ├── bed-allocation.service.ts                    [NEW]
│       ├── bed-allocation.types.ts                      [NEW]
│       ├── bed-allocation.utils.ts                      [NEW]
│       └── bed-allocation.constants.ts                  [NEW]
├── server/
│   └── bed-allocation/
│       ├── bed-allocation.controller.ts                 [NEW]
│       ├── bed-allocation.service.ts                    [NEW]
│       ├── bed-allocation.module.ts                     [NEW]
│       ├── forecast.processor.ts                        [NEW]
│       ├── adt-listener.service.ts                      [NEW]
│       ├── dto/
│       │   ├── get-occupancy.dto.ts                     [NEW]
│       │   ├── run-forecast.dto.ts                      [NEW]
│       │   ├── create-scenario.dto.ts                   [NEW]
│       │   └── approve-reallocation.dto.ts              [NEW]
│       └── entities/
│           ├── bed.entity.ts                            [NEW]
│           ├── ward.entity.ts                           [NEW]
│           ├── occupancy-snapshot.entity.ts              [NEW]
│           ├── bed-forecast.entity.ts                   [NEW]
│           ├── reallocation-recommendation.entity.ts    [NEW]
│           └── capacity-alert.entity.ts                 [NEW]
├── components/ui/
│   ├── Skeleton.tsx                                     [MODIFIED] - Add table and chart skeleton variants
│   └── Badge.tsx                                        [MODIFIED] - Add severity badge variant for capacity alerts
└── middleware.ts                                         [MODIFIED] - Add /bed-allocation route auth guard
```

## Implementation Status
OVERALL STATUS: NOT STARTED

### Phase 1: Foundation & Setup
| Task | Status |
|---|---|
| Create `src/app/bed-allocation/` route directory and layout | Not Started |
| Define TypeScript interfaces in `bed-allocation.types.ts` | Not Started |
| Define constants (thresholds, ward types, bed statuses) in `bed-allocation.constants.ts` | Not Started |
| Set up NestJS module, controller, and service stubs | Not Started |
| Create PostgreSQL migration for `beds`, `wards`, `occupancy_snapshots`, `bed_forecasts`, `reallocation_recommendations`, `capacity_alerts` tables | Not Started |
| Configure BullMQ queue `bed-forecast` and processor stub | Not Started |
| Set up ADT event listener service for real-time census updates | Not Started |
| Add route auth guard in middleware for `/bed-allocation` | Not Started |

### Phase 2: Core Implementation
| Task | Status |
|---|---|
| Implement `BedAllocationPage` server component with RSC data fetching | Not Started |
| Build `OccupancyRateCard`, `ForecastSummaryCard`, `RevenueImpactSummaryCard` summary components | Not Started |
| Build `OccupancyTrendChart` with Recharts area chart, forecast overlay, and confidence band | Not Started |
| Build `DepartmentOccupancyTable` with sortable columns and inline occupancy bars | Not Started |
| Implement `BedAllocationSidebar` with department, ward, and time-period filters | Not Started |
| Implement `GET /api/v1/bed-allocation/occupancy` endpoint with PostgreSQL queries | Not Started |
| Implement `GET /api/v1/bed-allocation/occupancy/trends` endpoint for chart data | Not Started |
| Implement `POST /api/v1/bed-allocation/forecast` endpoint and BullMQ job dispatch | Not Started |
| Build `useBedForecast` hook with polling logic for job status | Not Started |
| Implement forecast processor with Claude API for demand pattern analysis | Not Started |

### Phase 3: Enhanced Features
| Task | Status |
|---|---|
| Build `ReallocationRecommendationPanel` and `ReallocationRecommendationCard` components | Not Started |
| Implement `PATCH /api/v1/bed-allocation/recommendations/:id` with audit logging | Not Started |
| Build `CapacityAlertPanel` and `CapacityAlertItem` with countdown timers | Not Started |
| Build `ScenarioComparisonPanel` with side-by-side layout diagrams | Not Started |
| Implement `POST /api/v1/bed-allocation/scenarios` for what-if analysis | Not Started |
| Implement `GET /api/v1/bed-allocation/revenue-impact` for revenue projections | Not Started |
| Build department drill-down page `[departmentId]/page.tsx` with ward-level detail | Not Started |
| Add Neo4j integration for patient flow pathway analysis and transfer route optimization | Not Started |

### Phase 4: Polish & Testing
| Task | Status |
|---|---|
| Add loading skeletons and error boundary | Not Started |
| Implement responsive breakpoints for mobile and tablet | Not Started |
| Add WCAG 2.1 AA accessibility (aria labels, keyboard nav, screen reader alerts) | Not Started |
| Write unit tests for utility functions and hooks | Not Started |
| Write integration tests for page rendering and user interactions | Not Started |
| Write E2E tests for critical flows (forecast, approve reallocation, scenario builder) | Not Started |
| Performance audit: chart rendering, bundle size, API latency | Not Started |

## Dependencies

### Internal Dependencies
| Dependency | Purpose | Status |
|---|---|---|
| Shared UI component library (`@/components/ui`) | Buttons, cards, tables, badges, modals, skeleton | Assumed available |
| Authentication middleware (`@/middleware.ts`) | JWT validation, role extraction | Assumed available |
| Database connection module (`@/server/database`) | PostgreSQL connection pool | Assumed available |
| Redis connection module (`@/server/redis`) | Redis client for caching and BullMQ | Assumed available |
| Neo4j connection module (`@/server/neo4j`) | Graph DB client for patient flow analysis | Assumed available |
| Audit logging service (`@/server/audit`) | Immutable audit trail writes | Assumed available |
| Staff Allocation module (`@/server/staff-allocation`) | Cross-reference staffing impact of bed reallocations | Planned (Feature 01) |

### External Dependencies
| Package | Version | Purpose |
|---|---|---|
| `recharts` | `^2.12.x` | Area chart for occupancy trends and forecast visualization |
| `date-fns` | `^3.x` | Date manipulation and formatting |
| `@tanstack/react-query` | `^5.x` | Server state management, polling, cache invalidation |
| `bullmq` | `^5.x` | Background job queue for forecast computation |
| `@anthropic-ai/sdk` | `^0.30.x` | Claude API client for demand pattern analysis |
| `zod` | `^3.x` | Request/response validation on API endpoints |
| `csv-stringify` | `^6.x` | CSV generation for export feature |

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| ADT event stream latency or dropped events causing stale census | Medium | High | Implement periodic full-census reconciliation every 15 minutes; dead-letter queue for failed events; staleness indicator on UI |
| Forecast model accuracy degrades with limited historical data | Medium | High | Require 6-month minimum data; display confidence warnings; fall back to simple moving average when data sparse |
| Revenue calculations inconsistent with financial system | Medium | High | Reconciliation job compares calculated vs. reported revenue monthly; flag discrepancies; use financial system as source of truth |
| Large hospital (1000+ beds) causing slow occupancy queries | Low | Medium | Materialized views for department-level aggregations; Redis cache for frequently queried snapshots; query pagination |
| Concurrent scenario creation causing conflicting recommendations | Low | Medium | Optimistic locking on scenario records; warning when another user is editing same scenario |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Administrators hesitant to follow AI reallocation recommendations | High | High | Show detailed rationale and data support for each recommendation; allow simulation before commitment; start with low-impact suggestions |
| Revenue projections inaccurate, eroding trust in system | Medium | High | Conservative projection model with explicit confidence intervals; disclaimer labels; monthly accuracy reports |
| Bed reallocation recommendations conflict with clinical needs | Medium | Medium | Require clinical review approval workflow; show patient acuity considerations; never auto-implement recommendations |
| Seasonal patterns not captured with < 2 years of history | Medium | Medium | Supplement with regional/national hospital seasonal benchmarks; allow manual seasonal adjustment factors |

## Testing Strategy

### Unit Tests (Jest)
```
tests/unit/bed-allocation/
├── bed-allocation.utils.test.ts
│   ├── formatOccupancyRate: formats decimal to percentage correctly
│   ├── getOccupancyColor: returns correct color for threshold ranges
│   ├── getTrendIcon: returns correct icon for RISING/STABLE/DECLINING
│   ├── formatRevenue: formats currency with K/M abbreviations
│   ├── calculateRevenuePerBedDay: handles zero days, partial months
│   └── sortRecommendationsByImpact: sorts by priority then revenue then wait-time
├── bed-allocation.constants.test.ts
│   └── validates occupancy thresholds are non-overlapping and cover 0-100%
├── useBedFilters.test.ts
│   ├── initializes from URL search params
│   ├── cascading ward filter updates when department changes
│   └── resets all filters to defaults
└── useBedForecast.test.ts
    ├── triggers forecast job and transitions to polling state
    ├── polls at correct interval (2s) and stops on completion
    └── handles job failure with error state
```

### Integration Tests (React Testing Library)
```
tests/integration/bed-allocation/
├── BedAllocationPage.test.tsx
│   ├── renders loading skeleton on initial load
│   ├── displays occupancy data after fetch
│   ├── applies department filter and re-fetches
│   └── shows error boundary on API failure
├── OccupancyTrendChart.test.tsx
│   ├── renders area chart with correct data points
│   ├── overlays forecast when available
│   └── shows threshold lines at configured values
├── DepartmentOccupancyTable.test.tsx
│   ├── renders all department rows with correct data
│   ├── sorts by column on header click
│   ├── shows inline occupancy bars with correct widths
│   └── opens drill-down on row click
├── ReallocationRecommendationPanel.test.tsx
│   ├── renders recommendation cards sorted by priority
│   ├── approve action shows confirmation modal
│   ├── reject action requires reason
│   └── simulate opens scenario comparison panel
└── CapacityAlertPanel.test.tsx
    ├── renders alerts with correct severity badges
    ├── countdown timer updates in real-time
    └── acknowledge action updates alert status
```

### E2E Tests (Playwright)
```
tests/e2e/bed-allocation/
├── bed-allocation-forecast.spec.ts
│   ├── full forecast flow: set filters -> run forecast -> view results on chart
│   ├── forecast timeout shows fallback message with retry
│   └── forecast results persist on page refresh
├── bed-allocation-recommendations.spec.ts
│   ├── approve recommendation -> verify updated occupancy table
│   ├── reject recommendation -> verify reason modal and audit log
│   ├── simulate recommendation -> verify scenario comparison renders
│   └── multiple recommendations -> verify aggregate revenue impact
├── bed-allocation-alerts.spec.ts
│   ├── critical alert renders with correct countdown
│   ├── acknowledge alert -> verify status update
│   └── alert click scrolls to relevant department row
├── bed-allocation-drilldown.spec.ts
│   ├── click department row -> navigate to detail page with ward breakdown
│   └── back navigation preserves filters
└── bed-allocation-responsive.spec.ts
    ├── mobile: sidebar collapses, cards stack, table scrolls horizontal
    ├── tablet: drawer toggle, chart responsive
    └── desktop: full layout visible
```

## Performance Considerations
| Area | Target | Strategy |
|---|---|---|
| **Initial Page Load (LCP)** | < 1.5s | Server-side rendering via RSC; stream occupancy data; defer chart rendering with Suspense |
| **Occupancy Chart Render** | 60fps for 720 data points | Downsample hourly data for display; virtualize data points beyond viewport; memoize chart config |
| **Real-time Census Update** | < 30s latency | ADT event listener with Redis pub/sub; incremental state update (no full re-fetch) |
| **Forecast Response** | < 45s | BullMQ with dedicated worker pool; Redis-cached intermediate results; Claude API with streaming |
| **API Response (Occupancy)** | < 500ms | PostgreSQL materialized view for department aggregations; Redis cache with 2-minute TTL |
| **Department Drill-down** | < 800ms | Prefetch ward data on department row hover; RSC streaming for ward-level detail |
| **Bundle Size** | < 160KB (route) | Dynamic import for `OccupancyTrendChart` and `ScenarioComparisonPanel`; tree-shake Recharts |
| **Memory** | < 60MB client | Paginate occupancy table for > 20 departments; limit chart data retention to visible window |

## Deployment Plan
| Step | Action | Environment | Gate |
|---|---|---|---|
| 1 | Database migration: create bed allocation tables and materialized views | Staging -> Production | Migration scripts reviewed and approved |
| 2 | Deploy ADT event listener service | Staging | Event listener processes test ADT messages correctly |
| 3 | Deploy NestJS backend with feature flag `BED_ALLOCATION_ENABLED=false` | Staging | API integration tests pass |
| 4 | Deploy BullMQ forecast worker | Staging | Worker processes test forecast jobs successfully |
| 5 | Deploy frontend behind feature flag | Staging | E2E tests pass in staging |
| 6 | Internal QA with anonymized hospital data | Staging | QA sign-off checklist completed |
| 7 | Enable feature flag for pilot hospital | Production | Monitoring dashboards active; rollback plan documented |
| 8 | Monitor for 72 hours: error rates, forecast accuracy, census sync latency | Production | Error rate < 0.1%, P95 latency < 2s, census sync < 30s |
| 9 | General availability: enable for all tenants | Production | Pilot metrics meet thresholds |

## Monitoring & Analytics
| Metric | Tool | Alert Threshold |
|---|---|---|
| API error rate (`/bed-allocation/*`) | CloudWatch + DataDog | > 1% over 5-minute window |
| Forecast job duration | BullMQ metrics + CloudWatch | P95 > 60s |
| Forecast job failure rate | BullMQ dead-letter queue | Any job in DLQ |
| ADT event processing latency | Custom middleware logging | P95 > 10s |
| ADT event queue depth | Redis monitoring | > 100 unprocessed events |
| Census reconciliation drift | Custom health check | > 5% discrepancy from full census |
| Claude API latency | Custom middleware | P95 > 15s |
| Page load time (LCP) | Vercel Analytics / Web Vitals | > 2.5s |
| Recommendation approval rate | Custom analytics event | < 20% (indicates low trust) |
| Capacity alert lead time | PostgreSQL query | Average < 12 hours (target: 24h) |

## Documentation Requirements
| Document | Audience | Content |
|---|---|---|
| API Reference (OpenAPI spec) | Backend developers | All `/bed-allocation/*` endpoints with request/response schemas |
| Component Storybook Stories | Frontend developers | Interactive examples for all components with props documentation |
| Administrator User Guide | Hospital admins | How to interpret forecasts, approve/reject reallocations, use scenario builder |
| ADT Integration Guide | Implementation team | How to configure ADT feed from Epic/Cerner; HL7 FHIR mapping; troubleshooting |
| Runbook: Census Sync Issues | DevOps/SRE | Steps to diagnose ADT listener issues; manual reconciliation procedures |
| Runbook: Forecast Failures | DevOps/SRE | Steps to diagnose forecast job failures; fallback procedures |

## Post-Launch Review
| Review Item | Timeline | Owner |
|---|---|---|
| Forecast accuracy analysis (predicted vs. actual occupancy) | 2 weeks post-launch | Data Science |
| Census sync reliability (ADT event processing success rate) | 1 week post-launch | Engineering |
| User engagement metrics (daily active users, recommendation approval rate) | 2 weeks post-launch | Product |
| Revenue projection accuracy (projected vs. actual revenue impact) | 4 weeks post-launch | Finance + Data Science |
| Performance audit (chart rendering, API latency, census sync latency) | 1 week post-launch | Engineering |
| User feedback interviews with bed managers and administrators | 3 weeks post-launch | Product |
| Cost analysis: infrastructure spend vs. revenue improvements delivered | 4 weeks post-launch | Finance + Engineering |
| Retrospective: engineering velocity, bugs found in production | 2 weeks post-launch | Engineering |
| Decision: proceed to Phase 2 features (real-time bed board, patient flow visualization) | 4 weeks post-launch | Product + Engineering Lead |
