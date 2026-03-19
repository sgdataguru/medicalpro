# 08 View Data Quality Governance Dashboard - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital data administrator**, I want to **view a dashboard showing data quality metrics and governance status across all data pipeline layers**, so that I can **trust the analytics output and quickly identify where data issues originate**.

## Pre-conditions
- Data ingestion pipelines for all five modules are operational with instrumented quality checkpoints at each pipeline stage
- PostgreSQL database schema supports quality metrics storage with timestamps and pipeline stage identifiers
- Data pipeline stages are clearly defined: raw ingestion, processing, actionable output, and simulation
- RBAC system supports `data_administrator` role with governance dashboard permissions
- BullMQ infrastructure is deployed for scheduled quality assessment jobs
- Claude API integration is active for automated quality rule generation and anomaly explanation
- Audit logging infrastructure captures all data processing events with actor and checkpoint metadata

## Business Requirements
- **Establish trust in analytics output** by providing transparent data quality visibility
  - Success Metric: 95% of dashboard users report increased confidence in analytics accuracy
- **Reduce cost of data issues** by catching problems early in the pipeline
  - Success Metric: 80% of data quality issues detected at raw/processing stage (not at simulation/output stage)
- **Enable rapid root cause identification** when data issues affect module outputs
  - Success Metric: Mean-time-to-identify data issue root cause reduced from 4 hours to 15 minutes
- **Maintain continuous compliance** with data governance standards
  - Success Metric: 100% of data processing events have governance audit trail entries
- **Automate data quality monitoring** to reduce manual data analyst workload
  - Success Metric: AI automates 70% of data quality assessment tasks; human review required for remaining 30%

## Technical Specifications

### Integration Points
- **Data Ingestion Layer**: Monitor raw data imports from HL7 FHIR feeds, CSV uploads, API integrations; capture record counts, schema validation results, ingestion timestamps
- **Processing Layer**: Monitor ETL/transformation pipelines; capture transformation success rates, data type conversion errors, null value handling
- **Actionable Output Layer**: Monitor module-specific data products (staffing rosters, bed allocations, supply forecasts, financial reports); capture completeness, consistency, accuracy metrics
- **Simulation Layer**: Monitor simulation input data quality and output validity; capture simulation data integrity checks
- **Anomaly Detection Module (Story 05)**: Receive data quality anomaly signals; feed governance dashboard with data-specific anomaly classifications
- **Staffing Module API** (`/api/v1/staffing`): Quality metrics for staff records, shift data, certification validity
- **Bed Allocation Module API** (`/api/v1/beds`): Quality metrics for bed status, occupancy records, ward configurations
- **Supply Chain Module API** (`/api/v1/supply-chain`): Quality metrics for inventory levels, supplier data, purchase orders
- **Finance Module API** (`/api/v1/finance`): Quality metrics for revenue records, cost entries, budget allocations
- **Claude API**: Automated quality rule suggestions, issue classification, root cause analysis, natural language quality reports
- **BullMQ Job Queues**: `quality-assessment-queue`, `quality-report-queue`, `audit-log-queue`

### Security Requirements
- **HIPAA-Adjacent Compliance**: Governance logs may reference data containing PHI; all audit records encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Data Encryption**: Quality metrics stored in PostgreSQL with column-level encryption for any fields that reference patient or financial data
- **RBAC Enforcement**: Only `data_administrator` and `admin` roles can access full governance dashboard; module managers see their module's quality metrics only
- **Audit Log Immutability**: Governance audit logs stored in append-only table (no UPDATE/DELETE operations); tamper-evident with hash chaining
- **Data Retention**: Governance audit logs retained for 7 years per healthcare compliance; quality metrics retained for 3 years with monthly rollup aggregation
- **Access Logging**: Every governance dashboard view logged with viewer identity, timestamp, and filters applied

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  HEADER: Medical Pro - Data Quality & Governance                   |
+------------------------------------------------------------------+
|                                                                    |
|  +--OVERALL QUALITY SCORE (Hero)-------------------------------+  |
|  |                                                              |  |
|  |    Overall Data Quality Score                                |  |
|  |    [============================] 94.2%                      |  |
|  |                                                              |  |
|  |    +--STAGE SCORES (4 cards)-----------------------------+   |  |
|  |    | Raw: 97.1%  | Process: 95.8% | Action: 92.4% | Sim: 91.5%| |
|  |    | [=======]   | [======]       | [=====]       | [====]    | |
|  |    +------------------------------------------------------+  |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--PIPELINE FLOW DIAGRAM-------------------------------------+  |
|  |                                                              |  |
|  |  [RAW INGESTION] --> [PROCESSING] --> [ACTION] --> [SIMULATION]|
|  |    97.1%              95.8%           92.4%        91.5%     |  |
|  |    2 issues           5 issues        8 issues     3 issues  |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--LEFT PANEL (55%)----------+  +--RIGHT PANEL (45%)---------+  |
|  |                             |  |                             |  |
|  |  MODULE QUALITY BREAKDOWN   |  |  ACTIVE ISSUES             |  |
|  |                             |  |                             |  |
|  |  +--MODULE ROW-----------+ |  |  +--ISSUE CARD-----------+ |  |
|  |  | Staffing      96.3%   | |  |  | [!] NULL Values in     | |  |
|  |  | [===========] 1 issue | |  |  | staff certifications   | |  |
|  |  +------------------------+ |  |  | Layer: RAW             | |  |
|  |  | Beds          94.7%   | |  |  | Module: Staffing       | |  |
|  |  | [==========] 3 issues | |  |  | Records: 12            | |  |
|  |  +------------------------+ |  |  | Detected: 2 hrs ago    | |  |
|  |  | Supply Chain  93.1%   | |  |  +------------------------+ |  |
|  |  | [=========] 5 issues  | |  |  | [!] Duplicate PO       | |  |
|  |  +------------------------+ |  |  | entries detected        | |  |
|  |  | Finance       92.8%   | |  |  | Layer: PROCESSING      | |  |
|  |  | [=========] 4 issues  | |  |  | Module: Supply Chain   | |  |
|  |  +------------------------+ |  |  | Records: 3             | |  |
|  |  | Anomalies     91.5%   | |  |  +------------------------+ |  |
|  |  | [========] 5 issues   | |  |                             |  |
|  |  +------------------------+ |  |  [View All Issues (18)]     |  |
|  +-----------------------------+  +-----------------------------+  |
|                                                                    |
|  +--QUALITY TREND CHART (full width)---------------------------+  |
|  |  Data Quality Score Over Time (90-day rolling)               |  |
|  |  ___    ___/\____/\___/\                                     |  |
|  |  Raw ---  Processing ---  Action ---  Simulation ---         |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--GOVERNANCE AUDIT LOG (full width)--------------------------+  |
|  |  Timestamp    | Pipeline  | Check           | Result | Actor |  |
|  |  03-15 09:14  | Raw       | Schema Valid    | PASS   | Auto  |  |
|  |  03-15 09:14  | Raw       | NULL Check      | FAIL   | Auto  |  |
|  |  03-15 09:12  | Process   | Type Conversion | PASS   | Auto  |  |
|  |  03-15 09:10  | Action    | Completeness    | WARN   | Auto  |  |
|  |  [Load More...]                                              |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--BENCHMARK CONFIG (collapsible)-----------------------------+  |
|  |  Module    | Min Score | Alert Threshold | Current | Status  |  |
|  |  Staffing  | 90%       | 92%             | 96.3%   | OK      |  |
|  |  Beds      | 90%       | 92%             | 94.7%   | OK      |  |
|  |  Supply    | 85%       | 90%             | 93.1%   | OK      |  |
|  |  Finance   | 92%       | 95%             | 92.8%   | WARN    |  |
|  |  [Edit Benchmarks]                                           |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
GovernanceDashboardPage
├── GovernancePageHeader
│   ├── BreadcrumbNav
│   └── GovernanceRefreshButton
├── OverallQualityScoreHero
│   ├── QualityScoreGauge
│   └── PipelineStageScoreStrip
│       └── StageScoreCard (repeating: raw, processing, action, simulation)
│           ├── StageScoreBar
│           └── StageIssueCount
├── PipelineFlowDiagram
│   ├── PipelineStageNode (repeating)
│   │   ├── StageLabel
│   │   ├── StageScore
│   │   └── StageIssueIndicator
│   └── PipelineFlowArrow (repeating)
├── GovernanceContentLayout
│   ├── ModuleQualityPanel
│   │   └── ModuleQualityRow (repeating)
│   │       ├── ModuleIcon
│   │       ├── ModuleName
│   │       ├── QualityScoreBar
│   │       ├── IssueCountBadge
│   │       └── ModuleQualityExpandable
│   │           ├── DimensionScore (completeness, accuracy, consistency, timeliness)
│   │           └── LayerBreakdownGrid
│   └── ActiveIssuesPanel
│       ├── IssueSortDropdown
│       ├── DataQualityIssueCard (repeating)
│       │   ├── IssueSeverityIcon
│       │   ├── IssueTitle
│       │   ├── IssueLayerBadge
│       │   ├── IssueModuleBadge
│       │   ├── AffectedRecordCount
│       │   ├── IssueTimestamp
│       │   └── IssueQuickActions
│       └── ViewAllIssuesLink
├── QualityTrendChart
│   ├── TrendChartControls
│   │   ├── TimePeriodSelector
│   │   └── LayerToggleButtons
│   └── TrendChartCanvas
├── GovernanceAuditLogTable
│   ├── AuditLogFilterBar
│   │   ├── PipelineStageFilter
│   │   ├── ResultFilter
│   │   └── DateRangeFilter
│   ├── AuditLogRow (repeating)
│   │   ├── TimestampCell
│   │   ├── PipelineStageCell
│   │   ├── CheckNameCell
│   │   ├── ResultBadge
│   │   └── ActorCell
│   ├── AuditLogPagination
│   └── ExportAuditLogButton
└── BenchmarkConfigPanel
    ├── BenchmarkConfigToggle
    ├── BenchmarkConfigTable
    │   └── BenchmarkConfigRow (repeating)
    │       ├── ModuleName
    │       ├── MinScoreInput
    │       ├── AlertThresholdInput
    │       ├── CurrentScoreDisplay
    │       └── BenchmarkStatusIndicator
    └── SaveBenchmarksButton
```

### Design System Compliance
- **Primary Background**: `ink` (#031926) for page and panel backgrounds
- **Quality Score Colors**:
  - Excellent (95-100%): `teal` (#007B7A)
  - Good (90-94%): `cerulean` (#00B3C6)
  - Warning (80-89%): `gold` (#C9A84A)
  - Critical (<80%): `#DC2626` (red-600)
- **Score Bars**: Gradient fills from `teal` to `cerulean` for healthy scores; `gold` to `#DC2626` for degrading scores
- **Overall Score Gauge**: Large circular or semi-circular gauge with Merriweather score text at 48px, `white`
- **Pipeline Flow Diagram**: Nodes as rounded rectangles with stage color, connecting arrows as animated dashed lines `stroke-dashoffset`
- **Module Quality Rows**: `ink-light` (#0A2A3C) background with left border color matching quality level
- **Issue Cards**: `bg-white/5 border border-white/10` with severity-colored left border (red/gold/cerulean)
- **Audit Log Table**: Alternating `ink`/`ink-light` rows, result badges: PASS = `teal`, FAIL = red, WARN = `gold`
- **Benchmark Config**: `ink-light` background, editable inputs with `border-teal/30 focus:border-teal` focus ring
- **Headings**: Merriweather, 600 weight, `cerulean` (#00B3C6) for section titles
- **Body Text**: Inter, 400 weight, `#E2E8F0` primary, `#94A3B8` for secondary/metadata
- **Collapsible Sections**: Chevron icon rotation on expand, `transition-all duration-300` on content height

### Responsive Behavior
- **Desktop (xl: 1280px+)**: Full layout with 55/45 split for module panel and issues panel, audit log and benchmark in full width below
- **Large Tablet (lg: 1024px)**: Module/issues split at 50/50, pipeline flow diagram nodes slightly smaller
- **Tablet (md: 768px)**: Module panel and issues panel stack vertically (full width each), pipeline flow wraps to 2x2 grid, audit log scrolls horizontally
- **Mobile (sm: 640px)**: Single column stacked, pipeline stages as vertical compact list, audit log shows card view instead of table, benchmark config as accordion
- **Breakpoint Classes**: Content split `grid-cols-1 lg:grid-cols-[1.2fr_1fr]`, stage scores `grid-cols-2 sm:grid-cols-4`, audit log `overflow-x-auto md:overflow-visible`

### Interaction Patterns
- **Module Quality Row Expand**: Click row to expand and show quality dimension breakdown (completeness, accuracy, consistency, timeliness) and layer-by-layer scores with `transition-all duration-300 ease-in-out`
- **Pipeline Stage Click**: Click stage node in flow diagram to filter all dashboard data to that pipeline stage
- **Issue Card Click**: Click issue card to open issue detail drawer with full context, affected records, root cause analysis (Claude-generated), and remediation suggestions
- **Audit Log Filtering**: Inline filters for pipeline stage, result type, date range; debounced (300ms) filter application
- **Benchmark Editing**: Click "Edit Benchmarks" to toggle inputs from read-only to editable; save button appears; validation on blur (min < alert < 100); cancel reverts to previous values
- **Quality Score Animation**: Score bars animate from 0 to current value on page load with `transition-all duration-1000 ease-out`
- **Refresh Button**: Manual refresh triggers quality reassessment job; button shows spinner during processing; auto-refresh every 5 minutes when dashboard is open
- **Export Audit Log**: Download filtered audit log as CSV with all visible columns and current filter state
- **Trend Chart Interaction**: Hover shows tooltip with exact scores per layer at that date; click-drag to zoom into date range; toggle layer visibility via legend buttons
- **Loading States**: Skeleton loaders for all cards and charts on initial load; shimmer for individual sections during refresh
- **Empty States**: No issues = "All Clear" with checkmark icon; No audit entries = "No records for selected filters"

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── governance/
│       ├── page.tsx                              # GovernanceDashboardPage (server component)
│       ├── loading.tsx                           # Skeleton fallback
│       ├── error.tsx                             # Error boundary
│       ├── layout.tsx                            # Governance section layout
│       ├── issues/
│       │   ├── page.tsx                          # All issues list page
│       │   └── [issueId]/
│       │       └── page.tsx                      # Issue detail page
│       ├── audit-log/
│       │   └── page.tsx                          # Full audit log page
│       ├── benchmarks/
│       │   └── page.tsx                          # Benchmark configuration page
│       ├── _components/
│       │   ├── GovernancePageHeader.tsx           # Page header with refresh
│       │   ├── GovernanceRefreshButton.tsx        # Manual refresh trigger
│       │   ├── OverallQualityScoreHero.tsx        # Overall score display
│       │   ├── QualityScoreGauge.tsx              # Circular/semi-circular gauge
│       │   ├── PipelineStageScoreStrip.tsx        # Stage score cards row
│       │   ├── StageScoreCard.tsx                 # Individual stage score card
│       │   ├── StageScoreBar.tsx                  # Progress bar for score
│       │   ├── PipelineFlowDiagram.tsx            # Visual pipeline flow
│       │   ├── PipelineStageNode.tsx              # Individual stage node
│       │   ├── PipelineFlowArrow.tsx              # Connection arrow between stages
│       │   ├── ModuleQualityPanel.tsx             # Module quality breakdown panel
│       │   ├── ModuleQualityRow.tsx               # Individual module row
│       │   ├── QualityScoreBar.tsx                # Horizontal quality bar
│       │   ├── QualityDimensionBreakdown.tsx      # Expandable dimension scores
│       │   ├── DimensionScoreCard.tsx             # Single dimension (completeness, etc.)
│       │   ├── ActiveIssuesPanel.tsx              # Active issues list panel
│       │   ├── DataQualityIssueCard.tsx           # Individual issue card
│       │   ├── IssueLayerBadge.tsx                # Pipeline layer badge
│       │   ├── IssueDetailDrawer.tsx              # Issue detail slide-out drawer
│       │   ├── IssueRootCauseAnalysis.tsx         # Claude-generated root cause
│       │   ├── IssueRemediationSuggestions.tsx    # AI-suggested fixes
│       │   ├── QualityTrendChart.tsx              # Quality trend over time
│       │   ├── TrendChartControls.tsx             # Period selector and layer toggles
│       │   ├── GovernanceAuditLogTable.tsx         # Audit log table
│       │   ├── AuditLogFilterBar.tsx              # Audit log filters
│       │   ├── AuditLogRow.tsx                    # Individual audit entry row
│       │   ├── ResultBadge.tsx                    # PASS/FAIL/WARN badge
│       │   ├── ExportAuditLogButton.tsx           # CSV export button
│       │   ├── BenchmarkConfigPanel.tsx           # Benchmark configuration
│       │   ├── BenchmarkConfigRow.tsx             # Individual benchmark row
│       │   └── SaveBenchmarksButton.tsx           # Save benchmark changes
│       ├── _hooks/
│       │   ├── useQualityScores.ts                # Fetch and manage quality scores
│       │   ├── useQualityTrends.ts                # Fetch quality trend data
│       │   ├── useDataQualityIssues.ts            # Fetch and manage active issues
│       │   ├── useAuditLog.ts                     # Fetch paginated audit log
│       │   ├── useBenchmarkConfig.ts              # CRUD for benchmark thresholds
│       │   ├── useGovernanceRefresh.ts            # Trigger quality reassessment
│       │   └── usePipelineStageFilter.ts          # Pipeline stage filtering state
│       └── _utils/
│           ├── governance-types.ts                # TypeScript type definitions
│           ├── quality-score-colors.ts            # Score-to-color mapping utilities
│           ├── audit-log-formatters.ts            # Audit log display formatters
│           └── benchmark-validators.ts            # Benchmark input validation
├── api/
│   └── v1/
│       └── governance/
│           ├── route.ts                           # GET overall quality scores
│           ├── scores/
│           │   ├── route.ts                       # GET detailed scores by module/stage
│           │   └── [module]/
│           │       └── route.ts                   # GET module-specific quality detail
│           ├── issues/
│           │   ├── route.ts                       # GET active quality issues
│           │   └── [issueId]/
│           │       └── route.ts                   # GET/PATCH issue detail
│           ├── trends/
│           │   └── route.ts                       # GET quality trend data
│           ├── audit-log/
│           │   ├── route.ts                       # GET paginated audit log
│           │   └── export/
│           │       └── route.ts                   # GET export audit log as CSV
│           ├── benchmarks/
│           │   └── route.ts                       # GET/PUT benchmark config
│           └── refresh/
│               └── route.ts                       # POST trigger quality reassessment
lib/
├── governance/
│   ├── quality-assessor.ts                        # Core quality assessment engine
│   ├── governance-types.ts                        # Shared type definitions
│   ├── quality-rules/
│   │   ├── completeness-rules.ts                  # NULL checks, required fields
│   │   ├── accuracy-rules.ts                      # Range checks, format validation
│   │   ├── consistency-rules.ts                   # Cross-field, cross-module consistency
│   │   ├── timeliness-rules.ts                    # Data freshness, update frequency
│   │   └── custom-rules.ts                        # Configurable custom rules
│   ├── quality-scorer.ts                          # Score calculation engine
│   ├── issue-classifier.ts                        # Claude-powered issue classification
│   ├── audit-logger.ts                            # Governance audit log writer
│   └── benchmark-manager.ts                       # Benchmark threshold management
```

### State Management Architecture
```typescript
// ===== Global State (Zustand Store) =====

interface GovernanceGlobalState {
  overallScore: number;
  stageScores: PipelineStageScores;
  moduleScores: ModuleQualityScore[];
  activeIssueCount: number;
  selectedStage: PipelineStage | null;
  lastRefreshedAt: string;
  isRefreshing: boolean;
}

// ===== Pipeline Stage Definitions =====

type PipelineStage = 'raw' | 'processing' | 'action' | 'simulation';

interface PipelineStageScores {
  raw: StageScore;
  processing: StageScore;
  action: StageScore;
  simulation: StageScore;
}

interface StageScore {
  stage: PipelineStage;
  score: number;                             // 0-100
  issueCount: number;
  recordsProcessed: number;
  recordsFailed: number;
  lastAssessedAt: string;
}

// ===== Module Quality Scores =====

interface ModuleQualityScore {
  module: GovernanceModule;
  overallScore: number;                      // 0-100
  dimensions: QualityDimensions;
  stageBreakdown: Record<PipelineStage, number>;  // score per stage
  issueCount: number;
  trend: 'improving' | 'stable' | 'degrading';
  trendPercentage: number;                   // change from previous assessment
}

type GovernanceModule =
  | 'staffing'
  | 'bed-allocation'
  | 'supply-chain'
  | 'finance'
  | 'anomaly-detection';

interface QualityDimensions {
  completeness: DimensionScore;
  accuracy: DimensionScore;
  consistency: DimensionScore;
  timeliness: DimensionScore;
}

interface DimensionScore {
  score: number;                             // 0-100
  issueCount: number;
  details: string;                           // description of assessment
  rulesEvaluated: number;
  rulesPassed: number;
}

// ===== Data Quality Issues =====

interface DataQualityIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  module: GovernanceModule;
  pipelineStage: PipelineStage;
  dimension: QualityDimension;
  affectedRecordCount: number;
  sampleRecords: AffectedRecord[];           // up to 5 sample records
  detectedAt: string;
  detectedBy: 'automated' | 'manual';
  rootCauseAnalysis: RootCauseAnalysis | null;
  remediationSuggestions: string[];
  assignedTo: string | null;
  resolvedAt: string | null;
}

type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

type IssueStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'suppressed';

type QualityDimension = 'completeness' | 'accuracy' | 'consistency' | 'timeliness';

interface AffectedRecord {
  recordId: string;
  table: string;
  field: string;
  expectedValue: string;
  actualValue: string;
  issue: string;                             // short issue description
}

interface RootCauseAnalysis {
  hypothesis: string;                        // Claude-generated root cause hypothesis
  confidence: number;                        // 0-1
  contributingFactors: string[];
  suggestedInvestigation: string;
}

// ===== Governance Audit Log =====

interface GovernanceAuditEntry {
  id: string;
  timestamp: string;
  pipelineStage: PipelineStage;
  module: GovernanceModule;
  checkName: string;                         // e.g., "Schema Validation", "NULL Check"
  checkCategory: QualityDimension;
  result: AuditResult;
  recordsEvaluated: number;
  recordsPassed: number;
  recordsFailed: number;
  actor: AuditActor;
  details: string;
  duration_ms: number;                       // check execution time
  checkHash: string;                         // tamper-evident hash
}

type AuditResult = 'pass' | 'fail' | 'warn' | 'skip';

interface AuditActor {
  type: 'automated' | 'manual' | 'system';
  id: string;
  name: string;
}

// ===== Quality Benchmarks =====

interface QualityBenchmark {
  id: string;
  module: GovernanceModule;
  dimension: QualityDimension | 'overall';
  minimumScore: number;                      // below this = critical
  alertThreshold: number;                    // below this = warning
  currentScore: number;
  status: BenchmarkStatus;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

type BenchmarkStatus = 'ok' | 'warning' | 'critical';

// ===== Quality Trend Data =====

interface QualityTrendDataPoint {
  date: string;                              // ISO date
  overallScore: number;
  raw: number;
  processing: number;
  action: number;
  simulation: number;
}

// ===== Issue Resolution =====

interface IssueResolution {
  issueId: string;
  resolvedBy: string;
  resolvedAt: string;
  resolution: string;
  preventionMeasure: string;
  rootCauseConfirmed: boolean;
}
```

### API Integration Schema
```typescript
// ===== GET /api/v1/governance =====
// Get overall quality dashboard summary

interface GetGovernanceSummaryResponse {
  data: {
    overallScore: number;
    stageScores: PipelineStageScores;
    moduleScores: ModuleQualityScore[];
    activeIssueCount: number;
    lastAssessedAt: string;
    nextAssessmentAt: string;
  };
}

// ===== GET /api/v1/governance/scores =====
// Get detailed scores with optional filtering

interface GetQualityScoresRequest {
  modules?: GovernanceModule[];
  stages?: PipelineStage[];
  dimensions?: QualityDimension[];
}

interface GetQualityScoresResponse {
  data: {
    moduleScores: ModuleQualityScore[];
    stageScores: PipelineStageScores;
  };
}

// ===== GET /api/v1/governance/scores/:module =====
// Get module-specific quality detail

interface GetModuleQualityResponse {
  data: ModuleQualityScore;
  issuesByDimension: Record<QualityDimension, DataQualityIssue[]>;
  stageDetails: Record<PipelineStage, {
    score: number;
    checks: GovernanceAuditEntry[];
  }>;
}

// ===== GET /api/v1/governance/issues =====
// List active data quality issues

interface GetQualityIssuesRequest {
  modules?: GovernanceModule[];
  stages?: PipelineStage[];
  severities?: IssueSeverity[];
  statuses?: IssueStatus[];
  dimensions?: QualityDimension[];
  sortBy?: 'severity' | 'detectedAt' | 'affectedRecordCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface GetQualityIssuesResponse {
  data: DataQualityIssue[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
  };
}

// ===== GET /api/v1/governance/issues/:issueId =====
// Get issue detail with root cause analysis

interface GetIssueDetailResponse {
  data: DataQualityIssue;
  relatedIssues: DataQualityIssue[];
  auditTrail: GovernanceAuditEntry[];
}

// ===== PATCH /api/v1/governance/issues/:issueId =====
// Update issue status

interface UpdateIssueRequest {
  status?: IssueStatus;
  assignedTo?: string;
  resolution?: string;
  preventionMeasure?: string;
}

interface UpdateIssueResponse {
  success: boolean;
  data: DataQualityIssue;
}

// ===== GET /api/v1/governance/trends =====
// Get quality trend data

interface GetQualityTrendsRequest {
  period: '7d' | '30d' | '90d' | '1y';
  granularity: 'hourly' | 'daily' | 'weekly';
  modules?: GovernanceModule[];
}

interface GetQualityTrendsResponse {
  data: QualityTrendDataPoint[];
  period: string;
  granularity: string;
}

// ===== GET /api/v1/governance/audit-log =====
// Get paginated audit log

interface GetAuditLogRequest {
  stages?: PipelineStage[];
  modules?: GovernanceModule[];
  results?: AuditResult[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;                         // default: 50, max: 200
}

interface GetAuditLogResponse {
  data: GovernanceAuditEntry[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
  };
}

// ===== GET /api/v1/governance/audit-log/export =====
// Export audit log as CSV

interface ExportAuditLogRequest {
  stages?: PipelineStage[];
  modules?: GovernanceModule[];
  results?: AuditResult[];
  dateFrom?: string;
  dateTo?: string;
}

interface ExportAuditLogResponse {
  downloadUrl: string;
  expiresAt: string;
  recordCount: number;
}

// ===== GET /api/v1/governance/benchmarks =====
// Get benchmark configuration

interface GetBenchmarksResponse {
  data: QualityBenchmark[];
}

// ===== PUT /api/v1/governance/benchmarks =====
// Update benchmark thresholds

interface UpdateBenchmarksRequest {
  benchmarks: {
    module: GovernanceModule;
    dimension: QualityDimension | 'overall';
    minimumScore: number;
    alertThreshold: number;
  }[];
}

interface UpdateBenchmarksResponse {
  success: boolean;
  data: QualityBenchmark[];
  triggeredAlerts: {
    module: GovernanceModule;
    currentScore: number;
    newThreshold: number;
    status: BenchmarkStatus;
  }[];
}

// ===== POST /api/v1/governance/refresh =====
// Trigger manual quality reassessment

interface RefreshGovernanceResponse {
  success: boolean;
  jobId: string;
  estimatedDurationMs: number;
  message: string;
}
```

## Implementation Requirements

### Core Components

| Component | Description | Props |
|---|---|---|
| `GovernanceDashboardPage` | Server component; fetches initial quality scores and issues | None (server) |
| `OverallQualityScoreHero` | Hero section with overall score gauge and stage score strip | `overallScore: number, stageScores: PipelineStageScores` |
| `QualityScoreGauge` | Circular/arc gauge with animated score display | `score: number, size: 'sm' \| 'md' \| 'lg'` |
| `StageScoreCard` | Individual pipeline stage score with bar and issue count | `stage: StageScore, isActive: boolean, onClick: () => void` |
| `PipelineFlowDiagram` | Visual pipeline flow with connected stage nodes | `stages: PipelineStageScores, activeStage: PipelineStage \| null, onStageClick: (stage) => void` |
| `PipelineStageNode` | Individual node in pipeline flow | `stage: StageScore, isActive: boolean` |
| `ModuleQualityPanel` | Module quality breakdown with expandable rows | `modules: ModuleQualityScore[]` |
| `ModuleQualityRow` | Individual module row with score bar and expand toggle | `module: ModuleQualityScore, isExpanded: boolean, onToggle: () => void` |
| `QualityDimensionBreakdown` | Expandable dimension scores grid | `dimensions: QualityDimensions` |
| `DimensionScoreCard` | Individual dimension score (completeness, accuracy, etc.) | `dimension: string, score: DimensionScore` |
| `ActiveIssuesPanel` | Active issues list with sorting | `issues: DataQualityIssue[], onSelect: (id) => void` |
| `DataQualityIssueCard` | Individual issue card with severity, layer, module badges | `issue: DataQualityIssue, onClick: () => void` |
| `IssueLayerBadge` | Pipeline layer badge (RAW, PROCESSING, ACTION, SIMULATION) | `stage: PipelineStage` |
| `IssueDetailDrawer` | Slide-out drawer with full issue detail | `issue: DataQualityIssue, onClose: () => void` |
| `IssueRootCauseAnalysis` | Claude-generated root cause display | `analysis: RootCauseAnalysis` |
| `IssueRemediationSuggestions` | AI-suggested remediation steps | `suggestions: string[]` |
| `QualityTrendChart` | Recharts line chart for quality trends | `data: QualityTrendDataPoint[], period: string` |
| `GovernanceAuditLogTable` | Paginated audit log table with filters | `entries: GovernanceAuditEntry[], pagination: Pagination` |
| `AuditLogRow` | Individual audit log entry row | `entry: GovernanceAuditEntry` |
| `ResultBadge` | Color-coded PASS/FAIL/WARN/SKIP badge | `result: AuditResult` |
| `BenchmarkConfigPanel` | Collapsible benchmark configuration | `benchmarks: QualityBenchmark[], onSave: (benchmarks) => void` |
| `BenchmarkConfigRow` | Individual benchmark row with editable inputs | `benchmark: QualityBenchmark, isEditing: boolean, onChange: (values) => void` |

### Custom Hooks

| Hook | Purpose | Return Type |
|---|---|---|
| `useQualityScores` | Fetch and manage overall and module quality scores | `{ overallScore, stageScores, moduleScores, isLoading, refresh }` |
| `useQualityTrends` | Fetch quality trend data for charting | `{ trendData, period, setPeriod, isLoading }` |
| `useDataQualityIssues` | Paginated active issue management with filters | `{ issues, pagination, filters, setFilters, resolveIssue }` |
| `useAuditLog` | Paginated audit log with filtering | `{ entries, pagination, filters, setFilters, exportCsv }` |
| `useBenchmarkConfig` | CRUD for benchmark thresholds | `{ benchmarks, update, save, isEditing, setEditing, isDirty }` |
| `useGovernanceRefresh` | Trigger and track quality reassessment | `{ refresh, isRefreshing, lastRefreshed, estimatedTime }` |
| `usePipelineStageFilter` | Pipeline stage selection state for cross-component filtering | `{ selectedStage, setStage, clearStage }` |

### Utility Functions

| Function | Purpose | Signature |
|---|---|---|
| `getQualityScoreColor` | Map quality score to Kairos color | `(score: number) => string` |
| `getQualityScoreLabel` | Map quality score to human-readable label | `(score: number) => 'Excellent' \| 'Good' \| 'Warning' \| 'Critical'` |
| `getBenchmarkStatus` | Determine benchmark status from score and thresholds | `(score: number, min: number, alert: number) => BenchmarkStatus` |
| `formatAuditTimestamp` | Format audit log timestamp for display | `(isoDate: string) => string` |
| `calculateOverallScore` | Weighted average of stage scores | `(stages: PipelineStageScores, weights?: StageWeights) => number` |
| `formatPipelineStageName` | Display name for pipeline stage | `(stage: PipelineStage) => string` |
| `formatDimensionName` | Display name for quality dimension | `(dimension: QualityDimension) => string` |
| `exportAuditLogToCsv` | Convert audit entries to CSV string | `(entries: GovernanceAuditEntry[]) => string` |
| `computeQualityTrend` | Calculate trend direction from data points | `(dataPoints: QualityTrendDataPoint[]) => 'improving' \| 'stable' \| 'degrading'` |
| `validateBenchmarkInputs` | Validate benchmark threshold inputs | `(min: number, alert: number) => ValidationResult` |

## Acceptance Criteria

### Functional Requirements
- [ ] Dashboard displays overall data quality score aggregated across all pipeline stages
- [ ] Individual quality scores shown for each pipeline stage: raw ingestion, processing, actionable output, simulation
- [ ] Pipeline flow diagram visualizes data flow from raw -> processing -> action -> simulation with score at each stage
- [ ] Clicking a pipeline stage filters all dashboard content to that stage
- [ ] Module quality breakdown shows per-module scores for staffing, bed allocation, supply chain, finance, anomaly detection
- [ ] Module rows expand to show quality dimension breakdown: completeness, accuracy, consistency, timeliness
- [ ] Active issues panel lists open data quality issues with severity, pipeline stage, affected module, and record count
- [ ] Each issue can be clicked to view full detail including Claude-generated root cause hypothesis and remediation suggestions
- [ ] Issues traceable to their origin layer (raw, processing, action, or simulation)
- [ ] Quality benchmarks configurable per module with minimum score and alert threshold
- [ ] System flags modules whose quality falls below configured thresholds
- [ ] Quality trend chart shows historical quality scores over 7d/30d/90d/1y with per-stage lines
- [ ] Governance audit log records every quality check with timestamp, pipeline stage, check name, result, and actor
- [ ] Audit log filterable by pipeline stage, result type, and date range
- [ ] Audit log exportable as CSV
- [ ] Audit log entries include tamper-evident hash chaining for integrity
- [ ] Manual refresh button triggers quality reassessment job with progress indicator
- [ ] Auto-refresh quality scores every 5 minutes while dashboard is open

### Non-Functional Requirements
- [ ] Dashboard page loads in under 2.5 seconds (LCP) with full quality data
- [ ] Quality assessment job completes within 5 minutes for full pipeline scan
- [ ] Audit log queries return within 300ms for up to 1M records with proper indexing
- [ ] CSV export generates within 10 seconds for up to 100K audit entries
- [ ] Benchmark changes take effect within 30 seconds, triggering alerts if new thresholds are violated
- [ ] Quality score calculation deterministic: same data produces same scores on repeated assessment
- [ ] Audit log supports 7 years of retention without query performance degradation (partitioned by month)
- [ ] All governance dashboard components meet WCAG 2.1 AA accessibility standards
- [ ] Score gauge and trend chart render smoothly at 60fps on standard hardware

## Modified Files
```
app/
├── (dashboard)/
│   └── governance/
│       ├── page.tsx                              [+] NEW - Governance dashboard
│       ├── loading.tsx                           [+] NEW - Skeleton loader
│       ├── error.tsx                             [+] NEW - Error boundary
│       ├── layout.tsx                            [+] NEW - Section layout
│       ├── issues/page.tsx                       [+] NEW - All issues page
│       ├── issues/[issueId]/page.tsx             [+] NEW - Issue detail
│       ├── audit-log/page.tsx                    [+] NEW - Full audit log
│       ├── benchmarks/page.tsx                   [+] NEW - Benchmark config
│       └── _components/
│           ├── GovernancePageHeader.tsx           [+] NEW
│           ├── GovernanceRefreshButton.tsx        [+] NEW
│           ├── OverallQualityScoreHero.tsx        [+] NEW
│           ├── QualityScoreGauge.tsx              [+] NEW
│           ├── PipelineStageScoreStrip.tsx        [+] NEW
│           ├── StageScoreCard.tsx                 [+] NEW
│           ├── StageScoreBar.tsx                  [+] NEW
│           ├── PipelineFlowDiagram.tsx            [+] NEW
│           ├── PipelineStageNode.tsx              [+] NEW
│           ├── PipelineFlowArrow.tsx              [+] NEW
│           ├── ModuleQualityPanel.tsx             [+] NEW
│           ├── ModuleQualityRow.tsx               [+] NEW
│           ├── QualityScoreBar.tsx                [+] NEW
│           ├── QualityDimensionBreakdown.tsx      [+] NEW
│           ├── DimensionScoreCard.tsx             [+] NEW
│           ├── ActiveIssuesPanel.tsx              [+] NEW
│           ├── DataQualityIssueCard.tsx           [+] NEW
│           ├── IssueLayerBadge.tsx                [+] NEW
│           ├── IssueDetailDrawer.tsx              [+] NEW
│           ├── IssueRootCauseAnalysis.tsx         [+] NEW
│           ├── IssueRemediationSuggestions.tsx    [+] NEW
│           ├── QualityTrendChart.tsx              [+] NEW
│           ├── TrendChartControls.tsx             [+] NEW
│           ├── GovernanceAuditLogTable.tsx        [+] NEW
│           ├── AuditLogFilterBar.tsx              [+] NEW
│           ├── AuditLogRow.tsx                    [+] NEW
│           ├── ResultBadge.tsx                    [+] NEW
│           ├── ExportAuditLogButton.tsx           [+] NEW
│           ├── BenchmarkConfigPanel.tsx           [+] NEW
│           ├── BenchmarkConfigRow.tsx             [+] NEW
│           └── SaveBenchmarksButton.tsx           [+] NEW
├── api/v1/governance/
│   ├── route.ts                                  [+] NEW - Summary endpoint
│   ├── scores/route.ts                           [+] NEW - Detailed scores
│   ├── scores/[module]/route.ts                  [+] NEW - Module scores
│   ├── issues/route.ts                           [+] NEW - Issues list
│   ├── issues/[issueId]/route.ts                 [+] NEW - Issue detail/update
│   ├── trends/route.ts                           [+] NEW - Trend data
│   ├── audit-log/route.ts                        [+] NEW - Audit log
│   ├── audit-log/export/route.ts                 [+] NEW - CSV export
│   ├── benchmarks/route.ts                       [+] NEW - Benchmark CRUD
│   └── refresh/route.ts                          [+] NEW - Trigger reassessment
lib/
├── governance/
│   ├── quality-assessor.ts                       [+] NEW - Assessment engine
│   ├── governance-types.ts                       [+] NEW - Type definitions
│   ├── quality-rules/
│   │   ├── completeness-rules.ts                 [+] NEW
│   │   ├── accuracy-rules.ts                     [+] NEW
│   │   ├── consistency-rules.ts                  [+] NEW
│   │   ├── timeliness-rules.ts                   [+] NEW
│   │   └── custom-rules.ts                       [+] NEW
│   ├── quality-scorer.ts                         [+] NEW - Score calculator
│   ├── issue-classifier.ts                       [+] NEW - Claude classifier
│   ├── audit-logger.ts                           [+] NEW - Audit log writer
│   └── benchmark-manager.ts                      [+] NEW - Benchmark logic
├── db/schema/
│   ├── quality-scores.ts                         [+] NEW - Quality score table
│   ├── quality-issues.ts                         [+] NEW - Issues table
│   ├── governance-audit-log.ts                   [+] NEW - Audit log table
│   └── quality-benchmarks.ts                     [+] NEW - Benchmarks table
```

## Implementation Status
**OVERALL STATUS**: :white_large_square: NOT STARTED

### Phase 1: Quality Assessment Engine (Week 1-3)
| Task | Status |
|---|---|
| Define database schemas for quality scores, issues, audit log, benchmarks | :white_large_square: Not Started |
| Implement `governance-types.ts` TypeScript definitions | :white_large_square: Not Started |
| Build `completeness-rules.ts` (NULL checks, required fields, record counts) | :white_large_square: Not Started |
| Build `accuracy-rules.ts` (range validation, format checks, DOB < admission date) | :white_large_square: Not Started |
| Build `consistency-rules.ts` (cross-field consistency, cross-module references) | :white_large_square: Not Started |
| Build `timeliness-rules.ts` (data freshness, update frequency, stale data detection) | :white_large_square: Not Started |
| Implement `quality-scorer.ts` score calculation with weighted dimension aggregation | :white_large_square: Not Started |
| Build `quality-assessor.ts` orchestrator that runs all rules per module per stage | :white_large_square: Not Started |
| Implement `audit-logger.ts` with hash-chained append-only logging | :white_large_square: Not Started |

### Phase 2: API Layer & Issue Classification (Week 4-5)
| Task | Status |
|---|---|
| Implement `GET /api/v1/governance` summary endpoint | :white_large_square: Not Started |
| Implement `GET /api/v1/governance/scores` detailed scores endpoint | :white_large_square: Not Started |
| Implement `GET /api/v1/governance/issues` with pagination and filtering | :white_large_square: Not Started |
| Implement `GET/PATCH /api/v1/governance/issues/:issueId` detail and update | :white_large_square: Not Started |
| Implement `GET /api/v1/governance/audit-log` with pagination and filtering | :white_large_square: Not Started |
| Implement `GET/PUT /api/v1/governance/benchmarks` CRUD endpoint | :white_large_square: Not Started |
| Build `issue-classifier.ts` Claude-powered root cause analysis and remediation suggestions | :white_large_square: Not Started |
| Implement `POST /api/v1/governance/refresh` manual reassessment trigger | :white_large_square: Not Started |
| Set up BullMQ `quality-assessment-queue` for scheduled and on-demand assessments | :white_large_square: Not Started |

### Phase 3: Dashboard Frontend (Week 6-8)
| Task | Status |
|---|---|
| Build `GovernanceDashboardPage` server component with RSC data fetching | :white_large_square: Not Started |
| Implement `OverallQualityScoreHero` with `QualityScoreGauge` and `PipelineStageScoreStrip` | :white_large_square: Not Started |
| Build `PipelineFlowDiagram` with interactive `PipelineStageNode` components | :white_large_square: Not Started |
| Implement `ModuleQualityPanel` with expandable `ModuleQualityRow` and `QualityDimensionBreakdown` | :white_large_square: Not Started |
| Build `ActiveIssuesPanel` with `DataQualityIssueCard` and `IssueDetailDrawer` | :white_large_square: Not Started |
| Implement `IssueRootCauseAnalysis` and `IssueRemediationSuggestions` components | :white_large_square: Not Started |
| Build `QualityTrendChart` with Recharts and `TrendChartControls` | :white_large_square: Not Started |
| Implement `GovernanceAuditLogTable` with `AuditLogFilterBar` and pagination | :white_large_square: Not Started |
| Build `BenchmarkConfigPanel` with editable threshold inputs and save functionality | :white_large_square: Not Started |

### Phase 4: Integration, Export & Polish (Week 9-10)
| Task | Status |
|---|---|
| Implement audit log CSV export endpoint and `ExportAuditLogButton` | :white_large_square: Not Started |
| Build `GovernanceRefreshButton` with progress tracking | :white_large_square: Not Started |
| Implement auto-refresh (5-minute polling) with `useGovernanceRefresh` | :white_large_square: Not Started |
| Integrate with Anomaly Detection module (Story 05) for bidirectional data quality signals | :white_large_square: Not Started |
| Implement `usePipelineStageFilter` for cross-component pipeline stage filtering | :white_large_square: Not Started |
| Responsive design implementation across all breakpoints | :white_large_square: Not Started |
| Performance optimization (memoized scores, lazy-loaded charts, paginated audit log) | :white_large_square: Not Started |
| End-to-end testing with realistic quality scenarios across all modules and stages | :white_large_square: Not Started |
| Accessibility audit and remediation | :white_large_square: Not Started |

## Dependencies
| Dependency | Type | Status | Notes |
|---|---|---|---|
| Staffing Module Data Pipeline (Story 01) | Data Source | Required | Quality checkpoints in staffing data processing |
| Bed Allocation Data Pipeline (Story 02) | Data Source | Required | Quality checkpoints in bed allocation processing |
| Supply Chain Data Pipeline (Story 03) | Data Source | Required | Quality checkpoints in supply chain processing |
| Finance Data Pipeline (Story 04) | Data Source | Required | Quality checkpoints in finance processing |
| Anomaly Detection (Story 05) | Integration | Required | Bidirectional data quality anomaly signal sharing |
| Simulation Engine (Story 06) | Data Source | Recommended | Quality checkpoints in simulation input/output |
| Claude API Access | External Service | Required | Root cause analysis, remediation suggestions, quality rule generation |
| BullMQ / Redis | Infrastructure | Required | Scheduled quality assessment jobs and caching |
| Recharts Library | NPM Package | Required | Quality trend chart and gauge visualization |
| PostgreSQL Partitioning | Infrastructure | Required | Audit log table partitioned by month for 7-year retention |

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Quality Score Gaming**: Teams manipulate data to improve quality scores without fixing underlying issues | Medium | High | Multiple quality dimensions (not just one metric), random sample verification, include completeness/timeliness dimensions that resist gaming |
| **Assessment Performance**: Full pipeline quality scan takes too long for real-time dashboard | Medium | Medium | Incremental assessment (only assess changed data since last run), cached aggregate scores, background BullMQ processing |
| **Rule Maintenance Burden**: Large number of quality rules becomes difficult to maintain and tune | High | Medium | Claude-assisted rule suggestion, rule effectiveness tracking (remove rules with 0% failure rate after 90 days), rule categorization and search |
| **Audit Log Volume**: High-throughput data pipelines generate enormous audit log volumes | High | Medium | PostgreSQL table partitioning by month, log aggregation for bulk operations, configurable log verbosity (detailed/summary), automatic archival to S3 |
| **False Issue Alerts**: Quality rules generate too many low-priority issues causing alert fatigue | Medium | High | Issue severity classification via Claude, configurable benchmarks per module, suppression mechanism for known acceptable deviations |
| **Hash Chain Corruption**: Single corrupted audit entry invalidates chain integrity | Low | High | Daily hash chain verification job, chain segment isolation (new chain per day), alerting on verification failure |

## Testing Strategy
- **Unit Tests**: Quality rule evaluation with known pass/fail inputs for all four dimensions (completeness, accuracy, consistency, timeliness); score calculation with weighted aggregation; benchmark status determination; hash chain generation and verification; CSV export formatting
- **Integration Tests**: Full quality assessment cycle: ingest bad data -> rules detect issues -> scores updated -> issues created -> audit logged; benchmark threshold change triggers alert for currently-violating modules; Claude root cause analysis integration with sample quality issues; audit log hash chain integrity across inserts
- **Component Tests**: `QualityScoreGauge` renders correct arc and color for various scores; `PipelineFlowDiagram` highlights active stage on click; `ModuleQualityRow` expands to show dimension breakdown; `DataQualityIssueCard` shows correct severity and layer badges; `BenchmarkConfigRow` validates min < alert < 100; `ResultBadge` renders correct color for each result type
- **End-to-End Tests**: Full flow: data ingested with quality issues -> dashboard reflects updated scores -> issue appears in active list -> click issue detail -> view root cause -> mark resolved; Benchmark flow: configure thresholds -> scores violate -> warning status appears; Audit flow: filter audit log -> export CSV -> verify CSV content matches displayed data
- **Performance Tests**: Quality assessment execution time with 100K records per module; audit log query performance with 1M+ entries; dashboard render time with 50 modules and 200 active issues; CSV export generation time with 100K entries
- **Security Tests**: Audit log immutability (attempt UPDATE/DELETE operations); hash chain tamper detection; RBAC enforcement (module manager cannot see other modules' governance data)

## Performance Considerations
- **Incremental Quality Assessment**: Only assess records changed since last assessment (track via `updated_at` timestamps) instead of full table scans
- **Cached Aggregate Scores**: Store pre-computed module and stage scores in Redis (5-minute TTL), refresh on assessment completion
- **Audit Log Partitioning**: PostgreSQL table partitioned by month (`governance_audit_log_2025_03`, etc.) for efficient range queries and data lifecycle management
- **Lazy-Loaded Sections**: Audit log table and benchmark config loaded via `next/dynamic` below the fold; trend chart loaded on intersection observer trigger
- **Memoized Quality Calculations**: `useMemo` on score derivations and color mappings to prevent recalculation on unrelated state changes
- **Paginated Audit Log**: Default 50 entries per page with cursor-based pagination for consistent performance
- **Database Indexing**: Composite indexes on `quality_issues(module, status, severity)`, `governance_audit_log(pipeline_stage, result, timestamp)`, `quality_benchmarks(module, dimension)`
- **Background Assessment**: Quality assessments run as BullMQ background jobs; dashboard shows cached results during assessment
- **Virtualized Audit Log**: Use `@tanstack/react-virtual` for audit log rendering when displaying 200+ entries on full audit log page
- **Score Animation Debounce**: Score gauge animation runs once on mount with `useEffect` dependency guard to prevent re-animation on filter changes

## Deployment Plan
1. **Database Migration**: Deploy quality scores, issues, audit log (partitioned), and benchmarks table schemas
2. **Quality Rules Deployment**: Configure initial quality rules per module per dimension with conservative thresholds
3. **Assessment Worker**: Deploy BullMQ quality assessment worker with scheduled cron (every 5 minutes)
4. **Audit Logger**: Deploy audit log writer with hash chain initialization
5. **API Endpoints**: Deploy governance REST API endpoints behind authentication middleware
6. **Initial Assessment**: Run full quality assessment against all existing data to establish baseline scores
7. **Feature Flag**: Gate governance dashboard behind `FEATURE_DATA_GOVERNANCE` flag
8. **Benchmark Seeding**: Configure default benchmarks per module based on initial assessment (minimum = current - 10%, alert = current - 5%)
9. **Staging Validation**: Validate dashboard accuracy against known data quality issues in staging environment
10. **Production Rollout**: Enable for `data_administrator` role users; monitor assessment job completion and dashboard accuracy
11. **Post-Deploy Review**: Verify audit log integrity, assessment completion within 5 minutes, issue detection accuracy

## Monitoring & Analytics
- **Quality Assessment Duration**: Track P50/P95 assessment execution time (target: P95 <5 minutes)
- **Assessment Frequency**: Monitor scheduled assessment job execution (target: every 5 minutes with zero missed runs)
- **Overall Quality Score Trend**: Track daily average quality score (alert if drops >5% in 24 hours)
- **Issue Detection Rate**: Track new issues detected per assessment cycle (baseline after first month)
- **Issue Resolution Time**: Track average time from issue detection to resolution (target: <24 hours for critical, <72 hours for high)
- **Early Detection Rate**: Track percentage of issues detected at raw/processing stage vs. action/simulation stage (target: >80% at raw/processing)
- **Audit Log Volume**: Track daily audit log entry count (capacity planning)
- **Hash Chain Integrity**: Daily verification job with alert on chain break
- **Benchmark Violation Rate**: Track percentage of modules in warning or critical benchmark status
- **Dashboard Load Time**: Track P95 governance dashboard LCP (target: <2.5s)
- **User Engagement**: Track dashboard views per day, filter usage, issue detail views, benchmark configuration changes
- **Claude API Usage**: Track Claude API calls for issue classification and root cause analysis (cost monitoring)

## Documentation Requirements
- **Quality Rule Reference**: Comprehensive catalog of all quality rules by module and dimension with examples and configuration options
- **Governance Framework Guide**: Explanation of pipeline stages, quality dimensions, scoring methodology, and benchmark configuration
- **API Reference**: OpenAPI 3.0 spec for all governance endpoints including query parameters and response schemas
- **Data Administrator Guide**: How to interpret quality scores, triage issues, configure benchmarks, and use root cause analysis
- **Audit Log Compliance Guide**: How audit log meets healthcare data governance requirements, retention policies, export procedures
- **Custom Rule Authoring Guide**: How to create custom quality rules for hospital-specific validation needs
- **Troubleshooting Runbook**: Assessment job failures, hash chain integrity issues, score discrepancies, audit log volume management

## Post-Launch Review
- **Week 1 Review**: Validate quality scores against known data quality state; tune rules generating excessive false positives; verify audit log integrity
- **Week 2 Review**: Gather data administrator feedback on dashboard usability; assess root cause analysis quality from Claude; adjust benchmark defaults based on real-world baselines
- **Week 4 Review**: Analyze early detection rate; investigate any issues first detected at action/simulation stage to add rules at earlier stages; evaluate assessment performance at production data volumes
- **Month 2 Review**: Review issue resolution patterns; identify most common data quality problems per module; create targeted quality improvement initiatives; evaluate Claude root cause accuracy against confirmed root causes
- **Quarter 1 Review**: Full retrospective on data governance impact; quantify cost savings from early issue detection; plan enhancements (predictive quality scoring, automated remediation, compliance reporting)
