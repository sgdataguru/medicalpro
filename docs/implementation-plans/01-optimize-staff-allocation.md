# 01 Optimize Staff Allocation - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital administrator**, I want to **view predictive recommendations for optimal staff allocation across departments and shifts**, so that I can **ensure adequate staffing levels, minimize overtime costs, and maintain quality of patient care**.

## Pre-conditions
- Hospital department hierarchy is configured in the system (departments, wards, units)
- Staff roster data is imported or integrated from the hospital HR/scheduling system
- Historical shift data (minimum 12 months) is available in PostgreSQL for predictive modeling
- Role definitions and regulatory nurse-to-patient ratios are configured per department
- User has `ADMIN` or `STAFFING_MANAGER` role with appropriate RBAC permissions
- Claude API key is provisioned and rate limits are configured for predictive workloads
- Redis is operational for caching shift computation results
- BullMQ workers are deployed for background prediction job processing

## Business Requirements
- **BR-1**: Reduce overtime costs by at least 15% within 6 months of deployment
  - *Success Metric*: Track monthly overtime hours and costs pre/post deployment
- **BR-2**: Maintain nurse-to-patient ratios within regulatory compliance at all times
  - *Success Metric*: Zero compliance violations flagged in audit logs
- **BR-3**: Reduce manual scheduling effort by 40%
  - *Success Metric*: Measure time-to-publish schedule before and after feature launch
- **BR-4**: Provide 72-hour forward staffing predictions with 85%+ accuracy
  - *Success Metric*: Compare predicted vs. actual staffing needs over rolling 30-day windows
- **BR-5**: Surface coverage gap warnings at least 48 hours before shift start
  - *Success Metric*: Percentage of gaps identified with >= 48-hour lead time

## Technical Specifications

### Integration Points
| Integration | Protocol | Source | Purpose |
|---|---|---|---|
| Hospital HR System (Workday/Kronos) | REST API / SFTP | Staff roster, certifications, availability | Sync employee data, PTO, and shift preferences |
| EHR System (Epic/Cerner) | HL7 FHIR R4 | Patient census, ADT events | Real-time patient volume for staffing calculations |
| Scheduling System | REST API | Current shift schedules | Baseline for comparison with recommended allocations |
| Payroll System | REST API | Overtime rates, labor costs | Cost projection calculations |
| BullMQ Job Queue | Redis | Internal | Asynchronous prediction job processing |
| Claude API | REST | Anthropic | NLP-driven staffing insights and constraint analysis |

### Security Requirements
| Requirement | Implementation |
|---|---|
| HIPAA-Adjacent Compliance | All patient census data is aggregated (no PHI in staffing views); staff PII encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Role-Based Access Control | `STAFFING_MANAGER` can view/apply recommendations; `ADMIN` can configure constraints; `VIEWER` read-only access to dashboards |
| Audit Logging | Every recommendation viewed, accepted, or rejected is logged with user ID, timestamp, and action details to `audit_log` table |
| Data Retention | Staffing prediction logs retained for 7 years per healthcare records policy |
| Session Security | JWT tokens with 15-minute expiry, refresh token rotation, session invalidation on role change |
| API Rate Limiting | Claude API calls throttled to 60 RPM per tenant; Redis-backed rate limiter on all staffing endpoints |

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  [TopNav: MedicalPro Logo | Dashboard | Staff | Beds | ... ]     |
+------------------------------------------------------------------+
|  Sidebar  |  Main Content Area                                   |
|           |                                                       |
|  Filters  |  +--------------------------------------------------+|
|  --------+|  | StaffAllocationHeader                             ||
|  Dept [v] |  |  "Staff Allocation Optimizer"                     ||
|  Role [v] |  |  [Last updated: 5m ago]  [Refresh] [Export CSV]   ||
|  Shift[v] |  +--------------------------------------------------+|
|  Date [v] |                                                       |
|           |  +------------------------+  +-----------------------+|
|  Actions  |  | CurrentStaffingCard    |  | PredictedDemandCard   ||
|  --------+|  | Total On-Duty: 342     |  | Forecasted Need: 378 ||
|  [Run     |  | Departments: 12        |  | Gap: +36 staff       ||
|   Predict]|  | Coverage: 91.2%        |  | Confidence: 87%      ||
|           |  +------------------------+  +-----------------------+|
|  [Apply   |                                                       |
|   Recs]   |  +--------------------------------------------------+|
|           |  | StaffingHeatMap                                    ||
|  [Compare |  |  [Department x Shift matrix with color intensity]  ||
|   View]   |  |  Rows: Emergency, ICU, Surgery, Oncology, ...     ||
|           |  |  Cols: Day (7-15), Evening (15-23), Night (23-7)  ||
|           |  |  Color: Green(adequate) Yellow(tight) Red(gap)    ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | RecommendationPanel                                ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #1: Add 2 RNs to Emergency Night Shift   | ||
|           |  |  | Impact: -$2,400 overtime | Ratio: 1:4 -> 1:3 | ||
|           |  |  | [Accept] [Reject] [Modify]                   | ||
|           |  |  +----------------------------------------------+ ||
|           |  |  | Rec #2: Reassign 1 CNA from Oncology Day ... | ||
|           |  |  | ...                                          | ||
|           |  |  +----------------------------------------------+ ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +------------------------+  +-----------------------+|
|           |  | OvertimeCostProjection |  | CoverageGapTimeline   ||
|           |  | [Bar chart: Current    |  | [Timeline showing     ||
|           |  |  vs. Optimized costs   |  |  upcoming gaps with   ||
|           |  |  by department]        |  |  severity indicators] ||
|           |  +------------------------+  +-----------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
StaffAllocationPage (Server Component - layout + data fetching)
├── StaffAllocationHeader
│   ├── PageTitle
│   ├── LastUpdatedIndicator
│   └── ActionButtonGroup (Refresh, Export CSV)
├── StaffAllocationSidebar
│   ├── DepartmentFilter (multi-select dropdown)
│   ├── RoleFilter (multi-select: RN, CNA, MD, Tech, etc.)
│   ├── ShiftFilter (Day, Evening, Night, All)
│   ├── DateRangePicker
│   └── SidebarActions
│       ├── RunPredictionButton
│       ├── ApplyRecommendationsButton
│       └── CompareViewToggle
├── StaffingSummaryRow
│   ├── CurrentStaffingCard
│   └── PredictedDemandCard
├── StaffingHeatMap
│   ├── HeatMapGrid
│   ├── HeatMapLegend
│   └── HeatMapTooltip
├── RecommendationPanel
│   ├── RecommendationList
│   │   └── RecommendationCard (repeated)
│   │       ├── RecommendationSummary
│   │       ├── ImpactMetrics
│   │       └── RecommendationActions (Accept, Reject, Modify)
│   └── RecommendationSortControls
├── OvertimeCostProjection (Recharts BarChart)
│   ├── CostComparisonBars
│   └── SavingsAnnotation
└── CoverageGapTimeline
    ├── TimelineAxis
    ├── GapIndicator (repeated)
    └── GapDetailPopover
```

### Design System Compliance
| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#031926` | Page background, primary text, card borders |
| `--color-teal` | `#007B7A` | Primary buttons, active filters, adequate-staffing indicators |
| `--color-cerulean` | `#00B3C6` | Heatmap mid-range, links, secondary accents |
| `--color-gold` | `#C9A84A` | Warning badges, overtime cost highlights, attention indicators |
| `--color-danger` | `#DC2626` | Coverage gap alerts, critical understaffing, reject buttons |
| `--font-heading` | `Merriweather, serif` | Page title, card headers, recommendation titles |
| `--font-body` | `Inter, sans-serif` | Body text, metrics, labels, table content |
| `--spacing-card` | `p-6` (24px) | Internal card padding |
| `--spacing-gap` | `gap-6` (24px) | Grid gap between cards |
| `--radius-card` | `rounded-xl` (12px) | Card border radius |
| `--shadow-card` | `shadow-md` | Elevated card surfaces |

### Responsive Behavior
| Breakpoint | Layout | Behavior |
|---|---|---|
| `< 640px` (mobile) | Single column, sidebar collapses to bottom sheet | Heatmap scrolls horizontally; recommendation cards stack vertically; summary cards stack |
| `640px - 1024px` (tablet) | Two-column grid, sidebar as collapsible drawer | Heatmap fits 2 shifts visible; cost and timeline charts stack |
| `> 1024px` (desktop) | Full layout as shown in ASCII diagram | All panels visible; sidebar pinned left |

### Interaction Patterns
| Interaction | Behavior |
|---|---|
| **Run Prediction** | Button shows spinner + "Analyzing..." text; disabled during processing; toast notification on completion |
| **Filter Change** | Debounced 300ms; skeleton loaders replace data cards; URL search params updated for shareability |
| **Recommendation Accept** | Confirmation modal with impact summary; optimistic UI update; rollback on API failure |
| **Recommendation Reject** | Slide-out with required rejection reason (dropdown + optional text); logged to audit trail |
| **Heatmap Cell Hover** | Tooltip shows exact staffing count, required count, and gap delta |
| **Heatmap Cell Click** | Navigates to department-shift detail view with drill-down data |
| **Export CSV** | Background generation via BullMQ; download link delivered via toast notification |
| **Loading States** | Skeleton placeholders matching card dimensions; pulse animation using `animate-pulse` |
| **Error States** | Inline error banners with retry buttons; never show raw error messages to users |

## Technical Architecture

### Component Structure
```
src/
├── app/
│   └── staff-allocation/
│       ├── page.tsx                          # Server component: data fetching + layout
│       ├── layout.tsx                        # Staff allocation section layout
│       ├── loading.tsx                       # Streaming loading UI (skeleton)
│       ├── error.tsx                         # Error boundary
│       ├── _components/
│       │   ├── StaffAllocationHeader.tsx
│       │   ├── StaffAllocationSidebar.tsx
│       │   ├── CurrentStaffingCard.tsx
│       │   ├── PredictedDemandCard.tsx
│       │   ├── StaffingHeatMap.tsx
│       │   ├── HeatMapTooltip.tsx
│       │   ├── RecommendationPanel.tsx
│       │   ├── RecommendationCard.tsx
│       │   ├── RecommendationActions.tsx
│       │   ├── OvertimeCostProjection.tsx
│       │   ├── CoverageGapTimeline.tsx
│       │   ├── DepartmentFilter.tsx
│       │   ├── RoleFilter.tsx
│       │   ├── ShiftFilter.tsx
│       │   ├── DateRangePicker.tsx
│       │   ├── RunPredictionButton.tsx
│       │   └── CompareViewToggle.tsx
│       └── _hooks/
│           ├── useStaffAllocation.ts
│           ├── useStaffPrediction.ts
│           ├── useRecommendations.ts
│           └── useStaffFilters.ts
├── lib/
│   └── staff-allocation/
│       ├── staff-allocation.service.ts       # API client functions
│       ├── staff-allocation.types.ts         # TypeScript interfaces
│       ├── staff-allocation.utils.ts         # Formatting, calculation helpers
│       └── staff-allocation.constants.ts     # Shift definitions, role mappings
└── server/
    └── staff-allocation/
        ├── staff-allocation.controller.ts    # NestJS REST controller
        ├── staff-allocation.service.ts       # Business logic
        ├── staff-allocation.module.ts        # NestJS module
        ├── prediction.processor.ts           # BullMQ job processor
        ├── dto/
        │   ├── get-staffing.dto.ts
        │   ├── run-prediction.dto.ts
        │   └── apply-recommendation.dto.ts
        └── entities/
            ├── staff-member.entity.ts
            ├── shift-assignment.entity.ts
            ├── staffing-recommendation.entity.ts
            └── prediction-job.entity.ts
```

### State Management Architecture
```typescript
// --- Global State (React Context + useReducer) ---

interface StaffAllocationGlobalState {
  filters: StaffAllocationFilters;
  currentStaffing: DepartmentStaffingSummary[];
  predictions: StaffingPrediction | null;
  recommendations: StaffingRecommendation[];
  predictionJobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  compareMode: boolean;
}

interface StaffAllocationFilters {
  departmentIds: string[];
  roles: StaffRole[];
  shifts: ShiftType[];
  dateRange: { start: Date; end: Date };
}

type StaffRole = 'RN' | 'CNA' | 'MD' | 'PA' | 'NP' | 'TECH' | 'ADMIN';
type ShiftType = 'DAY' | 'EVENING' | 'NIGHT';

// --- Domain Types ---

interface DepartmentStaffingSummary {
  departmentId: string;
  departmentName: string;
  shifts: ShiftStaffing[];
  totalOnDuty: number;
  totalRequired: number;
  coveragePercentage: number;
}

interface ShiftStaffing {
  shiftType: ShiftType;
  shiftStart: string;        // ISO time "07:00"
  shiftEnd: string;          // ISO time "15:00"
  staffByRole: RoleStaffing[];
  totalAssigned: number;
  totalRequired: number;
  patientCount: number;
  nurseToPatientRatio: number;
  regulatoryRatioLimit: number;
  isCompliant: boolean;
}

interface RoleStaffing {
  role: StaffRole;
  assigned: number;
  required: number;
  available: number;         // Includes on-call, float pool
  overtimeHours: number;
  costPerHour: number;
}

interface StaffingPrediction {
  predictionId: string;
  generatedAt: string;       // ISO datetime
  horizonHours: number;      // e.g., 72
  confidence: number;        // 0.0 - 1.0
  modelVersion: string;
  departmentPredictions: DepartmentPrediction[];
}

interface DepartmentPrediction {
  departmentId: string;
  departmentName: string;
  predictedPatientVolume: number;
  shifts: ShiftPrediction[];
}

interface ShiftPrediction {
  shiftType: ShiftType;
  predictedDemand: number;
  currentAssigned: number;
  gap: number;               // positive = understaffed, negative = overstaffed
  confidence: number;
}

interface StaffingRecommendation {
  recommendationId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'ADD_STAFF' | 'REASSIGN' | 'REDUCE' | 'SHIFT_SWAP';
  departmentId: string;
  departmentName: string;
  shiftType: ShiftType;
  role: StaffRole;
  description: string;
  currentValue: number;
  recommendedValue: number;
  delta: number;
  projectedOvertimeSavings: number;
  projectedCoverageImprovement: number;
  ratioImpact: { before: number; after: number };
  constraints: string[];      // Human-readable constraint explanations
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'APPLIED';
  rejectionReason?: string;
}

interface OvertimeCostProjection {
  departmentId: string;
  departmentName: string;
  currentOvertimeCost: number;
  projectedOvertimeCost: number;
  savings: number;
  savingsPercentage: number;
  period: string;            // e.g., "2026-03 Week 12"
}

interface CoverageGap {
  gapId: string;
  departmentId: string;
  departmentName: string;
  shiftType: ShiftType;
  date: string;              // ISO date
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  staffShortfall: number;
  role: StaffRole;
  hoursUntilShift: number;
}
```

### API Integration Schema
```typescript
// ============================================================
// GET /api/v1/staff-allocation/current
// Fetch current staffing levels with optional filters
// ============================================================
interface GetCurrentStaffingRequest {
  params: {
    departmentIds?: string[];   // comma-separated in query string
    roles?: StaffRole[];
    shifts?: ShiftType[];
    date?: string;              // ISO date, defaults to today
  };
}

interface GetCurrentStaffingResponse {
  data: {
    departments: DepartmentStaffingSummary[];
    totals: {
      totalOnDuty: number;
      totalRequired: number;
      overallCoverage: number;
      departmentCount: number;
    };
    asOf: string;               // ISO datetime
  };
  meta: {
    cached: boolean;
    cacheExpiry: string;
  };
}

// ============================================================
// POST /api/v1/staff-allocation/predict
// Trigger a staffing prediction job (async via BullMQ)
// ============================================================
interface RunPredictionRequest {
  body: {
    departmentIds: string[];
    horizonHours: 24 | 48 | 72;
    includeConstraints: boolean;
    modelPreference?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  };
}

interface RunPredictionResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/staff-allocation/predict/:jobId
// Poll prediction job status and results
// ============================================================
interface GetPredictionResultRequest {
  params: {
    jobId: string;
  };
}

interface GetPredictionResultResponse {
  data: {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    prediction?: StaffingPrediction;
    error?: string;
  };
}

// ============================================================
// GET /api/v1/staff-allocation/recommendations
// Fetch generated recommendations for current prediction
// ============================================================
interface GetRecommendationsRequest {
  params: {
    predictionId: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  };
}

interface GetRecommendationsResponse {
  data: {
    recommendations: StaffingRecommendation[];
    summary: {
      totalRecommendations: number;
      criticalCount: number;
      projectedTotalSavings: number;
      projectedCoverageImprovement: number;
    };
  };
}

// ============================================================
// PATCH /api/v1/staff-allocation/recommendations/:id
// Accept or reject a recommendation
// ============================================================
interface UpdateRecommendationRequest {
  params: { id: string };
  body: {
    status: 'ACCEPTED' | 'REJECTED';
    rejectionReason?: string;
    modifiedValue?: number;
  };
}

interface UpdateRecommendationResponse {
  data: {
    recommendation: StaffingRecommendation;
    auditLogId: string;
  };
}

// ============================================================
// GET /api/v1/staff-allocation/overtime-projection
// Cost projection data for charts
// ============================================================
interface GetOvertimeProjectionRequest {
  params: {
    predictionId: string;
    departmentIds?: string[];
  };
}

interface GetOvertimeProjectionResponse {
  data: {
    projections: OvertimeCostProjection[];
    totalCurrentCost: number;
    totalProjectedCost: number;
    totalSavings: number;
  };
}

// ============================================================
// GET /api/v1/staff-allocation/coverage-gaps
// Upcoming coverage gap warnings
// ============================================================
interface GetCoverageGapsRequest {
  params: {
    horizonHours?: number;
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    departmentIds?: string[];
  };
}

interface GetCoverageGapsResponse {
  data: {
    gaps: CoverageGap[];
    summary: {
      criticalGaps: number;
      warningGaps: number;
      earliestGap: string;
    };
  };
}

// ============================================================
// POST /api/v1/staff-allocation/export
// Trigger CSV export job
// ============================================================
interface ExportStaffingRequest {
  body: {
    type: 'CURRENT' | 'RECOMMENDATIONS' | 'PROJECTIONS';
    departmentIds?: string[];
    dateRange: { start: string; end: string };
  };
}

interface ExportStaffingResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
  };
}
```

## Implementation Requirements

### Core Components
| Component | File | Purpose |
|---|---|---|
| `StaffAllocationPage` | `src/app/staff-allocation/page.tsx` | Server component; fetches initial staffing data via RSC; renders layout shell |
| `StaffAllocationHeader` | `src/app/staff-allocation/_components/StaffAllocationHeader.tsx` | Page title, last-updated timestamp, refresh and export action buttons |
| `StaffAllocationSidebar` | `src/app/staff-allocation/_components/StaffAllocationSidebar.tsx` | Filter panel with department, role, shift, and date-range selectors; action buttons |
| `CurrentStaffingCard` | `src/app/staff-allocation/_components/CurrentStaffingCard.tsx` | Summary card showing total on-duty count, department count, coverage percentage |
| `PredictedDemandCard` | `src/app/staff-allocation/_components/PredictedDemandCard.tsx` | Summary card showing forecasted staffing need, gap delta, confidence score |
| `StaffingHeatMap` | `src/app/staff-allocation/_components/StaffingHeatMap.tsx` | Interactive department-by-shift grid with color-coded staffing adequacy |
| `HeatMapTooltip` | `src/app/staff-allocation/_components/HeatMapTooltip.tsx` | Hover tooltip showing detailed staffing counts per cell |
| `RecommendationPanel` | `src/app/staff-allocation/_components/RecommendationPanel.tsx` | Scrollable list of staffing recommendations with sort/filter controls |
| `RecommendationCard` | `src/app/staff-allocation/_components/RecommendationCard.tsx` | Individual recommendation with impact metrics and accept/reject/modify actions |
| `OvertimeCostProjection` | `src/app/staff-allocation/_components/OvertimeCostProjection.tsx` | Recharts-based grouped bar chart comparing current vs. optimized overtime costs |
| `CoverageGapTimeline` | `src/app/staff-allocation/_components/CoverageGapTimeline.tsx` | Horizontal timeline showing upcoming coverage gaps with severity-coded markers |

### Custom Hooks
| Hook | File | Description |
|---|---|---|
| `useStaffAllocation` | `src/app/staff-allocation/_hooks/useStaffAllocation.ts` | Manages global staff allocation state; provides actions for filter updates, data refresh |
| `useStaffPrediction` | `src/app/staff-allocation/_hooks/useStaffPrediction.ts` | Handles prediction job lifecycle: trigger, poll status, receive results; manages polling interval |
| `useRecommendations` | `src/app/staff-allocation/_hooks/useRecommendations.ts` | Fetches, sorts, and manages recommendation state; handles accept/reject mutations |
| `useStaffFilters` | `src/app/staff-allocation/_hooks/useStaffFilters.ts` | Syncs filter state with URL search params; debounces filter changes; provides filter reset |

### Utility Functions
| Utility | File | Description |
|---|---|---|
| `formatStaffingRatio` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Formats nurse-to-patient ratio as "1:N" string |
| `calculateCoveragePercentage` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Computes coverage % from assigned/required counts |
| `getHeatMapColor` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Returns Tailwind color class based on staffing adequacy threshold |
| `formatOvertimeCost` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Currency formatting with K/M abbreviations |
| `sortRecommendations` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Multi-criteria sort: priority desc, savings desc, department asc |
| `buildStaffingQueryParams` | `src/lib/staff-allocation/staff-allocation.utils.ts` | Serializes filter state to URL search params |
| `SHIFT_DEFINITIONS` | `src/lib/staff-allocation/staff-allocation.constants.ts` | Shift time ranges, labels, and display order |
| `ROLE_DISPLAY_MAP` | `src/lib/staff-allocation/staff-allocation.constants.ts` | Role enum to human-readable label mapping |
| `REGULATORY_RATIOS` | `src/lib/staff-allocation/staff-allocation.constants.ts` | Default nurse-to-patient ratio limits by department type |

## Acceptance Criteria

### Functional Requirements
1. The dashboard displays current staffing levels grouped by department, with breakdowns by role and shift period
2. Users can filter the view by one or more departments, roles, shifts, and a date range
3. Clicking "Run Prediction" triggers a background prediction job and displays a progress indicator until results are ready
4. Prediction results show forecasted staffing demand per department and shift with a confidence percentage
5. The heatmap visually distinguishes adequately-staffed cells (green), tight-staffed cells (yellow), and understaffed cells (red)
6. Hovering over a heatmap cell reveals a tooltip with exact staffing numbers and gap delta
7. The recommendation panel lists actionable staffing adjustments ranked by priority/impact
8. Each recommendation card shows the type of action, affected department/shift/role, projected overtime savings, and ratio impact
9. Users can accept, reject (with required reason), or modify each recommendation
10. The overtime cost projection chart compares current vs. optimized costs per department
11. The coverage gap timeline surfaces upcoming shift gaps with severity indicators and hours until shift start
12. Accepted recommendations update the comparison view to show pre/post staffing state
13. CSV export generates a downloadable report of current staffing data, recommendations, or projections
14. All filter selections persist in URL search parameters for shareability and browser back-button support

### Non-Functional Requirements
| Category | Requirement |
|---|---|
| **Performance** | Initial page load (server-rendered) completes within 1.5 seconds on 3G; client hydration within 500ms |
| **Performance** | Heatmap renders up to 20 departments x 3 shifts (60 cells) without frame drops |
| **Performance** | Prediction job completes within 30 seconds for a 500-bed hospital |
| **Accessibility** | WCAG 2.1 AA compliant; heatmap colors supplemented with text labels; keyboard navigation for all interactive elements |
| **Accessibility** | Screen reader announces recommendation priority and status changes via aria-live regions |
| **Security** | All API requests authenticated via JWT; staffing data never cached in browser localStorage |
| **Security** | Recommendation accept/reject actions logged to immutable audit trail |
| **Reliability** | Graceful degradation if prediction service is unavailable; displays cached last-known-good data |
| **Scalability** | Supports up to 50 concurrent users viewing staffing dashboards without performance degradation |

## Modified Files
```
src/
├── app/
│   └── staff-allocation/
│       ├── page.tsx                                [NEW]
│       ├── layout.tsx                              [NEW]
│       ├── loading.tsx                             [NEW]
│       ├── error.tsx                               [NEW]
│       ├── _components/
│       │   ├── StaffAllocationHeader.tsx           [NEW]
│       │   ├── StaffAllocationSidebar.tsx          [NEW]
│       │   ├── CurrentStaffingCard.tsx             [NEW]
│       │   ├── PredictedDemandCard.tsx             [NEW]
│       │   ├── StaffingHeatMap.tsx                 [NEW]
│       │   ├── HeatMapTooltip.tsx                  [NEW]
│       │   ├── RecommendationPanel.tsx             [NEW]
│       │   ├── RecommendationCard.tsx              [NEW]
│       │   ├── RecommendationActions.tsx           [NEW]
│       │   ├── OvertimeCostProjection.tsx          [NEW]
│       │   ├── CoverageGapTimeline.tsx             [NEW]
│       │   ├── DepartmentFilter.tsx                [NEW]
│       │   ├── RoleFilter.tsx                      [NEW]
│       │   ├── ShiftFilter.tsx                     [NEW]
│       │   ├── DateRangePicker.tsx                 [NEW]
│       │   ├── RunPredictionButton.tsx             [NEW]
│       │   └── CompareViewToggle.tsx               [NEW]
│       └── _hooks/
│           ├── useStaffAllocation.ts               [NEW]
│           ├── useStaffPrediction.ts               [NEW]
│           ├── useRecommendations.ts               [NEW]
│           └── useStaffFilters.ts                  [NEW]
├── lib/
│   └── staff-allocation/
│       ├── staff-allocation.service.ts             [NEW]
│       ├── staff-allocation.types.ts               [NEW]
│       ├── staff-allocation.utils.ts               [NEW]
│       └── staff-allocation.constants.ts           [NEW]
├── server/
│   └── staff-allocation/
│       ├── staff-allocation.controller.ts          [NEW]
│       ├── staff-allocation.service.ts             [NEW]
│       ├── staff-allocation.module.ts              [NEW]
│       ├── prediction.processor.ts                 [NEW]
│       ├── dto/
│       │   ├── get-staffing.dto.ts                 [NEW]
│       │   ├── run-prediction.dto.ts               [NEW]
│       │   └── apply-recommendation.dto.ts         [NEW]
│       └── entities/
│           ├── staff-member.entity.ts              [NEW]
│           ├── shift-assignment.entity.ts          [NEW]
│           ├── staffing-recommendation.entity.ts   [NEW]
│           └── prediction-job.entity.ts            [NEW]
├── components/ui/
│   ├── Skeleton.tsx                                [MODIFIED] - Add heatmap skeleton variant
│   └── Toast.tsx                                   [MODIFIED] - Add prediction-complete toast type
└── middleware.ts                                    [MODIFIED] - Add /staff-allocation route auth guard
```

## Implementation Status
OVERALL STATUS: NOT STARTED

### Phase 1: Foundation & Setup
| Task | Status |
|---|---|
| Create `src/app/staff-allocation/` route directory and layout | Not Started |
| Define TypeScript interfaces in `staff-allocation.types.ts` | Not Started |
| Define constants (shifts, roles, ratios) in `staff-allocation.constants.ts` | Not Started |
| Set up NestJS module, controller, and service stubs | Not Started |
| Create PostgreSQL migration for `staff_members`, `shift_assignments`, `staffing_recommendations`, `prediction_jobs` tables | Not Started |
| Configure BullMQ queue `staff-prediction` and processor stub | Not Started |
| Add route auth guard in middleware | Not Started |

### Phase 2: Core Implementation
| Task | Status |
|---|---|
| Implement `StaffAllocationPage` server component with RSC data fetching | Not Started |
| Build `CurrentStaffingCard` and `PredictedDemandCard` summary components | Not Started |
| Build `StaffingHeatMap` with color-coded cells and `HeatMapTooltip` | Not Started |
| Implement `StaffAllocationSidebar` with all filter components | Not Started |
| Build `useStaffFilters` hook with URL param sync and debounce | Not Started |
| Implement `GET /api/v1/staff-allocation/current` endpoint with PostgreSQL queries | Not Started |
| Implement `POST /api/v1/staff-allocation/predict` endpoint and BullMQ job dispatch | Not Started |
| Build `useStaffPrediction` hook with polling logic | Not Started |
| Implement prediction processor with Claude API integration for constraint analysis | Not Started |

### Phase 3: Enhanced Features
| Task | Status |
|---|---|
| Build `RecommendationPanel` and `RecommendationCard` components | Not Started |
| Implement `PATCH /api/v1/staff-allocation/recommendations/:id` with audit logging | Not Started |
| Build `OvertimeCostProjection` chart component with Recharts | Not Started |
| Build `CoverageGapTimeline` component | Not Started |
| Implement `CompareViewToggle` for before/after comparison | Not Started |
| Implement CSV export via BullMQ background job | Not Started |
| Add Neo4j integration for staff relationship queries (cross-department float eligibility) | Not Started |

### Phase 4: Polish & Testing
| Task | Status |
|---|---|
| Add loading skeletons (`loading.tsx`) and error boundary (`error.tsx`) | Not Started |
| Implement responsive breakpoints for mobile and tablet | Not Started |
| Add WCAG 2.1 AA accessibility (aria labels, keyboard nav, screen reader support) | Not Started |
| Write unit tests for utility functions and hooks | Not Started |
| Write integration tests for page rendering and user interactions | Not Started |
| Write E2E tests for critical flows (predict, accept recommendation, export) | Not Started |
| Performance audit: Lighthouse, bundle size analysis | Not Started |

## Dependencies

### Internal Dependencies
| Dependency | Purpose | Status |
|---|---|---|
| Shared UI component library (`@/components/ui`) | Buttons, cards, dropdowns, modals, skeleton, toast | Assumed available |
| Authentication middleware (`@/middleware.ts`) | JWT validation, role extraction | Assumed available |
| Database connection module (`@/server/database`) | PostgreSQL connection pool, TypeORM/Prisma config | Assumed available |
| Redis connection module (`@/server/redis`) | Redis client for caching and BullMQ | Assumed available |
| Neo4j connection module (`@/server/neo4j`) | Graph DB client for relationship queries | Assumed available |
| Audit logging service (`@/server/audit`) | Immutable audit trail writes | Assumed available |

### External Dependencies
| Package | Version | Purpose |
|---|---|---|
| `recharts` | `^2.12.x` | Bar chart for overtime cost projection |
| `date-fns` | `^3.x` | Date manipulation and formatting |
| `@tanstack/react-query` | `^5.x` | Server state management, polling, cache invalidation |
| `bullmq` | `^5.x` | Background job queue for predictions and exports |
| `@anthropic-ai/sdk` | `^0.30.x` | Claude API client for prediction constraint analysis |
| `zod` | `^3.x` | Request/response validation on API endpoints |
| `csv-stringify` | `^6.x` | CSV generation for export feature |

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Claude API latency exceeds 30s for complex predictions | Medium | High | Implement timeout with fallback to rule-based predictions; cache model responses in Redis with 1-hour TTL |
| Historical data insufficient for accurate predictions | Medium | High | Require minimum 6-month data threshold; display confidence warnings when data is sparse; allow manual override |
| BullMQ job failures during prediction processing | Low | Medium | Implement retry with exponential backoff (3 retries); dead-letter queue for failed jobs; admin alert via webhook |
| Heatmap rendering performance with large hospital (30+ departments) | Low | Medium | Virtualize heatmap rows; lazy-render off-screen cells; memoize color calculations |
| Concurrent recommendation acceptance causing stale state | Medium | Medium | Optimistic locking on recommendation records; real-time updates via Server-Sent Events or polling |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Users distrust AI recommendations without understanding methodology | High | High | Display confidence scores, constraint explanations, and "why this recommendation" tooltips; provide manual override for every suggestion |
| Regulatory ratio changes invalidate prediction model | Low | High | Externalize ratio configuration; admin UI for updating ratios; model retraining trigger on config change |
| Staff scheduling union constraints not captured in model | Medium | Medium | Allow custom constraint rules per department; surface "unmodeled constraint" warnings; integrate with union contract database |

## Testing Strategy

### Unit Tests (Jest)
```
tests/unit/staff-allocation/
├── staff-allocation.utils.test.ts
│   ├── formatStaffingRatio: formats various ratios correctly
│   ├── calculateCoveragePercentage: handles zero required, partial, full coverage
│   ├── getHeatMapColor: returns correct color classes for thresholds
│   ├── formatOvertimeCost: formats currency with K/M abbreviations
│   └── sortRecommendations: sorts by priority then savings then department
├── staff-allocation.constants.test.ts
│   └── validates shift definitions cover full 24-hour cycle
├── useStaffFilters.test.ts
│   ├── initializes from URL search params
│   ├── debounces filter changes by 300ms
│   └── resets all filters to defaults
└── useStaffPrediction.test.ts
    ├── triggers prediction and transitions to polling state
    ├── polls at correct interval and stops on completion
    └── handles job failure gracefully
```

### Integration Tests (React Testing Library)
```
tests/integration/staff-allocation/
├── StaffAllocationPage.test.tsx
│   ├── renders loading skeleton on initial load
│   ├── displays current staffing data after fetch
│   ├── applies department filter and re-fetches data
│   └── shows error boundary on API failure
├── StaffingHeatMap.test.tsx
│   ├── renders correct number of cells for departments x shifts
│   ├── applies correct color classes based on staffing levels
│   └── displays tooltip on cell hover with staffing details
├── RecommendationPanel.test.tsx
│   ├── renders recommendation cards sorted by priority
│   ├── accept action triggers PATCH and updates card status
│   ├── reject action requires reason before submission
│   └── shows empty state when no recommendations exist
└── OvertimeCostProjection.test.tsx
    ├── renders bar chart with current and projected costs
    └── displays total savings annotation
```

### E2E Tests (Playwright)
```
tests/e2e/staff-allocation/
├── staff-allocation-predict.spec.ts
│   ├── full prediction flow: set filters → run prediction → view results
│   ├── prediction timeout shows fallback message with retry option
│   └── multiple concurrent predictions are queued correctly
├── staff-allocation-recommendations.spec.ts
│   ├── accept recommendation → verify updated heatmap and cost chart
│   ├── reject recommendation → verify reason modal and audit log entry
│   └── modify recommendation → verify custom value applied
├── staff-allocation-export.spec.ts
│   ├── export CSV → verify file download and content headers
│   └── export with filters → verify filtered data in CSV
└── staff-allocation-responsive.spec.ts
    ├── mobile viewport: sidebar collapses, cards stack
    ├── tablet viewport: drawer toggle works, heatmap scrolls
    └── desktop viewport: full layout renders correctly
```

## Performance Considerations
| Area | Target | Strategy |
|---|---|---|
| **Initial Page Load (LCP)** | < 1.5s | Server-side rendering via RSC; stream staffing data; defer heatmap rendering with Suspense boundary |
| **Time to Interactive (TTI)** | < 2.5s | Code-split `OvertimeCostProjection` and `CoverageGapTimeline` (dynamic imports); defer Recharts bundle |
| **Prediction Response** | < 30s | BullMQ with dedicated worker pool; Redis-cached intermediate results; Claude API with streaming response |
| **API Response (Current Staffing)** | < 500ms | PostgreSQL indexed queries on `department_id`, `shift_date`; Redis cache with 5-minute TTL |
| **Heatmap Rendering** | 60fps | Memoize color computations with `useMemo`; CSS transitions instead of JS animations; limit re-renders via `React.memo` |
| **Bundle Size** | < 150KB (route) | Tree-shake Recharts (import only `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`); dynamic import for CSV export |
| **Memory** | < 50MB client | Paginate recommendations (20 per page); virtualize heatmap for > 15 departments; clean up polling intervals on unmount |

## Deployment Plan
| Step | Action | Environment | Gate |
|---|---|---|---|
| 1 | Database migration: create staffing tables | Staging → Production | Migration scripts reviewed and approved |
| 2 | Deploy NestJS backend with feature flag `STAFF_ALLOCATION_ENABLED=false` | Staging | API integration tests pass |
| 3 | Deploy BullMQ prediction worker | Staging | Worker processes test jobs successfully |
| 4 | Deploy frontend behind feature flag | Staging | E2E tests pass in staging environment |
| 5 | Internal QA: Hospital admin users test with anonymized data | Staging | QA sign-off checklist completed |
| 6 | Enable feature flag for pilot hospital (single tenant) | Production | Monitoring dashboards active; rollback plan documented |
| 7 | Monitor for 72 hours: error rates, latency, prediction accuracy | Production | Error rate < 0.1%, P95 latency < 2s, prediction accuracy > 80% |
| 8 | General availability: enable for all tenants | Production | Pilot metrics meet thresholds |

## Monitoring & Analytics
| Metric | Tool | Alert Threshold |
|---|---|---|
| API error rate (`/staff-allocation/*`) | CloudWatch + DataDog | > 1% over 5-minute window |
| Prediction job duration | BullMQ metrics + CloudWatch | P95 > 45s |
| Prediction job failure rate | BullMQ dead-letter queue | Any job in DLQ |
| Claude API latency | Custom middleware logging | P95 > 15s |
| Claude API token usage | Anthropic dashboard + CloudWatch | > 80% of monthly budget |
| Page load time (LCP) | Vercel Analytics / Web Vitals | > 2.5s |
| Recommendation acceptance rate | Custom analytics event | < 30% (indicates low trust) |
| Coverage gap detection lead time | PostgreSQL query | Average < 24 hours (target: 48) |
| Concurrent dashboard users | Redis session counter | > 45 (of 50 max) |

## Documentation Requirements
| Document | Audience | Content |
|---|---|---|
| API Reference (OpenAPI spec) | Backend developers | All `/staff-allocation/*` endpoints with request/response schemas |
| Component Storybook Stories | Frontend developers | Interactive examples for all components with props documentation |
| Administrator User Guide | Hospital admins | How to interpret predictions, accept/reject recommendations, configure constraints |
| Data Integration Guide | Implementation team | How to connect hospital HR, EHR, and scheduling systems |
| Runbook: Prediction Failures | DevOps/SRE | Steps to diagnose and resolve prediction job failures; fallback procedures |

## Post-Launch Review
| Review Item | Timeline | Owner |
|---|---|---|
| Prediction accuracy analysis (predicted vs. actual staffing needs) | 2 weeks post-launch | Data Science |
| User engagement metrics (daily active users, recommendation acceptance rate) | 2 weeks post-launch | Product |
| Performance audit (Lighthouse scores, API latency percentiles) | 1 week post-launch | Engineering |
| User feedback interviews with hospital administrators | 3 weeks post-launch | Product |
| Cost analysis: Claude API spend vs. projected overtime savings delivered | 4 weeks post-launch | Finance + Engineering |
| Retrospective: engineering velocity, bugs found in production | 2 weeks post-launch | Engineering |
| Decision: proceed to Phase 2 features (auto-scheduling, shift swap marketplace) | 4 weeks post-launch | Product + Engineering Lead |
