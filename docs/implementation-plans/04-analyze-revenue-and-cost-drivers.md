# 04 Analyze Revenue and Cost Drivers - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital director**, I want to **understand why revenue has changed year-over-year and identify where money is being burned**, so that I can **make informed financial decisions and improve the hospital's financial health**.

## Pre-conditions
- Hospital financial system is integrated with at least 24 months of historical revenue and cost data in PostgreSQL
- Department chart of accounts is configured mapping cost centers to departments
- Cost categories are defined and standardized (staffing, supplies, equipment, overhead, facilities, etc.)
- Revenue sources are categorized (inpatient, outpatient, surgical, emergency, pharmacy, imaging, etc.)
- Budget/forecast data is available for variance analysis (planned vs. actual)
- User has `DIRECTOR`, `CFO`, or `FINANCE_ANALYST` role with appropriate RBAC permissions
- Redis is operational for caching aggregated financial computations
- BullMQ workers are deployed for background analysis and report generation jobs
- Claude API key is provisioned for financial narrative generation and factor attribution analysis

## Business Requirements
- **BR-1**: Provide executive-level financial visibility with < 5 minute time investment per review
  - *Success Metric*: Average time-on-page for director-level users; target: 3-5 minutes for complete understanding
- **BR-2**: Identify top 5 revenue drivers and top 5 cost drivers with quantified impact
  - *Success Metric*: System surfaces ranked factors with confidence scores >= 0.8
- **BR-3**: Enable drill-down from aggregate revenue to department-level to line-item detail
  - *Success Metric*: Users can navigate from top-line to root cause in <= 3 clicks
- **BR-4**: Surface significant financial variances (> 5% deviation from budget or prior year) automatically
  - *Success Metric*: All material variances flagged; false positive rate < 10%
- **BR-5**: Generate AI-powered financial narratives explaining revenue changes
  - *Success Metric*: Hospital finance team rates narrative accuracy >= 4/5 in user survey
- **BR-6**: Support configurable time period analysis (monthly, quarterly, yearly, custom)
  - *Success Metric*: All time periods render within 2 seconds

## Technical Specifications

### Integration Points
| Integration | Protocol | Source | Purpose |
|---|---|---|---|
| General Ledger System | REST API / SFTP | Revenue and expense transactions | Actual financial data by account, department, period |
| Budgeting System | REST API / SFTP | Annual/quarterly budget figures | Planned figures for variance analysis |
| Billing/Revenue Cycle System | REST API / HL7 835/837 | Claims, payments, denials, adjustments | Revenue source detail and realization rates |
| Payroll System (Workday/Kronos) | REST API / SFTP | Labor cost data by department | Staffing cost breakdowns and trends |
| Supply Chain Module | Internal API | Procurement spend data | Supply cost detail (cross-reference with Feature 03) |
| EHR System (Epic/Cerner) | HL7 FHIR R4 | Patient volume, case mix, procedures | Volume drivers for revenue attribution |
| BullMQ Job Queue | Redis | Internal | Background financial analysis and report generation |
| Claude API | REST | Anthropic | Financial narrative generation, factor attribution, anomaly explanation |
| Neo4j Graph DB | Bolt Protocol | Internal | Cost dependency graphs, revenue flow mapping, department relationship analysis |

### Security Requirements
| Requirement | Implementation |
|---|---|
| Financial Data Classification | All revenue and cost data classified as CONFIDENTIAL; no PHI involved but financial data requires restricted access |
| Data Encryption | Financial data encrypted at rest (AES-256) and in transit (TLS 1.3); database column-level encryption for sensitive cost figures |
| Role-Based Access Control | `DIRECTOR` and `CFO` have full access to all financial data; `FINANCE_ANALYST` can view department-level data they are assigned to; `DEPARTMENT_HEAD` can view only their department; `VIEWER` no financial access |
| Audit Logging | Every financial report viewed, drill-down path, and export action logged to `audit_log` with user ID, timestamp, data scope accessed |
| Data Retention | Financial data retained per regulatory requirements (7+ years); analysis results retained for 3 years |
| Export Controls | Financial exports (CSV, PDF) watermarked with user name and timestamp; download logged |
| Session Security | Financial pages require active session; auto-logout after 15 minutes of inactivity; no caching of financial data in browser |

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  [TopNav: MedicalPro Logo | Dashboard | Staff | ... | Finance ]  |
+------------------------------------------------------------------+
|  Sidebar  |  Main Content Area                                   |
|           |                                                       |
|  Controls |  +--------------------------------------------------+|
|  --------+|  | RevenueCostHeader                                 ||
|  Period   |  |  "Revenue & Cost Analysis"                        ||
|  [Monthly]|  |  [FY 2025-2026]  [Refresh] [Export PDF] [Share]   ||
|  [Quarter]|  +--------------------------------------------------+|
|  [Yearly] |                                                       |
|  [Custom] |  +--------------------------------------------------+|
|           |  | AIFinancialNarrative                               ||
|  Date     |  |  "Revenue increased 6.2% YoY to $142M, driven    ||
|  Range    |  |   primarily by surgical volume (+$4.8M) and       ||
|  [picker] |  |   outpatient imaging (+$2.1M). However, staffing  ||
|           |  |   costs rose 9.1%, exceeding budget by $3.2M,     ||
|           |  |   largely due to overtime in Emergency (+$1.4M)   ||
|  Compare  |  |   and agency nursing in ICU (+$980K)."            ||
|  Against  |  |  [Expand Details] [Copy] [Regenerate]             ||
|  [Prior Yr|  +--------------------------------------------------+|
|  [Budget] |                                                       |
|  [Custom] |  +------------+  +------------+  +------------------+|
|           |  | Total Rev  |  | Total Cost |  | Net Margin Card  ||
|  Dept [v] |  | Card       |  | Card       |  | Margin: 8.4%     ||
|  Cat  [v] |  | $142.3M    |  | $130.4M    |  | vs Prior: +1.2pp ||
|           |  | YoY: +6.2% |  | YoY: +9.1% |  | vs Budget: -0.4pp|
|  [Run     |  | vs Budget: |  | vs Budget: |  | Trend: [sparkline||
|  Analysis]|  | +2.1%      |  | +4.8%      |  |  showing 12mo]   ||
|           |  +------------+  +------------+  +------------------+|
|  [Export  |                                                       |
|  Report]  |  +--------------------------------------------------+|
|           |  | RevenueWaterfallChart                              ||
|           |  |  [Waterfall: Prior Year Rev -> +Surgical ->       ||
|           |  |   +Outpatient -> +ER -> -Pharmacy -> -Denials -> ||
|           |  |   Current Year Revenue]                           ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | CostBreakdownTreemap                               ||
|           |  |  [Treemap: sized by cost, colored by trend]       ||
|           |  |  +--------+  +--------+  +------+  +------+      ||
|           |  |  |Staffing|  |Supplies|  |Equip |  |Overh.|      ||
|           |  |  | $68.2M |  | $31.5M |  |$15.2M|  |$15.5M|      ||
|           |  |  | +9.1%  |  | +4.3%  |  |+12.1%|  | +2.8%|      ||
|           |  |  +--------+  +--------+  +------+  +------+      ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +--------------------------------------------------+|
|           |  | VarianceAnalysisTable                              ||
|           |  |  Line Item | Actual | Budget | Var | Var% | Flag  ||
|           |  |  ----------|--------|--------|-----|------|------  ||
|           |  |  ER Nursing | $8.2M | $6.8M |+$1.4M|+20.6%| !!  ||
|           |  |  ICU Agency | $2.1M | $1.1M |+$980K|+89.1%| !!  ||
|           |  |  Surg Rev  | $48.3M| $43.5M |+$4.8M|+11.0%| +   ||
|           |  |  Pharm Rev | $12.1M| $13.4M |-$1.3M| -9.7%| !!  ||
|           |  +--------------------------------------------------+|
|           |                                                       |
|           |  +------------------------+  +-----------------------+|
|           |  | TopDriversPanel        |  | DepartmentComparison  ||
|           |  | Revenue Drivers:       |  | [Grouped bar chart:   ||
|           |  |  1. Surgical Vol +$4.8M|  |  Revenue vs Cost by   ||
|           |  |  2. Imaging Rev +$2.1M |  |  department, with     ||
|           |  |  3. ER Volume   +$1.5M |  |  margin % labels]     ||
|           |  | Cost Drivers:          |  |                       ||
|           |  |  1. Overtime    +$3.2M |  |                       ||
|           |  |  2. Equipment   +$1.8M |  |                       ||
|           |  |  3. Agency Stf  +$1.4M |  |                       ||
|           |  +------------------------+  +-----------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
RevenueCostPage (Server Component - layout + data fetching)
├── RevenueCostHeader
│   ├── PageTitle
│   ├── FiscalYearIndicator
│   └── ActionButtonGroup (Refresh, Export PDF, Share)
├── RevenueCostSidebar
│   ├── TimePeriodSelector (Monthly, Quarterly, Yearly, Custom)
│   ├── DateRangePicker
│   ├── ComparisonSelector (Prior Year, Budget, Custom Baseline)
│   ├── DepartmentFilter (multi-select)
│   ├── CostCategoryFilter (multi-select)
│   └── SidebarActions
│       ├── RunAnalysisButton
│       └── ExportReportButton
├── AIFinancialNarrative
│   ├── NarrativeText
│   ├── ExpandDetailsButton
│   ├── CopyNarrativeButton
│   └── RegenerateNarrativeButton
├── FinancialSummaryRow
│   ├── TotalRevenueCard
│   │   ├── RevenueAmount
│   │   ├── YoYChangeIndicator
│   │   └── BudgetVarianceIndicator
│   ├── TotalCostCard
│   │   ├── CostAmount
│   │   ├── YoYChangeIndicator
│   │   └── BudgetVarianceIndicator
│   └── NetMarginCard
│       ├── MarginPercentage
│       ├── MarginChangeIndicator
│       └── MarginSparkline
├── RevenueWaterfallChart (Recharts BarChart - waterfall style)
│   ├── WaterfallBar (repeated)
│   ├── ConnectorLines
│   ├── WaterfallTooltip
│   └── WaterfallLegend
├── CostBreakdownTreemap (Recharts Treemap)
│   ├── TreemapCell (repeated)
│   ├── TreemapLabel
│   └── TreemapTooltip
├── VarianceAnalysisTable
│   ├── VarianceTableHeader (sortable columns)
│   ├── VarianceTableRow (repeated)
│   │   ├── LineItemCell
│   │   ├── ActualAmountCell
│   │   ├── BudgetAmountCell
│   │   ├── VarianceAmountCell
│   │   ├── VariancePercentageCell
│   │   └── VarianceFlagBadge
│   ├── TablePagination
│   └── VarianceThresholdControl
├── TopDriversPanel
│   ├── RevenueDriversList
│   │   └── DriverItem (repeated)
│   │       ├── DriverRank
│   │       ├── DriverDescription
│   │       ├── DriverImpactAmount
│   │       └── DriverConfidenceBadge
│   └── CostDriversList
│       └── DriverItem (repeated)
└── DepartmentComparisonChart (Recharts BarChart - grouped)
    ├── RevenueBars
    ├── CostBars
    ├── MarginPercentageLabels
    └── DepartmentChartTooltip
```

### Design System Compliance
| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#031926` | Page background, table headers, primary text, waterfall chart base bars |
| `--color-teal` | `#007B7A` | Positive variance indicators, revenue growth badges, net margin positive |
| `--color-cerulean` | `#00B3C6` | Revenue bars in department comparison, links, active filter tabs, waterfall positive bars |
| `--color-gold` | `#C9A84A` | AI narrative highlight, attention badges, moderate variance warnings |
| `--color-danger` | `#DC2626` | Negative variance flags, cost overrun indicators, waterfall negative bars, critical cost drivers |
| `--color-success` | `#059669` | Revenue increase badges, margin improvement, positive YoY changes |
| `--color-muted` | `#6B7280` | Budget reference lines, prior year comparison values, secondary text |
| `--font-heading` | `Merriweather, serif` | Page title, card headers, department names, driver rankings |
| `--font-body` | `Inter, sans-serif` | Body text, table data, narrative text, metric labels |
| `--font-mono` | `JetBrains Mono, monospace` | Currency amounts, percentages, variance figures |
| `--spacing-card` | `p-6` (24px) | Internal card padding |
| `--spacing-gap` | `gap-6` (24px) | Grid gap between sections |
| `--radius-card` | `rounded-xl` (12px) | Card border radius |
| `--shadow-card` | `shadow-md` | Elevated card surfaces |

### Responsive Behavior
| Breakpoint | Layout | Behavior |
|---|---|---|
| `< 640px` (mobile) | Single column; sidebar collapses to bottom sheet | Summary cards stack vertically; waterfall chart scrolls horizontally; treemap collapses to sorted bar chart; variance table scrolls horizontally with frozen line-item column; drivers panel stacks above department chart |
| `640px - 1024px` (tablet) | Two-column grid; sidebar as collapsible drawer | Summary cards in 2-column + 1-column row; waterfall fits with smaller labels; treemap responsive; variance table fits with horizontal scroll; drivers and department chart stack |
| `> 1024px` (desktop) | Full layout as shown in ASCII diagram | All panels visible; sidebar pinned left; all charts fully interactive |

### Interaction Patterns
| Interaction | Behavior |
|---|---|
| **Time Period Change** | Re-fetches all financial data; all charts and tables update; URL params updated; skeleton loaders during transition |
| **Comparison Selector** | Toggles comparison base (Prior Year, Budget, Custom); all variance calculations recalculate; waterfall chart rebuilds |
| **Run Analysis** | Triggers Claude API analysis; narrative re-generates; top drivers re-ranked; spinner on narrative card |
| **AI Narrative Expand** | Expands from 3-line summary to full multi-paragraph analysis with supporting data points |
| **AI Narrative Regenerate** | Re-triggers Claude API with same data; new narrative generated; shows diff if significantly different |
| **Waterfall Bar Hover** | Tooltip shows component name, amount, percentage contribution, and YoY change |
| **Waterfall Bar Click** | Drill-down: navigates to detailed breakdown of that revenue/cost component |
| **Treemap Cell Click** | Drill-down: expands to sub-category treemap (e.g., Staffing -> Nursing, Physicians, Admin, Agency) |
| **Treemap Cell Hover** | Tooltip shows category name, amount, percentage of total, trend direction and percentage |
| **Variance Row Click** | Opens detailed variance analysis modal with 12-month trend chart, root cause notes, and comparison breakdown |
| **Variance Flag Click** | Scrolls to corresponding driver in TopDriversPanel if applicable |
| **Driver Item Click** | Opens drill-down modal showing underlying data supporting the driver attribution |
| **Department Chart Bar Click** | Navigates to department-specific P&L detail view |
| **Export PDF** | Background generation with branded template; download via toast notification; watermarked with user/date |
| **Share** | Generates shareable link with current filters and time period encoded in URL |
| **Loading States** | Skeleton placeholders for all sections; narrative shows typing animation; charts show loading spinners |
| **Error States** | Inline error banners; stale data indicator if financial sync delayed; never show raw numbers on error |

## Technical Architecture

### Component Structure
```
src/
├── app/
│   └── revenue-cost/
│       ├── page.tsx                              # Server component: data fetching + layout
│       ├── layout.tsx                            # Revenue-cost section layout
│       ├── loading.tsx                           # Streaming skeleton UI
│       ├── error.tsx                             # Error boundary
│       ├── [departmentId]/
│       │   ├── page.tsx                          # Department P&L detail page
│       │   └── loading.tsx
│       ├── _components/
│       │   ├── RevenueCostHeader.tsx
│       │   ├── RevenueCostSidebar.tsx
│       │   ├── AIFinancialNarrative.tsx
│       │   ├── TotalRevenueCard.tsx
│       │   ├── TotalCostCard.tsx
│       │   ├── NetMarginCard.tsx
│       │   ├── MarginSparkline.tsx
│       │   ├── RevenueWaterfallChart.tsx
│       │   ├── WaterfallTooltip.tsx
│       │   ├── CostBreakdownTreemap.tsx
│       │   ├── TreemapTooltip.tsx
│       │   ├── VarianceAnalysisTable.tsx
│       │   ├── VarianceTableRow.tsx
│       │   ├── VarianceFlagBadge.tsx
│       │   ├── VarianceDetailModal.tsx
│       │   ├── TopDriversPanel.tsx
│       │   ├── DriverItem.tsx
│       │   ├── DriverDetailModal.tsx
│       │   ├── DepartmentComparisonChart.tsx
│       │   ├── DepartmentChartTooltip.tsx
│       │   ├── TimePeriodSelector.tsx
│       │   ├── ComparisonSelector.tsx
│       │   ├── DepartmentFilter.tsx
│       │   ├── CostCategoryFilter.tsx
│       │   ├── RunAnalysisButton.tsx
│       │   └── ExportReportButton.tsx
│       └── _hooks/
│           ├── useRevenueCost.ts
│           ├── useFinancialAnalysis.ts
│           ├── useVarianceAnalysis.ts
│           ├── useAINarrative.ts
│           └── useFinancialFilters.ts
├── lib/
│   └── revenue-cost/
│       ├── revenue-cost.service.ts               # API client functions
│       ├── revenue-cost.types.ts                 # TypeScript interfaces
│       ├── revenue-cost.utils.ts                 # Formatting, calculation helpers
│       └── revenue-cost.constants.ts             # Categories, thresholds, fiscal year config
└── server/
    └── revenue-cost/
        ├── revenue-cost.controller.ts            # NestJS REST controller
        ├── revenue-cost.service.ts               # Business logic
        ├── revenue-cost.module.ts                # NestJS module
        ├── financial-analysis.processor.ts       # BullMQ job processor for AI analysis
        ├── report-generation.processor.ts        # BullMQ job processor for PDF export
        ├── financial-sync.service.ts             # GL/billing system integration sync
        ├── dto/
        │   ├── get-financial-summary.dto.ts
        │   ├── get-variance-analysis.dto.ts
        │   ├── get-cost-breakdown.dto.ts
        │   ├── run-analysis.dto.ts
        │   └── export-report.dto.ts
        └── entities/
            ├── financial-period.entity.ts
            ├── revenue-line.entity.ts
            ├── cost-line.entity.ts
            ├── budget-line.entity.ts
            ├── variance-record.entity.ts
            ├── financial-driver.entity.ts
            └── financial-narrative.entity.ts
```

### State Management Architecture
```typescript
// --- Global State (React Context + useReducer) ---

interface RevenueCostGlobalState {
  filters: FinancialFilters;
  summary: FinancialSummary | null;
  revenueBreakdown: RevenueComponent[];
  costBreakdown: CostComponent[];
  variances: VarianceRecord[];
  drivers: FinancialDriverAnalysis | null;
  narrative: FinancialNarrative | null;
  analysisJobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  drillDownPath: DrillDownBreadcrumb[];
}

interface FinancialFilters {
  timePeriod: TimePeriodType;
  dateRange: { start: Date; end: Date };
  comparisonBase: ComparisonBase;
  comparisonDateRange?: { start: Date; end: Date };
  departmentIds: string[];
  costCategories: CostCategory[];
  varianceThreshold: number;         // Percentage threshold for flagging (default 5%)
}

type TimePeriodType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
type ComparisonBase = 'PRIOR_YEAR' | 'BUDGET' | 'PRIOR_QUARTER' | 'CUSTOM';
type CostCategory = 'STAFFING' | 'SUPPLIES' | 'EQUIPMENT' | 'OVERHEAD' | 'FACILITIES' | 'PHARMACEUTICALS' | 'INSURANCE' | 'DEPRECIATION' | 'OTHER';
type RevenueCategory = 'INPATIENT' | 'OUTPATIENT' | 'SURGICAL' | 'EMERGENCY' | 'PHARMACY' | 'IMAGING' | 'LABORATORY' | 'REHABILITATION' | 'OTHER';

// --- Domain Types ---

interface FinancialSummary {
  periodLabel: string;               // e.g., "FY 2025-2026 Q3"
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
  marginTrend: MonthlyMargin[];      // 12-month sparkline data
  comparisonPeriodLabel: string;     // e.g., "FY 2024-2025 Q3"
}

interface MonthlyMargin {
  month: string;                     // "2025-01"
  marginPercentage: number;
}

interface RevenueComponent {
  componentId: string;
  name: string;
  category: RevenueCategory;
  departmentId: string;
  departmentName: string;
  currentAmount: number;
  comparisonAmount: number;
  delta: number;
  deltaPercentage: number;
  contributionPercentage: number;    // % of total revenue
  isPositive: boolean;
  subComponents?: RevenueComponent[];
}

interface CostComponent {
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
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  trendPercentage: number;
  subComponents?: CostComponent[];
  budgetAmount?: number;
  budgetVariance?: number;
  budgetVariancePercentage?: number;
}

interface VarianceRecord {
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
  severity: 'CRITICAL' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR';
  direction: 'FAVORABLE' | 'UNFAVORABLE';
  flagged: boolean;
  rootCauseNotes?: string;
  monthlyTrend: { month: string; amount: number }[];
}

interface FinancialDriverAnalysis {
  analysisId: string;
  generatedAt: string;
  modelVersion: string;
  confidence: number;
  revenueDrivers: FinancialDriver[];
  costDrivers: FinancialDriver[];
}

interface FinancialDriver {
  driverId: string;
  rank: number;
  name: string;
  category: string;
  departmentId?: string;
  departmentName?: string;
  impactAmount: number;
  impactPercentage: number;
  direction: 'INCREASE' | 'DECREASE';
  confidence: number;                // 0.0 - 1.0
  description: string;
  supportingDataPoints: {
    metric: string;
    value: string;
    context: string;
  }[];
  relatedVarianceIds: string[];
}

interface FinancialNarrative {
  narrativeId: string;
  generatedAt: string;
  summary: string;                   // 2-3 sentence executive summary
  fullAnalysis: string;              // Multi-paragraph detailed narrative
  keyInsights: {
    insight: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    actionable: boolean;
  }[];
  dataPointsUsed: number;
  modelVersion: string;
}

interface DrillDownBreadcrumb {
  label: string;
  level: 'TOTAL' | 'CATEGORY' | 'DEPARTMENT' | 'LINE_ITEM';
  filterId?: string;
}

interface DepartmentFinancialSummary {
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
```

### API Integration Schema
```typescript
// ============================================================
// GET /api/v1/revenue-cost/summary
// Fetch high-level financial summary
// ============================================================
interface GetFinancialSummaryRequest {
  params: {
    timePeriod: TimePeriodType;
    startDate: string;               // ISO date
    endDate: string;                 // ISO date
    comparisonBase: ComparisonBase;
    comparisonStartDate?: string;
    comparisonEndDate?: string;
    departmentIds?: string[];
  };
}

interface GetFinancialSummaryResponse {
  data: {
    summary: FinancialSummary;
    departmentSummaries: DepartmentFinancialSummary[];
  };
  meta: {
    dataFreshness: string;           // ISO datetime of last GL sync
    cached: boolean;
  };
}

// ============================================================
// GET /api/v1/revenue-cost/revenue-breakdown
// Fetch revenue waterfall data
// ============================================================
interface GetRevenueBreakdownRequest {
  params: {
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
    comparisonStartDate?: string;
    comparisonEndDate?: string;
    departmentIds?: string[];
    drillDownLevel?: 'CATEGORY' | 'DEPARTMENT' | 'LINE_ITEM';
    parentComponentId?: string;      // for sub-level drill-down
  };
}

interface GetRevenueBreakdownResponse {
  data: {
    components: RevenueComponent[];
    totalCurrent: number;
    totalComparison: number;
    totalDelta: number;
    drillDownPath: DrillDownBreadcrumb[];
  };
}

// ============================================================
// GET /api/v1/revenue-cost/cost-breakdown
// Fetch cost treemap data
// ============================================================
interface GetCostBreakdownRequest {
  params: {
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
    comparisonStartDate?: string;
    comparisonEndDate?: string;
    departmentIds?: string[];
    categories?: CostCategory[];
    drillDownLevel?: 'CATEGORY' | 'SUBCATEGORY' | 'DEPARTMENT' | 'LINE_ITEM';
    parentComponentId?: string;
  };
}

interface GetCostBreakdownResponse {
  data: {
    components: CostComponent[];
    totalCost: number;
    totalBudget: number;
    budgetVariance: number;
    drillDownPath: DrillDownBreadcrumb[];
  };
}

// ============================================================
// GET /api/v1/revenue-cost/variances
// Fetch variance analysis data
// ============================================================
interface GetVarianceAnalysisRequest {
  params: {
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
    threshold?: number;              // % threshold for flagging (default 5)
    type?: 'REVENUE' | 'COST' | 'ALL';
    severity?: 'CRITICAL' | 'SIGNIFICANT' | 'MODERATE' | 'MINOR';
    departmentIds?: string[];
    sortBy?: 'variance_amount' | 'variance_percentage' | 'severity' | 'line_item';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  };
}

interface GetVarianceAnalysisResponse {
  data: {
    variances: VarianceRecord[];
    summary: {
      totalVariances: number;
      criticalCount: number;
      significantCount: number;
      totalFavorableAmount: number;
      totalUnfavorableAmount: number;
      netVariance: number;
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
// GET /api/v1/revenue-cost/variances/:id
// Fetch detailed variance with 12-month trend
// ============================================================
interface GetVarianceDetailRequest {
  params: { id: string };
}

interface GetVarianceDetailResponse {
  data: {
    variance: VarianceRecord;
    relatedDrivers: FinancialDriver[];
    contextNarrative: string;        // AI-generated explanation of this specific variance
  };
}

// ============================================================
// POST /api/v1/revenue-cost/analyze
// Trigger AI-powered financial analysis (drivers + narrative)
// ============================================================
interface RunFinancialAnalysisRequest {
  body: {
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
    comparisonStartDate?: string;
    comparisonEndDate?: string;
    departmentIds?: string[];
    focusAreas?: ('REVENUE_GROWTH' | 'COST_REDUCTION' | 'MARGIN_IMPROVEMENT' | 'VARIANCE_EXPLANATION')[];
  };
}

interface RunFinancialAnalysisResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/revenue-cost/analyze/:jobId
// Poll analysis job status and results
// ============================================================
interface GetAnalysisResultRequest {
  params: { jobId: string };
}

interface GetAnalysisResultResponse {
  data: {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    drivers?: FinancialDriverAnalysis;
    narrative?: FinancialNarrative;
    error?: string;
  };
}

// ============================================================
// GET /api/v1/revenue-cost/department/:departmentId
// Fetch department-level P&L detail
// ============================================================
interface GetDepartmentFinancialRequest {
  params: {
    departmentId: string;
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
  };
}

interface GetDepartmentFinancialResponse {
  data: {
    department: DepartmentFinancialSummary;
    revenueLines: RevenueComponent[];
    costLines: CostComponent[];
    variances: VarianceRecord[];
    monthlyTrend: {
      month: string;
      revenue: number;
      cost: number;
      margin: number;
    }[];
  };
}

// ============================================================
// POST /api/v1/revenue-cost/export
// Trigger PDF report generation
// ============================================================
interface ExportFinancialReportRequest {
  body: {
    format: 'PDF' | 'CSV' | 'EXCEL';
    startDate: string;
    endDate: string;
    comparisonBase: ComparisonBase;
    departmentIds?: string[];
    includeSections: ('SUMMARY' | 'REVENUE_BREAKDOWN' | 'COST_BREAKDOWN' | 'VARIANCE_ANALYSIS' | 'DRIVERS' | 'NARRATIVE')[];
  };
}

interface ExportFinancialReportResponse {
  data: {
    jobId: string;
    status: 'QUEUED';
    estimatedCompletionSeconds: number;
  };
}

// ============================================================
// GET /api/v1/revenue-cost/trends
// Fetch trend data for charts
// ============================================================
interface GetFinancialTrendsRequest {
  params: {
    metrics: ('REVENUE' | 'COST' | 'MARGIN' | 'NET_INCOME')[];
    granularity: 'MONTHLY' | 'QUARTERLY';
    periods: number;                 // Number of periods back (e.g., 12 for 12 months)
    departmentIds?: string[];
  };
}

interface GetFinancialTrendsResponse {
  data: {
    trends: {
      metric: string;
      dataPoints: {
        period: string;
        value: number;
        comparisonValue?: number;
      }[];
    }[];
  };
}
```

## Implementation Requirements

### Core Components
| Component | File | Purpose |
|---|---|---|
| `RevenueCostPage` | `src/app/revenue-cost/page.tsx` | Server component; fetches financial summary via RSC; renders layout |
| `RevenueCostHeader` | `src/app/revenue-cost/_components/RevenueCostHeader.tsx` | Page title, fiscal year indicator, refresh/export/share buttons |
| `RevenueCostSidebar` | `src/app/revenue-cost/_components/RevenueCostSidebar.tsx` | Time period, comparison base, department, and category filters with action buttons |
| `AIFinancialNarrative` | `src/app/revenue-cost/_components/AIFinancialNarrative.tsx` | AI-generated executive summary with expand/copy/regenerate actions |
| `TotalRevenueCard` | `src/app/revenue-cost/_components/TotalRevenueCard.tsx` | Revenue total with YoY change and budget variance indicators |
| `TotalCostCard` | `src/app/revenue-cost/_components/TotalCostCard.tsx` | Cost total with YoY change and budget variance indicators |
| `NetMarginCard` | `src/app/revenue-cost/_components/NetMarginCard.tsx` | Net margin percentage with trend sparkline and comparison deltas |
| `MarginSparkline` | `src/app/revenue-cost/_components/MarginSparkline.tsx` | Compact 12-month margin trend line chart |
| `RevenueWaterfallChart` | `src/app/revenue-cost/_components/RevenueWaterfallChart.tsx` | Recharts waterfall showing revenue bridge from prior period to current |
| `CostBreakdownTreemap` | `src/app/revenue-cost/_components/CostBreakdownTreemap.tsx` | Recharts treemap showing cost distribution by category with trend coloring |
| `VarianceAnalysisTable` | `src/app/revenue-cost/_components/VarianceAnalysisTable.tsx` | Sortable, paginated table of financial variances with severity flags |
| `VarianceTableRow` | `src/app/revenue-cost/_components/VarianceTableRow.tsx` | Table row with amounts, variance, percentage, and flag badge |
| `VarianceFlagBadge` | `src/app/revenue-cost/_components/VarianceFlagBadge.tsx` | Severity-colored badge (!! for critical, ! for significant, etc.) |
| `VarianceDetailModal` | `src/app/revenue-cost/_components/VarianceDetailModal.tsx` | Modal with 12-month trend, root cause, related drivers |
| `TopDriversPanel` | `src/app/revenue-cost/_components/TopDriversPanel.tsx` | Ranked lists of top revenue and cost drivers with impact amounts |
| `DriverItem` | `src/app/revenue-cost/_components/DriverItem.tsx` | Individual driver with rank, description, impact, and confidence badge |
| `DriverDetailModal` | `src/app/revenue-cost/_components/DriverDetailModal.tsx` | Modal with supporting data points and related variance links |
| `DepartmentComparisonChart` | `src/app/revenue-cost/_components/DepartmentComparisonChart.tsx` | Grouped bar chart comparing revenue vs. cost by department |

### Custom Hooks
| Hook | File | Description |
|---|---|---|
| `useRevenueCost` | `src/app/revenue-cost/_hooks/useRevenueCost.ts` | Manages global financial state; provides actions for filter updates, data refresh |
| `useFinancialAnalysis` | `src/app/revenue-cost/_hooks/useFinancialAnalysis.ts` | Handles AI analysis job lifecycle: trigger, poll, receive drivers and narrative |
| `useVarianceAnalysis` | `src/app/revenue-cost/_hooks/useVarianceAnalysis.ts` | Fetches, filters, sorts variance data; manages drill-down detail modal |
| `useAINarrative` | `src/app/revenue-cost/_hooks/useAINarrative.ts` | Manages narrative state; expand/collapse; copy to clipboard; regenerate trigger |
| `useFinancialFilters` | `src/app/revenue-cost/_hooks/useFinancialFilters.ts` | Syncs filter state with URL search params; handles time period presets; comparison base logic |

### Utility Functions
| Utility | File | Description |
|---|---|---|
| `formatCurrency` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Formats amounts with $ prefix, commas, and K/M/B abbreviations |
| `formatPercentage` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Formats decimal to percentage with +/- sign and configurable precision |
| `formatVariance` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Formats variance with color-coding direction (favorable green, unfavorable red) |
| `calculateYoYChange` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Computes year-over-year change amount and percentage |
| `calculateBudgetVariance` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Computes budget variance with favorable/unfavorable classification |
| `getVarianceSeverity` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Classifies variance as CRITICAL/SIGNIFICANT/MODERATE/MINOR based on thresholds |
| `buildWaterfallData` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Transforms revenue components into waterfall chart data structure |
| `buildTreemapData` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Transforms cost components into treemap-compatible nested data |
| `getTimePeriodDates` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Resolves TimePeriodType to concrete start/end dates |
| `buildFinancialQueryParams` | `src/lib/revenue-cost/revenue-cost.utils.ts` | Serializes financial filter state to URL search params |
| `COST_CATEGORIES` | `src/lib/revenue-cost/revenue-cost.constants.ts` | Category definitions with labels, colors, and sort order |
| `REVENUE_CATEGORIES` | `src/lib/revenue-cost/revenue-cost.constants.ts` | Revenue source definitions with labels and colors |
| `VARIANCE_THRESHOLDS` | `src/lib/revenue-cost/revenue-cost.constants.ts` | Severity threshold configuration: CRITICAL > 20%, SIGNIFICANT > 10%, MODERATE > 5% |
| `FISCAL_YEAR_CONFIG` | `src/lib/revenue-cost/revenue-cost.constants.ts` | Fiscal year start month, quarter definitions |

## Acceptance Criteria

### Functional Requirements
1. The dashboard displays total revenue, total cost, and net margin for the selected time period with YoY and budget comparison
2. Users can select time periods (monthly, quarterly, yearly, custom date range) and all data recalculates accordingly
3. Users can choose comparison base (prior year, budget, prior quarter, custom) for all variance calculations
4. The AI financial narrative provides a 2-3 sentence executive summary of key financial changes with expand option for full analysis
5. The revenue waterfall chart visually bridges from prior/budget revenue to current revenue showing each component's contribution
6. Clicking a waterfall bar drills down to the next level of detail (category -> department -> line item)
7. The cost breakdown treemap displays costs sized by amount and colored by trend direction
8. Clicking a treemap cell drills into sub-categories (e.g., Staffing -> Nursing / Physicians / Admin / Agency)
9. The variance analysis table lists all line items with actual, budget, and variance columns, flagging variances exceeding the configured threshold
10. Clicking a variance row opens a detail modal with 12-month trend chart and AI-generated root cause explanation
11. The top drivers panel ranks the top 5 revenue drivers and top 5 cost drivers with quantified impact amounts
12. Each driver shows a confidence score and clicking reveals supporting data points
13. The department comparison chart shows revenue vs. cost by department as grouped bars with margin labels
14. Clicking a department bar navigates to a department-specific P&L detail page
15. PDF export generates a branded financial report including all visible sections
16. All filter selections, time period, and comparison base persist in URL search parameters

### Non-Functional Requirements
| Category | Requirement |
|---|---|
| **Performance** | Initial page load with server-rendered summary completes within 2s |
| **Performance** | Revenue waterfall and cost treemap render within 500ms after data load |
| **Performance** | AI narrative generation completes within 15 seconds |
| **Performance** | Variance table handles up to 500 line items with sorting/pagination at 60fps |
| **Performance** | Time period switch re-renders all components within 1.5s |
| **Accessibility** | WCAG 2.1 AA compliant; charts have accessible data table alternatives; variances announced by screen readers |
| **Accessibility** | Color-coded variances supplemented with text indicators (+/-) and icons |
| **Security** | Financial data requires `DIRECTOR`/`CFO`/`FINANCE_ANALYST` role; no browser caching of amounts |
| **Security** | PDF exports watermarked with username and timestamp; download logged to audit trail |
| **Reliability** | Graceful degradation: shows last-synced data with staleness warning if GL sync is delayed |
| **Scalability** | Supports 24+ months of historical data with smooth chart performance |

## Modified Files
```
src/
├── app/
│   └── revenue-cost/
│       ├── page.tsx                                     [NEW]
│       ├── layout.tsx                                   [NEW]
│       ├── loading.tsx                                  [NEW]
│       ├── error.tsx                                    [NEW]
│       ├── [departmentId]/
│       │   ├── page.tsx                                 [NEW]
│       │   └── loading.tsx                              [NEW]
│       ├── _components/
│       │   ├── RevenueCostHeader.tsx                    [NEW]
│       │   ├── RevenueCostSidebar.tsx                   [NEW]
│       │   ├── AIFinancialNarrative.tsx                 [NEW]
│       │   ├── TotalRevenueCard.tsx                     [NEW]
│       │   ├── TotalCostCard.tsx                        [NEW]
│       │   ├── NetMarginCard.tsx                        [NEW]
│       │   ├── MarginSparkline.tsx                      [NEW]
│       │   ├── RevenueWaterfallChart.tsx                [NEW]
│       │   ├── WaterfallTooltip.tsx                     [NEW]
│       │   ├── CostBreakdownTreemap.tsx                 [NEW]
│       │   ├── TreemapTooltip.tsx                       [NEW]
│       │   ├── VarianceAnalysisTable.tsx                [NEW]
│       │   ├── VarianceTableRow.tsx                     [NEW]
│       │   ├── VarianceFlagBadge.tsx                    [NEW]
│       │   ├── VarianceDetailModal.tsx                  [NEW]
│       │   ├── TopDriversPanel.tsx                      [NEW]
│       │   ├── DriverItem.tsx                           [NEW]
│       │   ├── DriverDetailModal.tsx                    [NEW]
│       │   ├── DepartmentComparisonChart.tsx            [NEW]
│       │   ├── DepartmentChartTooltip.tsx               [NEW]
│       │   ├── TimePeriodSelector.tsx                   [NEW]
│       │   ├── ComparisonSelector.tsx                   [NEW]
│       │   ├── DepartmentFilter.tsx                     [NEW]
│       │   ├── CostCategoryFilter.tsx                   [NEW]
│       │   ├── RunAnalysisButton.tsx                    [NEW]
│       │   └── ExportReportButton.tsx                   [NEW]
│       └── _hooks/
│           ├── useRevenueCost.ts                        [NEW]
│           ├── useFinancialAnalysis.ts                  [NEW]
│           ├── useVarianceAnalysis.ts                   [NEW]
│           ├── useAINarrative.ts                        [NEW]
│           └── useFinancialFilters.ts                   [NEW]
├── lib/
│   └── revenue-cost/
│       ├── revenue-cost.service.ts                      [NEW]
│       ├── revenue-cost.types.ts                        [NEW]
│       ├── revenue-cost.utils.ts                        [NEW]
│       └── revenue-cost.constants.ts                    [NEW]
├── server/
│   └── revenue-cost/
│       ├── revenue-cost.controller.ts                   [NEW]
│       ├── revenue-cost.service.ts                      [NEW]
│       ├── revenue-cost.module.ts                       [NEW]
│       ├── financial-analysis.processor.ts              [NEW]
│       ├── report-generation.processor.ts               [NEW]
│       ├── financial-sync.service.ts                    [NEW]
│       ├── dto/
│       │   ├── get-financial-summary.dto.ts             [NEW]
│       │   ├── get-variance-analysis.dto.ts             [NEW]
│       │   ├── get-cost-breakdown.dto.ts                [NEW]
│       │   ├── run-analysis.dto.ts                      [NEW]
│       │   └── export-report.dto.ts                     [NEW]
│       └── entities/
│           ├── financial-period.entity.ts               [NEW]
│           ├── revenue-line.entity.ts                   [NEW]
│           ├── cost-line.entity.ts                      [NEW]
│           ├── budget-line.entity.ts                    [NEW]
│           ├── variance-record.entity.ts                [NEW]
│           ├── financial-driver.entity.ts               [NEW]
│           └── financial-narrative.entity.ts            [NEW]
├── components/ui/
│   ├── Skeleton.tsx                                     [MODIFIED] - Add waterfall and treemap skeleton variants
│   ├── Modal.tsx                                        [MODIFIED] - Add wide variant for variance/driver detail modals
│   └── Badge.tsx                                        [MODIFIED] - Add variance severity badge variants
└── middleware.ts                                         [MODIFIED] - Add /revenue-cost route auth guard with finance role check
```

## Implementation Status
OVERALL STATUS: NOT STARTED

### Phase 1: Foundation & Setup
| Task | Status |
|---|---|
| Create `src/app/revenue-cost/` route directory and layout | Not Started |
| Define TypeScript interfaces in `revenue-cost.types.ts` | Not Started |
| Define constants (categories, thresholds, fiscal year config) in `revenue-cost.constants.ts` | Not Started |
| Set up NestJS module, controller, and service stubs | Not Started |
| Create PostgreSQL migration for `financial_periods`, `revenue_lines`, `cost_lines`, `budget_lines`, `variance_records`, `financial_drivers`, `financial_narratives` tables | Not Started |
| Configure BullMQ queues `financial-analysis` and `report-generation` with processor stubs | Not Started |
| Set up financial sync service for GL/billing system integration | Not Started |
| Add route auth guard in middleware with finance role restriction | Not Started |

### Phase 2: Core Implementation
| Task | Status |
|---|---|
| Implement `RevenueCostPage` server component with RSC data fetching | Not Started |
| Build `TotalRevenueCard`, `TotalCostCard`, `NetMarginCard` with `MarginSparkline` | Not Started |
| Build `RevenueWaterfallChart` with interactive waterfall bars and drill-down navigation | Not Started |
| Build `CostBreakdownTreemap` with category-sized cells and trend coloring | Not Started |
| Implement `RevenueCostSidebar` with time period, comparison, and filter controls | Not Started |
| Implement `GET /api/v1/revenue-cost/summary` endpoint with PostgreSQL aggregations | Not Started |
| Implement `GET /api/v1/revenue-cost/revenue-breakdown` endpoint with hierarchical data | Not Started |
| Implement `GET /api/v1/revenue-cost/cost-breakdown` endpoint with hierarchical data | Not Started |
| Build `useFinancialFilters` hook with time period presets and URL param sync | Not Started |

### Phase 3: Enhanced Features
| Task | Status |
|---|---|
| Build `VarianceAnalysisTable` with sortable columns, severity flags, and pagination | Not Started |
| Build `VarianceDetailModal` with 12-month trend chart and AI root cause explanation | Not Started |
| Implement `GET /api/v1/revenue-cost/variances` endpoint with threshold-based flagging | Not Started |
| Build `AIFinancialNarrative` component with expand/copy/regenerate functionality | Not Started |
| Build `TopDriversPanel` and `DriverItem` components with ranked impact lists | Not Started |
| Build `DriverDetailModal` with supporting data points | Not Started |
| Implement `POST /api/v1/revenue-cost/analyze` with Claude API integration for driver attribution and narrative generation | Not Started |
| Build `DepartmentComparisonChart` with grouped revenue/cost bars | Not Started |
| Build department drill-down page `[departmentId]/page.tsx` with department P&L | Not Started |
| Implement PDF report export via BullMQ background job with branded template | Not Started |
| Add Neo4j integration for cost dependency graphs and revenue flow mapping | Not Started |

### Phase 4: Polish & Testing
| Task | Status |
|---|---|
| Add loading skeletons and error boundary | Not Started |
| Implement responsive breakpoints for mobile (treemap -> bar chart fallback) and tablet | Not Started |
| Add WCAG 2.1 AA accessibility (chart data tables, screen reader variance announcements) | Not Started |
| Implement financial data security (no browser caching, session timeout, export watermarks) | Not Started |
| Write unit tests for utility functions and hooks | Not Started |
| Write integration tests for page rendering and user interactions | Not Started |
| Write E2E tests for critical flows (time period change, drill-down, analysis, export) | Not Started |
| Performance audit: chart rendering, large dataset handling, bundle size | Not Started |

## Dependencies

### Internal Dependencies
| Dependency | Purpose | Status |
|---|---|---|
| Shared UI component library (`@/components/ui`) | Buttons, cards, tables, modals, badges, skeleton | Assumed available |
| Authentication middleware (`@/middleware.ts`) | JWT validation, finance role extraction | Assumed available |
| Database connection module (`@/server/database`) | PostgreSQL connection pool | Assumed available |
| Redis connection module (`@/server/redis`) | Redis client for caching financial aggregations and BullMQ | Assumed available |
| Neo4j connection module (`@/server/neo4j`) | Graph DB for cost dependency and revenue flow analysis | Assumed available |
| Audit logging service (`@/server/audit`) | Immutable audit trail for financial data access and exports | Assumed available |
| Staff Allocation module (`@/server/staff-allocation`) | Staffing cost data and overtime metrics | Planned (Feature 01) |
| Supply Chain module (`@/server/supply-chain`) | Procurement cost data | Planned (Feature 03) |

### External Dependencies
| Package | Version | Purpose |
|---|---|---|
| `recharts` | `^2.12.x` | Waterfall chart, treemap, grouped bar chart, sparklines |
| `date-fns` | `^3.x` | Date manipulation, fiscal year calculations, period formatting |
| `@tanstack/react-query` | `^5.x` | Server state management, polling for analysis jobs |
| `@tanstack/react-table` | `^8.x` | Headless table for variance analysis table |
| `bullmq` | `^5.x` | Background job queue for AI analysis and report generation |
| `@anthropic-ai/sdk` | `^0.30.x` | Claude API for financial narrative and driver attribution |
| `zod` | `^3.x` | Request/response validation |
| `@react-pdf/renderer` | `^3.x` | PDF report generation with branded templates |
| `csv-stringify` | `^6.x` | CSV export generation |
| `html2canvas` | `^1.x` | Chart snapshot for PDF report inclusion |

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| GL sync delays causing stale financial data | Medium | High | Display data freshness timestamp prominently; configurable staleness threshold with warning banner; manual sync trigger |
| Claude API generates inaccurate financial narratives | Medium | High | Include confidence indicators on all AI-generated content; "AI-generated" label with disclaimer; human review workflow for high-stakes reports; regenerate capability |
| Revenue waterfall becomes unreadable with many components | Medium | Medium | Group small components (< 2% of total) into "Other" category; allow expand-on-click; limit to top N components with expandable overflow |
| Complex fiscal year / period calculations cause data misalignment | Low | High | Centralize period calculation logic in utility functions with comprehensive unit tests; validate against known GL totals |
| PDF report generation slow for large datasets | Medium | Medium | Background generation via BullMQ; stream chart images; limit report scope to selected filters; progress indicator |
| Drill-down navigation creates complex state management | Medium | Medium | Use URL-based breadcrumb state; clear drill-down path on filter change; browser back button navigates up one level |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Directors distrust AI-generated financial narratives | High | High | Always show underlying data alongside narrative; provide "Expand Details" for every AI claim; allow narrative customization; track accuracy over time |
| Financial data discrepancies with official GL reports | Medium | High | Monthly reconciliation check against official GL; flag discrepancies; use GL as authoritative source; document data transformation logic |
| Variance threshold too aggressive causes alert fatigue | Medium | Medium | Configurable threshold per user/department; start conservative (10%); allow severity-level filtering |
| Confidential financial data exposed to unauthorized roles | Low | Critical | Strict RBAC enforcement at API level (not just UI); column-level encryption; audit log review automation; penetration testing |
| Department heads dispute cost attributions | Medium | Medium | Transparent attribution methodology; show allocation rules; allow dispute/annotation mechanism; regular methodology review with finance team |

## Testing Strategy

### Unit Tests (Jest)
```
tests/unit/revenue-cost/
├── revenue-cost.utils.test.ts
│   ├── formatCurrency: handles negative, zero, K/M/B abbreviations
│   ├── formatPercentage: handles positive/negative with sign, configurable precision
│   ├── formatVariance: returns correct color direction for favorable/unfavorable
│   ├── calculateYoYChange: handles zero base, growth, decline
│   ├── calculateBudgetVariance: classifies favorable/unfavorable correctly
│   ├── getVarianceSeverity: returns correct severity for threshold boundaries
│   ├── buildWaterfallData: transforms components into waterfall structure with running totals
│   ├── buildTreemapData: creates nested treemap structure from flat components
│   └── getTimePeriodDates: resolves all period types to correct date ranges including fiscal year
├── revenue-cost.constants.test.ts
│   ├── validates variance thresholds are ordered correctly
│   └── validates fiscal year config produces correct period boundaries
├── useFinancialFilters.test.ts
│   ├── initializes from URL search params including time period and comparison base
│   ├── resolves preset periods to correct dates
│   ├── updates comparison date range when base changes
│   └── resets all filters to defaults
└── useAINarrative.test.ts
    ├── fetches narrative on analysis completion
    ├── expand/collapse toggles full analysis visibility
    ├── copy to clipboard works correctly
    └── regenerate triggers new analysis job
```

### Integration Tests (React Testing Library)
```
tests/integration/revenue-cost/
├── RevenueCostPage.test.tsx
│   ├── renders loading skeleton on initial load
│   ├── displays financial summary after fetch
│   ├── updates all sections on time period change
│   └── shows error boundary on API failure
├── RevenueWaterfallChart.test.tsx
│   ├── renders waterfall bars with correct heights and colors
│   ├── tooltip shows component details on hover
│   ├── clicking bar triggers drill-down navigation
│   └── groups small components into "Other"
├── CostBreakdownTreemap.test.tsx
│   ├── renders treemap cells sized correctly by cost amount
│   ├── colors cells by trend direction
│   ├── tooltip shows category details
│   └── clicking cell drills into sub-categories
├── VarianceAnalysisTable.test.tsx
│   ├── renders all variances with correct formatting
│   ├── sorts by column on header click
│   ├── flags variances exceeding threshold
│   ├── clicking row opens detail modal
│   └── paginates correctly
├── AIFinancialNarrative.test.tsx
│   ├── renders summary text
│   ├── expand shows full analysis
│   ├── copy button copies to clipboard
│   └── regenerate triggers new analysis
├── TopDriversPanel.test.tsx
│   ├── renders ranked revenue and cost drivers
│   ├── shows confidence badges
│   └── clicking driver opens detail modal
└── DepartmentComparisonChart.test.tsx
    ├── renders grouped bars for all departments
    ├── shows margin labels
    └── clicking bar navigates to department detail
```

### E2E Tests (Playwright)
```
tests/e2e/revenue-cost/
├── revenue-cost-overview.spec.ts
│   ├── full page loads with summary, charts, variance table
│   ├── time period switch from monthly to quarterly updates all data
│   ├── comparison base switch from prior year to budget recalculates variances
│   └── department filter narrows all visualizations
├── revenue-cost-drilldown.spec.ts
│   ├── waterfall click -> drill to category -> drill to department -> drill to line item
│   ├── treemap click -> drill to sub-category -> back navigation
│   ├── breadcrumb navigation returns to higher levels
│   └── department chart click -> navigate to department P&L page
├── revenue-cost-analysis.spec.ts
│   ├── run analysis -> AI narrative generates successfully
│   ├── expand narrative -> full analysis visible
│   ├── top drivers display with ranked impacts
│   └── driver detail shows supporting data points
├── revenue-cost-variance.spec.ts
│   ├── variance table sorts and filters correctly
│   ├── clicking flagged variance opens detail modal with trend chart
│   ├── detail modal shows AI root cause explanation
│   └── threshold adjustment changes flagged items
├── revenue-cost-export.spec.ts
│   ├── PDF export generates branded report with watermark
│   ├── CSV export downloads correct data
│   └── share button generates URL with current filter state
└── revenue-cost-responsive.spec.ts
    ├── mobile: treemap becomes bar chart, sidebar collapses
    ├── tablet: charts responsive, table scrolls
    └── desktop: full layout renders correctly
```

## Performance Considerations
| Area | Target | Strategy |
|---|---|---|
| **Initial Page Load (LCP)** | < 2s | Server-side rendering for summary cards; stream charts via Suspense; defer AI narrative |
| **Time Period Switch** | < 1.5s | Parallel API calls for summary, breakdown, and variance data; skeleton loaders during transition |
| **Revenue Waterfall** | 60fps | Limit to top 10 components + "Other"; memoize running total calculations; CSS transitions for bar animations |
| **Cost Treemap** | 60fps | Memoize layout calculations; virtualize cells for > 50 categories; smooth zoom transitions |
| **Variance Table** | 60fps with 500 rows | Server-side pagination (50 per page); memoize row rendering; virtual scrolling for in-page filtering |
| **AI Analysis** | < 15s | Focused Claude API prompt with pre-aggregated data; stream response tokens; cache results for 1 hour |
| **PDF Export** | < 30s | Pre-render chart images server-side; stream PDF assembly; progressive notification |
| **API Response (Summary)** | < 800ms | PostgreSQL materialized views for period aggregations; Redis cache with 10-minute TTL |
| **API Response (Variances)** | < 500ms | Pre-computed variance records updated on GL sync; indexed queries on department, category, severity |
| **Bundle Size** | < 170KB (route) | Dynamic import for `RevenueWaterfallChart`, `CostBreakdownTreemap`, `DepartmentComparisonChart`; tree-shake Recharts |
| **Memory** | < 60MB client | Paginate variance table; limit chart data retention; dispose chart instances on unmount |

## Deployment Plan
| Step | Action | Environment | Gate |
|---|---|---|---|
| 1 | Database migration: create financial tables and materialized views | Staging -> Production | Migration reviewed; validated against sample GL data |
| 2 | Deploy financial sync service and validate initial GL data import | Staging | Sync completes; totals match official GL report |
| 3 | Deploy NestJS backend with feature flag `REVENUE_COST_ENABLED=false` | Staging | API integration tests pass |
| 4 | Deploy BullMQ analysis and report workers | Staging | Workers process test jobs successfully |
| 5 | Deploy frontend behind feature flag | Staging | E2E tests pass in staging |
| 6 | Internal QA with CFO/finance team using real (or anonymized) financial data | Staging | Finance team validates data accuracy and narrative quality |
| 7 | Enable for pilot hospital (restricted to DIRECTOR and CFO roles) | Production | Monitoring active; data reconciliation confirmed |
| 8 | Monitor for 2 weeks: data accuracy, narrative quality, user engagement | Production | Zero data discrepancies; narrative quality >= 4/5 |
| 9 | Expand access to FINANCE_ANALYST role | Production | RBAC enforcement verified |
| 10 | General availability: enable for all tenants | Production | Pilot metrics meet thresholds |

## Monitoring & Analytics
| Metric | Tool | Alert Threshold |
|---|---|---|
| API error rate (`/revenue-cost/*`) | CloudWatch + DataDog | > 0.5% over 5-minute window |
| GL sync success rate | Custom health check | < 99% over 24-hour window |
| GL sync data freshness | Custom monitoring | > 2 hours since last successful sync |
| Financial data reconciliation drift | Automated daily check | > 0.01% discrepancy from official GL |
| AI analysis job duration | BullMQ metrics | P95 > 20s |
| AI narrative generation failures | BullMQ dead-letter queue | Any job in DLQ |
| Claude API token usage (revenue-cost) | Custom middleware | > 60% of monthly budget allocated to this feature |
| PDF export job duration | BullMQ metrics | P95 > 45s |
| Page load time (LCP) | Vercel Analytics / Web Vitals | > 3s |
| Time period switch latency | Custom analytics | P95 > 2.5s |
| User time-on-page (directors) | Analytics | Average < 2 min (indicates not getting value) or > 15 min (indicates confusion) |
| Drill-down depth per session | Custom analytics | Average < 1.5 (indicates drill-down not being used) |
| Export frequency | Custom analytics | Track adoption; low usage may indicate inadequacy |
| Unauthorized access attempts | Audit log analysis | Any access by non-finance roles |

## Documentation Requirements
| Document | Audience | Content |
|---|---|---|
| API Reference (OpenAPI spec) | Backend developers | All `/revenue-cost/*` endpoints with schemas, including drill-down parameters |
| Component Storybook Stories | Frontend developers | Interactive examples for all components including waterfall, treemap, variance table |
| Executive Dashboard User Guide | Hospital directors | How to interpret financial dashboard, use drill-down, read AI narratives, export reports |
| Finance Analyst Guide | Finance team | Detailed guide on variance analysis, threshold configuration, driver interpretation |
| GL Integration Guide | Implementation team | How to connect GL system; account mapping; sync schedule; reconciliation procedures |
| AI Narrative Methodology | Finance leadership | How the AI generates narratives; what data it uses; limitations and confidence indicators |
| Data Security & Access Guide | IT/Security | RBAC configuration; audit log review; export controls; encryption details |
| Runbook: GL Sync Failures | DevOps/SRE | Diagnostics for sync issues; manual reconciliation; data correction procedures |
| Runbook: Financial Analysis Failures | DevOps/SRE | AI analysis job recovery; Claude API fallback; cache management |

## Post-Launch Review
| Review Item | Timeline | Owner |
|---|---|---|
| Data accuracy validation (dashboard totals vs. official GL reports) | 1 week post-launch | Finance + Engineering |
| AI narrative quality assessment (finance team survey) | 2 weeks post-launch | Product + Data Science |
| Driver attribution accuracy (do identified drivers match finance team understanding?) | 3 weeks post-launch | Finance + Data Science |
| User engagement analysis (time-on-page, drill-down usage, export frequency) | 2 weeks post-launch | Product |
| Performance audit (page load, API latency, chart rendering) | 1 week post-launch | Engineering |
| Security audit (RBAC enforcement, audit log review, export watermark verification) | 1 week post-launch | Security + Engineering |
| CFO/Director feedback interviews | 3 weeks post-launch | Product |
| Cost analysis: Claude API spend for financial analysis | 4 weeks post-launch | Engineering + Finance |
| Reconciliation process effectiveness | 4 weeks post-launch | Finance + Engineering |
| Retrospective: engineering velocity, data quality issues, production incidents | 2 weeks post-launch | Engineering |
| Decision: Phase 2 features (predictive revenue modeling, department P&L budgeting tool, board-ready report templates) | 6 weeks post-launch | Product + CFO |
