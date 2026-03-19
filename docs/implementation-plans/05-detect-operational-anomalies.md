# 05 Detect Operational Anomalies - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital administrator**, I want the system to **automatically detect anomalies in operational data across all modules**, so that I can **investigate and address issues before they escalate into larger problems**.

## Pre-conditions
- Data ingestion pipelines for staffing, bed allocation, supply chain, and finance modules are operational and streaming data to PostgreSQL/Neo4j
- Role-based access control (RBAC) is configured with an `administrator` role that has anomaly management permissions
- Redis pub/sub or BullMQ workers are deployed to handle real-time event processing
- Baseline operational data exists (minimum 30 days historical) for statistical anomaly detection thresholds
- Claude API integration is active for NLP-driven anomaly classification and context generation
- WebSocket or Server-Sent Events (SSE) infrastructure is available for real-time alert delivery

## Business Requirements
- **Reduce mean-time-to-detect (MTTD)** operational issues from manual discovery (~48 hrs) to automated detection (<15 minutes)
  - Success Metric: 90% of anomalies detected within 15 minutes of data ingestion
- **Decrease operational incident escalation rate** by catching issues in early stages
  - Success Metric: 40% reduction in P1 incidents within first quarter of deployment
- **Improve data quality** across all modules through automated validation
  - Success Metric: Data quality score maintained above 95% across all pipeline stages
- **Enable proactive decision-making** by surfacing anomalies before they cascade
  - Success Metric: 80% of detected anomalies acknowledged within 2 hours
- **Build institutional knowledge** through historical anomaly trend analysis
  - Success Metric: Pattern recognition identifies recurring anomalies with 85% accuracy

## Technical Specifications

### Integration Points
- **HL7 FHIR R4 / ADT Feeds**: Ingest patient admission, discharge, transfer events for detecting anomalies in patient flow data (e.g., DOB after admission date)
- **Staffing Module API** (`/api/v1/staffing`): Monitor shift scheduling, overtime hours, nurse-to-patient ratios for staffing anomalies
- **Bed Allocation Module API** (`/api/v1/beds`): Track bed occupancy rates, turnover intervals, ward capacity utilization
- **Supply Chain Module API** (`/api/v1/supply-chain`): Monitor inventory levels, reorder frequencies, supplier delivery variance
- **Finance Module API** (`/api/v1/finance`): Watch revenue per bed-day, cost-per-procedure variance, budget vs. actuals deviation
- **Neo4j Graph DB**: Store and query cross-module dependency graphs (e.g., staffing shortage -> bed closure -> revenue impact)
- **BullMQ Job Queues**: `anomaly-detection-queue`, `anomaly-notification-queue`, `anomaly-classification-queue`
- **Claude API**: Classify anomaly severity, generate human-readable context descriptions, identify potential root causes
- **Data Governance Module (Story 08)**: Share data quality anomaly signals bidirectionally

### Security Requirements
- **HIPAA-Adjacent Compliance**: All anomaly alert payloads containing patient-identifiable data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Data Encryption**: Anomaly context data stored in PostgreSQL with column-level encryption for sensitive fields (patient IDs, financial figures)
- **RBAC Enforcement**: Anomaly alerts filtered by user role; only administrators see cross-module anomalies, module managers see module-specific alerts
- **Audit Logging**: Every anomaly lifecycle event (created, acknowledged, investigated, dismissed, resolved) logged with actor ID, timestamp, and action metadata
- **Data Retention**: Anomaly records retained for 7 years per healthcare compliance; configurable per deployment region
- **Rate Limiting**: Anomaly notification endpoints rate-limited to prevent alert fatigue (max 50 notifications/hour per user)

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  HEADER: Medical Pro - Anomaly Detection Center                   |
+------------------------------------------------------------------+
|                                                                    |
|  +--STATS BAR------------------------------------------------+   |
|  | [Critical: 3]  [Warning: 12]  [Info: 24]  [Resolved: 156] |   |
|  +------------------------------------------------------------+   |
|                                                                    |
|  +--FILTER BAR------------------------------------------------+  |
|  | Module: [All v]  Severity: [All v]  Date: [Last 7d v]      |  |
|  | Status: [Active v]  Search: [________________]  [Filter]    |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  +--LEFT PANEL (60%)----------+  +--RIGHT PANEL (40%)---------+  |
|  |                             |  |                             |  |
|  |  ANOMALY FEED               |  |  ANOMALY DETAIL            |  |
|  |  +------------------------+ |  |                             |  |
|  |  | [!] CRITICAL           | |  |  Title: DOB After Admit    |  |
|  |  | DOB > Admission Date   | |  |  Module: Staffing          |  |
|  |  | Staffing - 2 min ago   | |  |  Detected: 2025-01-15      |  |
|  |  +------------------------+ |  |  Severity: CRITICAL         |  |
|  |  | [!] WARNING             | |  |                             |  |
|  |  | Overtime Spike +40%     | |  |  Context:                  |  |
|  |  | Finance - 15 min ago   | |  |  "Patient record P-4821    |  |
|  |  +------------------------+ |  |   has DOB 2025-03-01 but   |  |
|  |  | [i] INFO               | |  |   admission date 2024-12..."| |
|  |  | Bed turnover slowdown   | |  |                             |  |
|  |  | Beds - 1 hr ago        | |  |  Triggered By:              |  |
|  |  +------------------------+ |  |  - patient.dob > admit_date |  |
|  |                             |  |  - record_count: 3          |  |
|  |  [Load More...]             |  |                             |  |
|  |                             |  |  [Acknowledge] [Investigate]|  |
|  |                             |  |  [Dismiss]                  |  |
|  +-----------------------------+  +-----------------------------+  |
|                                                                    |
|  +--TREND CHART-----------------------------------------------+  |
|  |  Anomaly Frequency Over Time (30-day rolling)               |  |
|  |  ___/\___    /\/\___/\                                      |  |
|  |  Critical ---  Warning ---  Info ---                        |  |
|  +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
AnomalyDetectionPage
├── AnomalyPageHeader
│   └── BreadcrumbNav
├── AnomalyStatsBar
│   ├── AnomalyStatCard (critical)
│   ├── AnomalyStatCard (warning)
│   ├── AnomalyStatCard (informational)
│   └── AnomalyStatCard (resolved)
├── AnomalyFilterBar
│   ├── ModuleFilterDropdown
│   ├── SeverityFilterDropdown
│   ├── DateRangeSelector
│   ├── StatusFilterDropdown
│   └── AnomalySearchInput
├── AnomalyContentLayout
│   ├── AnomalyFeedPanel
│   │   ├── AnomalyFeedList
│   │   │   └── AnomalyFeedCard (repeating)
│   │   │       ├── SeverityBadge
│   │   │       ├── AnomalyTitle
│   │   │       ├── ModuleTag
│   │   │       └── TimeAgo
│   │   └── LoadMoreButton
│   └── AnomalyDetailPanel
│       ├── AnomalyDetailHeader
│       ├── AnomalyContextBlock
│       ├── AnomalyTriggeredByList
│       │   └── DataPointRow (repeating)
│       ├── AnomalyAffectedModules
│       ├── AnomalyRelatedAlerts
│       └── AnomalyActionBar
│           ├── AcknowledgeButton
│           ├── InvestigateButton
│           └── DismissButton
├── AnomalyTrendChart
│   ├── TrendChartControls
│   └── TrendChartCanvas
└── AnomalyHistoryDrawer
    ├── HistoryTimeline
    └── PatternRecognitionPanel
```

### Design System Compliance
- **Primary Background**: `ink` (#031926) for page background and side panels
- **Card Backgrounds**: `ink-light` (#0A2A3C) with 1px border `ink-border` (#1A3A4C)
- **Critical Severity**: `#DC2626` (red-600) badge background, `#FCA5A5` (red-300) text on dark
- **Warning Severity**: `gold` (#C9A84A) badge background, `#031926` text
- **Informational Severity**: `cerulean` (#00B3C6) badge background, `#031926` text
- **Resolved/Success**: `teal` (#007B7A) badge background, white text
- **Headings**: Merriweather, 600 weight, `cerulean` (#00B3C6) for section titles
- **Body Text**: Inter, 400 weight, `#E2E8F0` (slate-200) on dark backgrounds
- **Stat Cards**: Glassmorphism effect with `backdrop-blur-md bg-white/5` border `teal` opacity 30%
- **Action Buttons**: Primary `teal` (#007B7A), secondary `cerulean` (#00B3C6), destructive `red-600`
- **Charts**: Recharts with custom theme using `teal`, `gold`, `cerulean` palette

### Responsive Behavior
- **Desktop (xl: 1280px+)**: Full two-panel layout (60/40 split), stats bar in single row, trend chart full width
- **Large Tablet (lg: 1024px)**: Two-panel layout (55/45 split), stats bar wraps to 2x2 grid
- **Tablet (md: 768px)**: Single column layout, anomaly detail slides in as overlay drawer from right, stats bar 2x2 grid
- **Mobile (sm: 640px)**: Full-width stacked feed, detail as full-screen modal, stats bar as horizontal scroll, trend chart simplified to sparklines
- **Breakpoint Classes**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr]`

### Interaction Patterns
- **Alert Card Hover**: `transition-all duration-200` with `hover:bg-ink-light/80` and left border highlight matching severity color
- **Alert Card Selection**: Active card has `ring-2 ring-teal` with detail panel slide-in animation (`transition-transform duration-300`)
- **Severity Badge**: Pulsing animation on critical alerts (`animate-pulse`) for first 5 minutes after detection
- **Acknowledge Action**: Optimistic UI update (card moves to acknowledged state immediately), confirmation toast, rollback on API failure
- **Dismiss Action**: Confirmation dialog with reason input (required), dismiss reason stored in audit log
- **Investigate Action**: Opens investigation worksheet in detail panel with pre-populated context from Claude API analysis
- **Loading States**: Skeleton loaders for feed cards (`animate-pulse bg-ink-light rounded-lg h-24`), spinner for detail panel
- **Empty State**: Illustrated "All Clear" graphic with message "No active anomalies detected. System is operating within normal parameters."
- **Real-time Updates**: New anomalies slide in from top of feed with `animate-slideDown` and brief highlight flash
- **Filter Application**: Debounced (300ms) filter with `transition-opacity` on feed re-render
- **Form Validation**: Dismiss reason minimum 10 characters, investigation notes auto-save every 30 seconds

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── anomalies/
│       ├── page.tsx                          # AnomalyDetectionPage (server component)
│       ├── loading.tsx                       # Suspense fallback with skeleton
│       ├── error.tsx                         # Error boundary
│       ├── layout.tsx                        # Anomaly section layout
│       ├── _components/
│       │   ├── AnomalyPageHeader.tsx         # Page title + breadcrumb
│       │   ├── AnomalyStatsBar.tsx           # Summary stat cards
│       │   ├── AnomalyStatCard.tsx           # Individual stat card
│       │   ├── AnomalyFilterBar.tsx          # Filter controls
│       │   ├── AnomalyFeedPanel.tsx          # Left panel feed list
│       │   ├── AnomalyFeedCard.tsx           # Individual alert card
│       │   ├── AnomalyDetailPanel.tsx        # Right panel detail view
│       │   ├── AnomalyContextBlock.tsx       # AI-generated context display
│       │   ├── AnomalyActionBar.tsx          # Acknowledge/Investigate/Dismiss
│       │   ├── AnomalyTrendChart.tsx         # 30-day trend chart
│       │   ├── AnomalyHistoryDrawer.tsx      # Historical anomaly drawer
│       │   ├── SeverityBadge.tsx             # Severity indicator component
│       │   ├── ModuleTag.tsx                 # Module label chip
│       │   ├── InvestigationWorksheet.tsx    # Investigation form/notes
│       │   ├── DismissConfirmDialog.tsx      # Dismiss with reason modal
│       │   └── PatternRecognitionPanel.tsx   # Recurring pattern display
│       ├── _hooks/
│       │   ├── useAnomalyFeed.ts             # Real-time anomaly feed hook
│       │   ├── useAnomalyFilters.ts          # Filter state management
│       │   ├── useAnomalyDetail.ts           # Single anomaly detail fetch
│       │   ├── useAnomalyActions.ts          # Acknowledge/dismiss/investigate
│       │   ├── useAnomalyTrends.ts           # Trend data aggregation
│       │   └── useAnomalyRealtime.ts         # SSE/WebSocket connection
│       └── _utils/
│           ├── anomaly-severity.ts           # Severity classification helpers
│           ├── anomaly-formatters.ts         # Display formatting utilities
│           └── anomaly-filters.ts            # Filter logic utilities
├── api/
│   └── v1/
│       └── anomalies/
│           ├── route.ts                      # GET /api/v1/anomalies (list)
│           ├── [anomalyId]/
│           │   ├── route.ts                  # GET/PATCH anomaly by ID
│           │   ├── acknowledge/
│           │   │   └── route.ts              # POST acknowledge
│           │   ├── investigate/
│           │   │   └── route.ts              # POST start investigation
│           │   └── dismiss/
│           │       └── route.ts              # POST dismiss with reason
│           ├── stats/
│           │   └── route.ts                  # GET anomaly statistics
│           ├── trends/
│           │   └── route.ts                  # GET trend data
│           └── stream/
│               └── route.ts                  # SSE real-time anomaly stream
lib/
├── anomaly/
│   ├── anomaly-detector.ts                   # Core detection engine
│   ├── anomaly-classifier.ts                 # Severity classification via Claude
│   ├── anomaly-rules.ts                      # Rule definitions per module
│   ├── anomaly-types.ts                      # TypeScript type definitions
│   └── anomaly-thresholds.ts                 # Configurable threshold values
```

### State Management Architecture
```typescript
// ===== Global State (React Context / Zustand) =====

interface AnomalyGlobalState {
  alerts: AnomalyAlert[];
  activeAlertId: string | null;
  filters: AnomalyFilterState;
  stats: AnomalyStats;
  realtimeConnected: boolean;
  unreadCount: number;
}

interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  module: HospitalModule;
  detectedAt: string;                        // ISO 8601
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  triggeredBy: AnomalyTrigger[];
  affectedModules: HospitalModule[];
  context: AnomalyContext;
  assignedTo: string | null;
  auditTrail: AnomalyAuditEntry[];
}

type AnomalySeverity = 'critical' | 'warning' | 'informational';

type AnomalyStatus =
  | 'active'
  | 'acknowledged'
  | 'investigating'
  | 'dismissed'
  | 'resolved';

type HospitalModule =
  | 'staffing'
  | 'bed-allocation'
  | 'supply-chain'
  | 'finance'
  | 'cross-module';

interface AnomalyTrigger {
  field: string;                             // e.g., "patient.date_of_birth"
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'deviation' | 'threshold';
  expectedValue: string | number;
  actualValue: string | number;
  dataSource: string;                        // e.g., "staffing.shifts"
  recordId: string;
}

interface AnomalyContext {
  summary: string;                           // Claude-generated human-readable summary
  rootCauseHypothesis: string;               // AI-suggested root cause
  recommendedActions: string[];              // AI-suggested next steps
  relatedAnomalyIds: string[];
  impactAssessment: {
    affectedPatients: number;
    financialImpact: number | null;          // estimated USD
    operationalRisk: 'low' | 'medium' | 'high';
  };
}

// ===== Filter State =====

interface AnomalyFilterState {
  modules: HospitalModule[];
  severities: AnomalySeverity[];
  statuses: AnomalyStatus[];
  dateRange: { start: string; end: string };
  searchQuery: string;
  sortBy: 'detectedAt' | 'severity' | 'module';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// ===== Statistics =====

interface AnomalyStats {
  critical: number;
  warning: number;
  informational: number;
  resolved: number;
  meanTimeToAcknowledge: number;             // minutes
  meanTimeToResolve: number;                 // hours
  anomaliesLast24h: number;
  anomaliesLast7d: number;
}

// ===== Trend Data =====

interface AnomalyTrendDataPoint {
  date: string;                              // ISO date
  critical: number;
  warning: number;
  informational: number;
  total: number;
}

// ===== Audit Trail =====

interface AnomalyAuditEntry {
  id: string;
  anomalyId: string;
  action: 'created' | 'acknowledged' | 'investigation_started' | 'note_added' | 'dismissed' | 'resolved' | 'escalated';
  actorId: string;
  actorName: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  reason?: string;                           // required for dismiss action
}
```

### API Integration Schema
```typescript
// ===== GET /api/v1/anomalies =====
// List anomalies with filtering and pagination

interface GetAnomaliesRequest {
  modules?: HospitalModule[];
  severities?: AnomalySeverity[];
  statuses?: AnomalyStatus[];
  dateFrom?: string;                         // ISO 8601
  dateTo?: string;                           // ISO 8601
  search?: string;
  sortBy?: 'detectedAt' | 'severity' | 'module';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;                         // default: 25, max: 100
}

interface GetAnomaliesResponse {
  data: AnomalyAlert[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
  };
  stats: AnomalyStats;
}

// ===== GET /api/v1/anomalies/:anomalyId =====

interface GetAnomalyDetailResponse {
  data: AnomalyAlert;
  relatedAnomalies: AnomalyAlert[];          // max 5 related
  investigationNotes: InvestigationNote[];
}

interface InvestigationNote {
  id: string;
  anomalyId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ===== POST /api/v1/anomalies/:anomalyId/acknowledge =====

interface AcknowledgeAnomalyRequest {
  note?: string;
}

interface AcknowledgeAnomalyResponse {
  success: boolean;
  anomaly: AnomalyAlert;
  auditEntry: AnomalyAuditEntry;
}

// ===== POST /api/v1/anomalies/:anomalyId/investigate =====

interface InvestigateAnomalyRequest {
  assignedTo?: string;                       // userId
  priority?: 'low' | 'medium' | 'high';
  initialNotes?: string;
}

interface InvestigateAnomalyResponse {
  success: boolean;
  anomaly: AnomalyAlert;
  investigation: {
    id: string;
    anomalyId: string;
    assignedTo: string;
    startedAt: string;
    status: 'in_progress';
  };
}

// ===== POST /api/v1/anomalies/:anomalyId/dismiss =====

interface DismissAnomalyRequest {
  reason: string;                            // required, min 10 characters
  suppressSimilar: boolean;                  // suppress similar anomalies for X hours
  suppressDurationHours?: number;            // default: 24
}

interface DismissAnomalyResponse {
  success: boolean;
  anomaly: AnomalyAlert;
  auditEntry: AnomalyAuditEntry;
}

// ===== GET /api/v1/anomalies/stats =====

interface GetAnomalyStatsResponse {
  data: AnomalyStats;
  moduleBreakdown: Record<HospitalModule, {
    critical: number;
    warning: number;
    informational: number;
  }>;
}

// ===== GET /api/v1/anomalies/trends =====

interface GetAnomalyTrendsRequest {
  period: '7d' | '30d' | '90d' | '1y';
  granularity: 'hourly' | 'daily' | 'weekly';
  modules?: HospitalModule[];
}

interface GetAnomalyTrendsResponse {
  data: AnomalyTrendDataPoint[];
  period: string;
  granularity: string;
}

// ===== SSE /api/v1/anomalies/stream =====
// Server-Sent Events for real-time anomaly feed

type AnomalyStreamEvent =
  | { type: 'anomaly_created'; data: AnomalyAlert }
  | { type: 'anomaly_updated'; data: Partial<AnomalyAlert> & { id: string } }
  | { type: 'anomaly_resolved'; data: { id: string; resolvedAt: string } }
  | { type: 'stats_updated'; data: AnomalyStats }
  | { type: 'heartbeat'; data: { timestamp: string } };
```

## Implementation Requirements

### Core Components

| Component | Description | Props |
|---|---|---|
| `AnomalyDetectionPage` | Server component; fetches initial anomaly list and stats via RSC | None (server) |
| `AnomalyStatsBar` | Displays severity counts in colored stat cards | `stats: AnomalyStats` |
| `AnomalyStatCard` | Individual metric card with count and label | `label: string, count: number, severity: AnomalySeverity, trend?: number` |
| `AnomalyFilterBar` | Filter controls with debounced search | `filters: AnomalyFilterState, onChange: (filters) => void` |
| `AnomalyFeedPanel` | Scrollable list of anomaly cards with infinite loading | `alerts: AnomalyAlert[], activeId: string, onSelect: (id) => void` |
| `AnomalyFeedCard` | Individual anomaly card with severity, title, module, time | `alert: AnomalyAlert, isActive: boolean, onClick: () => void` |
| `SeverityBadge` | Color-coded severity indicator | `severity: AnomalySeverity, pulse?: boolean` |
| `AnomalyDetailPanel` | Full detail view for selected anomaly | `anomaly: AnomalyAlert, onAction: (action) => void` |
| `AnomalyContextBlock` | Claude-generated context and root cause display | `context: AnomalyContext` |
| `AnomalyActionBar` | Action buttons for acknowledge, investigate, dismiss | `anomaly: AnomalyAlert, onAction: (action, payload?) => void` |
| `AnomalyTrendChart` | Recharts area chart for anomaly frequency over time | `data: AnomalyTrendDataPoint[], period: string` |
| `InvestigationWorksheet` | Form for investigation notes and assignment | `anomalyId: string, investigation: Investigation` |
| `DismissConfirmDialog` | Modal with reason input and suppress toggle | `anomalyId: string, onConfirm: (reason, suppress) => void` |
| `PatternRecognitionPanel` | Recurring anomaly pattern display | `patterns: AnomalyPattern[]` |

### Custom Hooks

| Hook | Purpose | Return Type |
|---|---|---|
| `useAnomalyFeed` | Manages paginated anomaly feed with cursor-based loading | `{ alerts, isLoading, loadMore, hasMore, refresh }` |
| `useAnomalyFilters` | URL-synced filter state with debounced search | `{ filters, setFilter, resetFilters, activeFilterCount }` |
| `useAnomalyDetail` | Fetches single anomaly detail with related anomalies | `{ anomaly, relatedAnomalies, notes, isLoading, error }` |
| `useAnomalyActions` | Optimistic mutation handlers for acknowledge/investigate/dismiss | `{ acknowledge, investigate, dismiss, isPending }` |
| `useAnomalyTrends` | Fetches and transforms trend data for charting | `{ trendData, period, setPeriod, isLoading }` |
| `useAnomalyRealtime` | SSE connection for real-time anomaly updates | `{ isConnected, lastEvent, reconnect }` |

### Utility Functions

| Function | Purpose | Signature |
|---|---|---|
| `classifyAnomalySeverity` | Map detection scores to severity levels | `(score: number, thresholds: SeverityThresholds) => AnomalySeverity` |
| `formatAnomalyTimestamp` | Human-readable relative time (e.g., "2 min ago") | `(isoDate: string) => string` |
| `buildAnomalySearchParams` | Serialize filter state to URL search params | `(filters: AnomalyFilterState) => URLSearchParams` |
| `parseAnomalySearchParams` | Deserialize URL search params to filter state | `(params: URLSearchParams) => AnomalyFilterState` |
| `calculateAnomalyTrend` | Compute trend direction and percentage from data points | `(current: number, previous: number) => { direction, percentage }` |
| `groupAnomaliesByModule` | Group anomaly list by hospital module | `(alerts: AnomalyAlert[]) => Record<HospitalModule, AnomalyAlert[]>` |
| `sortAnomaliesBySeverity` | Sort with critical first, then warning, then info | `(alerts: AnomalyAlert[]) => AnomalyAlert[]` |

## Acceptance Criteria

### Functional Requirements
- [ ] System detects anomalies in staffing data (overtime spikes, schedule conflicts, nurse-to-patient ratio violations)
- [ ] System detects anomalies in bed allocation data (occupancy rate outliers, turnover time anomalies, mismatched ward assignments)
- [ ] System detects anomalies in supply chain data (unusual reorder patterns, supplier delivery time deviations, expired inventory)
- [ ] System detects anomalies in finance data (cost-per-procedure variance, budget overruns, revenue-per-bed outliers)
- [ ] System detects cross-module anomalies (e.g., staffing shortage correlated with bed closure and revenue drop)
- [ ] Data quality anomalies detected (e.g., DOB after admission date, negative values in non-negative fields, duplicate patient records)
- [ ] Each anomaly assigned severity: critical (immediate operational risk), warning (potential escalation), informational (notable but non-urgent)
- [ ] Alert includes Claude-generated context summary with root cause hypothesis and recommended actions
- [ ] Administrator can acknowledge an anomaly (status changes, timestamp recorded)
- [ ] Administrator can start investigation (assigns investigator, creates investigation record)
- [ ] Administrator can dismiss with mandatory reason (minimum 10 characters, logged to audit trail)
- [ ] Historical anomalies searchable and filterable by module, severity, status, date range
- [ ] Trend chart shows anomaly frequency over 7d/30d/90d/1y with daily/weekly granularity
- [ ] Real-time anomaly delivery via SSE within 15 seconds of detection
- [ ] Pattern recognition identifies and surfaces recurring anomaly types

### Non-Functional Requirements
- [ ] Anomaly detection pipeline processes incoming data within 60 seconds (P95 latency)
- [ ] Anomaly feed page loads in under 2 seconds (LCP) with 50 pre-loaded alerts
- [ ] SSE connection auto-reconnects within 5 seconds on network failure with exponential backoff
- [ ] Support concurrent monitoring of 10,000+ data points across all modules
- [ ] Anomaly detection rules configurable without code deployment (threshold-based rules in database)
- [ ] API endpoints return within 200ms (P95) for paginated list queries
- [ ] Anomaly data retained for 7 years with configurable archival policies
- [ ] Zero false-positive rate for data quality anomalies (DOB > admission date type rules); <5% false-positive rate for statistical anomalies
- [ ] WCAG 2.1 AA compliance for all anomaly UI components

## Modified Files
```
app/
├── (dashboard)/
│   └── anomalies/
│       ├── page.tsx                          [+] NEW - Anomaly detection page
│       ├── loading.tsx                       [+] NEW - Skeleton loader
│       ├── error.tsx                         [+] NEW - Error boundary
│       ├── layout.tsx                        [+] NEW - Section layout
│       └── _components/
│           ├── AnomalyPageHeader.tsx         [+] NEW
│           ├── AnomalyStatsBar.tsx           [+] NEW
│           ├── AnomalyStatCard.tsx           [+] NEW
│           ├── AnomalyFilterBar.tsx          [+] NEW
│           ├── AnomalyFeedPanel.tsx          [+] NEW
│           ├── AnomalyFeedCard.tsx           [+] NEW
│           ├── AnomalyDetailPanel.tsx        [+] NEW
│           ├── AnomalyContextBlock.tsx       [+] NEW
│           ├── AnomalyActionBar.tsx          [+] NEW
│           ├── AnomalyTrendChart.tsx         [+] NEW
│           ├── AnomalyHistoryDrawer.tsx      [+] NEW
│           ├── SeverityBadge.tsx             [+] NEW
│           ├── ModuleTag.tsx                 [+] NEW
│           ├── InvestigationWorksheet.tsx    [+] NEW
│           ├── DismissConfirmDialog.tsx      [+] NEW
│           └── PatternRecognitionPanel.tsx   [+] NEW
├── api/v1/anomalies/
│   ├── route.ts                              [+] NEW - List endpoint
│   ├── [anomalyId]/route.ts                  [+] NEW - Detail endpoint
│   ├── [anomalyId]/acknowledge/route.ts      [+] NEW
│   ├── [anomalyId]/investigate/route.ts      [+] NEW
│   ├── [anomalyId]/dismiss/route.ts          [+] NEW
│   ├── stats/route.ts                        [+] NEW
│   ├── trends/route.ts                       [+] NEW
│   └── stream/route.ts                       [+] NEW - SSE endpoint
lib/
├── anomaly/
│   ├── anomaly-detector.ts                   [+] NEW - Detection engine
│   ├── anomaly-classifier.ts                 [+] NEW - Claude classifier
│   ├── anomaly-rules.ts                      [+] NEW - Rule definitions
│   ├── anomaly-types.ts                      [+] NEW - Type definitions
│   └── anomaly-thresholds.ts                 [+] NEW - Threshold config
├── db/
│   └── schema/
│       ├── anomalies.ts                      [+] NEW - Anomaly table schema
│       └── anomaly-audit-logs.ts             [+] NEW - Audit log schema
└── hooks/ (shared)
    └── useSSE.ts                             [+] NEW - Generic SSE hook
```

## Implementation Status
**OVERALL STATUS**: :white_large_square: NOT STARTED

### Phase 1: Foundation & Data Quality Anomalies (Week 1-2)
| Task | Status |
|---|---|
| Define anomaly database schema (PostgreSQL) | :white_large_square: Not Started |
| Implement `anomaly-types.ts` TypeScript definitions | :white_large_square: Not Started |
| Build data quality rule engine (`anomaly-rules.ts`) | :white_large_square: Not Started |
| Create deterministic anomaly detection rules (DOB > admission, negative values, duplicates) | :white_large_square: Not Started |
| Set up BullMQ `anomaly-detection-queue` worker | :white_large_square: Not Started |
| Implement `GET /api/v1/anomalies` with pagination and filtering | :white_large_square: Not Started |
| Implement `GET /api/v1/anomalies/:anomalyId` detail endpoint | :white_large_square: Not Started |

### Phase 2: Anomaly Classification & Context (Week 3-4)
| Task | Status |
|---|---|
| Integrate Claude API for severity classification (`anomaly-classifier.ts`) | :white_large_square: Not Started |
| Build context generation pipeline (root cause hypothesis, recommended actions) | :white_large_square: Not Started |
| Implement statistical anomaly detection (z-score, IQR-based) for operational metrics | :white_large_square: Not Started |
| Build Neo4j cross-module dependency graph queries | :white_large_square: Not Started |
| Implement `anomaly-thresholds.ts` with configurable thresholds per module | :white_large_square: Not Started |
| Set up SSE endpoint (`/api/v1/anomalies/stream`) for real-time delivery | :white_large_square: Not Started |

### Phase 3: Frontend Components (Week 5-6)
| Task | Status |
|---|---|
| Build `AnomalyDetectionPage` server component with RSC data fetching | :white_large_square: Not Started |
| Implement `AnomalyStatsBar` and `AnomalyStatCard` components | :white_large_square: Not Started |
| Build `AnomalyFilterBar` with URL-synced state | :white_large_square: Not Started |
| Implement `AnomalyFeedPanel` with infinite scroll and `AnomalyFeedCard` | :white_large_square: Not Started |
| Build `AnomalyDetailPanel` with `AnomalyContextBlock` and `AnomalyActionBar` | :white_large_square: Not Started |
| Implement action endpoints (acknowledge, investigate, dismiss) | :white_large_square: Not Started |
| Build `AnomalyTrendChart` with Recharts | :white_large_square: Not Started |
| Implement `useAnomalyRealtime` SSE hook with auto-reconnect | :white_large_square: Not Started |

### Phase 4: Advanced Features & Polish (Week 7-8)
| Task | Status |
|---|---|
| Build `PatternRecognitionPanel` for recurring anomaly identification | :white_large_square: Not Started |
| Implement `AnomalyHistoryDrawer` with timeline view | :white_large_square: Not Started |
| Build `InvestigationWorksheet` with auto-saving notes | :white_large_square: Not Started |
| Add dismiss suppression logic (suppress similar anomalies for N hours) | :white_large_square: Not Started |
| Responsive design implementation and testing across breakpoints | :white_large_square: Not Started |
| End-to-end testing with synthetic anomaly data | :white_large_square: Not Started |
| Performance optimization (virtualized feed list, memoized filters) | :white_large_square: Not Started |

## Dependencies
| Dependency | Type | Status | Notes |
|---|---|---|---|
| Staffing Module API (Story 01) | Data Source | Required | Provides staffing data stream for anomaly detection |
| Bed Allocation Module API (Story 02) | Data Source | Required | Provides bed occupancy and turnover data |
| Supply Chain Module API (Story 03) | Data Source | Required | Provides inventory and supplier data |
| Finance Module API (Story 04) | Data Source | Required | Provides revenue, cost, and budget data |
| Data Governance Dashboard (Story 08) | Integration | Recommended | Bidirectional data quality signal sharing |
| Claude API Access | External Service | Required | Anomaly classification and context generation |
| BullMQ / Redis | Infrastructure | Required | Job queue for async anomaly processing |
| Neo4j Graph DB | Infrastructure | Required | Cross-module dependency graph queries |
| Recharts Library | NPM Package | Required | Trend chart visualization |
| Design System Components | Shared | Required | SeverityBadge, ModuleTag, StatCard patterns |

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Alert Fatigue**: Too many low-priority anomalies overwhelm administrators | High | High | Configurable thresholds, smart grouping of related anomalies, severity-based notification throttling |
| **False Positives**: Statistical anomaly detection triggers on legitimate outliers | Medium | High | Human feedback loop (dismiss with reason trains model), configurable sensitivity per module, minimum confidence threshold |
| **Claude API Latency**: Anomaly classification delayed by API response times | Medium | Medium | Async classification via BullMQ (don't block detection), cache similar classifications, fallback to rule-based severity |
| **Data Volume Scaling**: Real-time monitoring of 10K+ data points causes processing bottleneck | Medium | High | Stream processing with Redis Streams, batch detection windows (5-minute intervals), horizontal BullMQ worker scaling |
| **Cross-Module Dependency Complexity**: Neo4j query performance degrades with complex graph traversals | Low | Medium | Pre-computed dependency paths, query caching with Redis TTL, limit traversal depth to 3 hops |
| **SSE Connection Stability**: Long-lived connections dropped by load balancers or proxies | Medium | Low | Auto-reconnect with exponential backoff, heartbeat every 30s, graceful degradation to polling |

## Testing Strategy
- **Unit Tests**: Anomaly detection rules (deterministic rules: 100% coverage), severity classification logic, filter/search utilities, timestamp formatting
- **Integration Tests**: BullMQ worker processes anomaly detection jobs end-to-end, API endpoints return correct data with pagination and filtering, SSE stream delivers events within latency requirements
- **Component Tests**: `AnomalyFeedCard` renders correct severity colors and icons, `AnomalyFilterBar` syncs state with URL params, `AnomalyActionBar` disables buttons during pending actions, `AnomalyTrendChart` renders correct data points
- **End-to-End Tests**: Full flow: anomaly injected -> detected -> alert appears in feed -> user acknowledges -> status updated, dismiss flow with reason validation, investigation flow with note creation
- **Performance Tests**: Feed rendering with 500+ anomalies (virtualized scroll), SSE delivery latency under load (100 concurrent connections), API response times with 100K+ anomaly records in database
- **Accessibility Tests**: Screen reader navigation through anomaly feed, keyboard-only anomaly acknowledgment and dismissal, severity colors meet WCAG 2.1 AA contrast ratios

## Performance Considerations
- **Virtualized Feed List**: Use `@tanstack/react-virtual` for anomaly feed to handle 500+ items without DOM bloat
- **Memoized Filter Results**: `useMemo` on filtered/sorted anomaly arrays to prevent re-computation on unrelated state changes
- **Debounced Search**: 300ms debounce on search input to reduce API calls during typing
- **SSE Connection Pooling**: Single SSE connection per user session; multiplex anomaly types through event types
- **Redis Caching**: Cache anomaly stats (30s TTL), trend data (5min TTL), and anomaly list pages (30s TTL with cache invalidation on new anomaly)
- **Database Indexing**: Composite indexes on `(status, severity, detected_at)`, `(module, detected_at)`, full-text index on `title` and `description`
- **Batch Detection**: Process anomaly rules in 5-minute windows rather than per-record to reduce CPU overhead
- **Optimistic UI**: Acknowledge/dismiss actions update UI immediately, rollback on API failure
- **Lazy Loading**: Trend chart and pattern recognition panel loaded via dynamic import (`next/dynamic`) with loading fallback

## Deployment Plan
1. **Database Migration**: Deploy anomaly and audit log table schemas to PostgreSQL staging
2. **Backend Services**: Deploy BullMQ anomaly detection worker, classification worker, and notification worker to ECS
3. **API Endpoints**: Deploy anomaly REST API and SSE stream endpoint behind API gateway
4. **Feature Flag**: Gate anomaly detection UI behind `FEATURE_ANOMALY_DETECTION` flag for gradual rollout
5. **Synthetic Data Seeding**: Seed staging environment with 500 historical anomalies across all modules and severity levels
6. **Canary Deployment**: Enable for 10% of administrator users, monitor for false positive rates and SSE stability
7. **Full Rollout**: Scale to 100% of administrators after 72-hour canary validation period
8. **Post-Deployment Verification**: Confirm anomaly detection latency <15 min, SSE delivery <15s, API P95 <200ms

## Monitoring & Analytics
- **Detection Latency**: Track time from data ingestion to anomaly alert creation (target: <60s P95)
- **Classification Latency**: Track time from detection to Claude classification completion (target: <10s P95)
- **SSE Delivery Latency**: Track time from anomaly creation to client-side render (target: <15s P95)
- **False Positive Rate**: Track anomalies dismissed as "not an issue" / total anomalies (target: <5%)
- **Acknowledgment Rate**: Track percentage of anomalies acknowledged within 2 hours (target: >80%)
- **Mean Time to Acknowledge (MTTA)**: Average time from alert creation to acknowledgment (target: <30 min)
- **Mean Time to Resolve (MTTR)**: Average time from alert creation to resolution (target: <24 hrs for critical)
- **Active SSE Connections**: Monitor concurrent SSE connections per pod (alert if >500 per instance)
- **BullMQ Queue Depth**: Alert if anomaly detection queue depth exceeds 1000 pending jobs
- **API Error Rates**: Track 5xx error rates on anomaly endpoints (alert if >1% over 5-minute window)
- **User Engagement**: Track filter usage patterns, most-viewed anomaly types, investigation completion rates

## Documentation Requirements
- **Anomaly Rule Configuration Guide**: How to add, modify, and tune anomaly detection rules and thresholds
- **Anomaly Severity Classification Reference**: Mapping of anomaly types to severity levels with examples
- **API Reference**: OpenAPI 3.0 spec for all anomaly endpoints including SSE event schema
- **Administrator Guide**: How to manage anomalies (acknowledge, investigate, dismiss), best practices for alert triage
- **Integration Guide**: How other modules emit data events consumed by the anomaly detection pipeline
- **Runbook**: Troubleshooting SSE connection issues, BullMQ worker failures, high false-positive rates

## Post-Launch Review
- **Week 1 Review**: Evaluate false positive rates across each module; tune thresholds for any module exceeding 5% false positive rate
- **Week 2 Review**: Assess administrator engagement metrics (MTTA, acknowledgment rate); gather qualitative feedback on Claude-generated context quality
- **Week 4 Review**: Analyze anomaly pattern data; identify top 5 recurring anomaly types for potential automated resolution
- **Month 2 Review**: Evaluate cross-module anomaly detection accuracy; assess Neo4j graph query performance at production data volumes
- **Quarter 1 Review**: Full retrospective on anomaly detection value delivery; plan enhancements (ML-based detection, automated remediation, predictive anomalies)
