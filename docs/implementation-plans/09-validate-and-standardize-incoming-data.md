# 09 Validate and Standardize Incoming Data - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story

As a **hospital data administrator**, I want **the system to automatically validate, flag, and standardize incoming data at the point of ingestion**, so that **downstream analytics and simulations are based on high-quality, consistent data**.

## Pre-conditions

- Hospital data sources (EHR, labs, billing, scheduling) are available for integration via HL7 FHIR, CSV, or API endpoints
- Neo4j graph database schema is provisioned with base node types (Patient, Encounter, Department, Procedure, Staff)
- PostgreSQL houses the relational validation rule store and quarantine ledger
- Redis is running for caching ingestion pipeline state and deduplication keys
- BullMQ workers are provisioned for asynchronous ingestion job processing
- Module data field configurations (Story 13) are defined for at least one analytics module
- Authentication and RBAC are operational; the `data_administrator` role exists with ingestion management permissions

## Business Requirements

- **Data Quality Rate**: Achieve >= 95% of ingested records passing validation within 90 days of hospital onboarding (measured via `ingestion_quality_metrics` table)
- **Standardization Coverage**: 100% of numeric clinical measurements (vitals, lab values) normalized to canonical units before persistence
- **Quarantine SLA**: Records failing validation quarantined within 500ms of detection; flagged for manual review with mean resolution time < 24 hours
- **Orphan Detection**: Graph-based orphan node detection identifies >= 90% of disconnected records within each ingestion batch
- **Ingestion Throughput**: Process a minimum of 10,000 records per minute during batch ingestion without degradation
- **Audit Completeness**: Every ingestion event (success, failure, standardization transformation) logged with full provenance trail

## Technical Specifications

### Integration Points
- **Data Sources**: HL7 FHIR R4 endpoints, CSV/Excel bulk uploads, direct database replication (CDC via Debezium), REST API push from hospital HIS
- **Graph Database**: Neo4j Aura for entity relationship modeling, orphan node detection via Cypher queries
- **Message Queue**: BullMQ on Redis for ingestion pipeline job orchestration (validate, standardize, persist, reconcile)
- **AI Layer**: Claude API for fuzzy field mapping, ambiguous value resolution, and intelligent standardization suggestions
- **Notification Service**: Email/webhook alerts for quarantine threshold breaches and ingestion failures
- **Data Quality Dashboard**: Real-time metrics pushed to Story 08 (Data Quality & Governance Dashboard) via internal event bus

### Security Requirements
- All data in transit encrypted via TLS 1.3; data at rest encrypted via AES-256 (AWS KMS managed keys)
- PHI/PII fields encrypted at the column level in PostgreSQL (pgcrypto) and property level in Neo4j
- Ingestion API endpoints protected by JWT + API key dual authentication
- All validation rule changes logged in immutable audit trail with user attribution
- RBAC enforcement: only `data_administrator` and `system_admin` roles can modify validation rules or release quarantined records
- Data residency compliance: ingestion pipelines respect hospital-configured data sovereignty region

## Design Specifications

### Visual Layout & Components

**Data Ingestion Dashboard Layout**:
```
+------------------------------------------------------------------+
| [TopNav: MedicalPro Logo | Modules | Settings | User Avatar]     |
+------------------------------------------------------------------+
| [Sidebar]  |  [IngestionDashboard]                               |
|            |  +------------------------------------------------+ |
| Data       |  | Ingestion Quality Overview    [Last 24h v]     | |
| Ingestion  |  | +----------+ +----------+ +----------+ +-----+| |
|  > Sources |  | |Pass Rate | |Quarantine| |Orphan    | |Thru-|| |
|  > Rules   |  | | 96.2%    | | 847 recs | |Nodes: 23 | |put  || |
|  > Queue   |  | +----------+ +----------+ +----------+ +-----+| |
|  > History |  +------------------------------------------------+ |
|            |                                                      |
| Quality    |  +------------------------------------------------+ |
|  > Metrics |  | Active Ingestion Jobs           [Refresh]      | |
|  > Reports |  | +--------------------------------------------+ | |
|            |  | | Source     | Status  | Records | Errors     | | |
|            |  | | EHR-Main  | Running | 4,521   | 12         | | |
|            |  | | Lab-Feed  | Queued  | --      | --         | | |
|            |  | | Billing   | Done    | 12,004  | 287        | | |
|            |  | +--------------------------------------------+ | |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | Quarantine Queue           [Review All]        | |
|            |  | +--------------------------------------------+ | |
|            |  | | Record    | Rule Failed | Severity| Action | | |
|            |  | | PAT-1042  | DOB>Admit   | High    | [Fix]  | | |
|            |  | | ENC-8891  | Unit Mismtch| Medium  | [Fix]  | | |
|            |  | | LAB-2210  | Orphan Node | Low     | [Link] | | |
|            |  | +--------------------------------------------+ | |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | Validation Rule Failure Breakdown (Bar Chart)   | |
|            |  | [===========] DOB > Admission Date   34%       | |
|            |  | [========]    Unit Mismatch           26%       | |
|            |  | [=====]       Missing Required Field  18%       | |
|            |  | [===]         Range Violation         12%       | |
|            |  | [==]          Duplicate Record        10%       | |
|            |  +------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
<AppLayout>
  <TopNavigation />
  <Sidebar activeModule="data-ingestion" />
  <MainContent>
    <IngestionDashboard>
      <IngestionQualityOverview>
        <MetricCard label="Pass Rate" />
        <MetricCard label="Quarantined" />
        <MetricCard label="Orphan Nodes" />
        <MetricCard label="Throughput" />
      </IngestionQualityOverview>
      <ActiveIngestionJobs>
        <IngestionJobRow />
        <IngestionJobProgressBar />
      </ActiveIngestionJobs>
      <QuarantineQueue>
        <QuarantineRecordRow />
        <QuarantineActionButtons />
        <QuarantineDetailModal />
      </QuarantineQueue>
      <ValidationFailureBreakdown>
        <FailureBarChart />
        <FailureTrendLine />
      </ValidationFailureBreakdown>
    </IngestionDashboard>
    <ValidationRuleManager>
      <RuleListTable />
      <RuleEditorForm />
      <RuleTestRunner />
    </ValidationRuleManager>
    <DataSourceConnector>
      <SourceConfigForm />
      <SourceHealthIndicator />
      <FieldMappingInterface />
    </DataSourceConnector>
  </MainContent>
</AppLayout>
```

### Design System Compliance

**Color Usage**:
```css
/* Ingestion-specific semantic colors */
--ingestion-pass: #28A745;              /* Records passing validation */
--ingestion-quarantine: #DC3545;        /* Quarantined records */
--ingestion-orphan: #FFB74D;            /* Orphan nodes detected */
--ingestion-processing: var(--primary-cerulean); /* #00B3C6 - Active jobs */
--ingestion-idle: var(--secondary-silver);       /* #BFC9CC - Idle state */

/* Card backgrounds follow Kairos premium aesthetic */
--metric-card-bg: var(--bg-card);       /* #FFFFFF */
--metric-card-border: rgba(0, 0, 0, 0.05);
--metric-card-shadow: 0 6px 18px rgba(2, 18, 22, 0.06);
```

**Typography**:
```css
/* Dashboard headings: Merriweather */
.ingestion-title { font-family: var(--font-heading); font-weight: 700; font-size: var(--text-2xl); }
/* Metric values: Inter bold for clarity */
.metric-value { font-family: var(--font-body); font-weight: 700; font-size: var(--text-3xl); }
/* Table cells: Inter regular */
.table-cell { font-family: var(--font-body); font-weight: 400; font-size: var(--text-sm); }
/* Monospace for record IDs and technical values */
.record-id { font-family: var(--font-mono); font-size: var(--text-sm); }
```

### Responsive Behavior

| Breakpoint | Layout Adaptation |
|---|---|
| Desktop (>= 1280px) | Sidebar + 4-column metric grid + full table views |
| Laptop (1024-1279px) | Sidebar collapses to icons; 2-column metric grid |
| Tablet (768-1023px) | Sidebar becomes bottom nav; single-column metrics; table becomes card list |
| Mobile (< 768px) | Full-width cards; quarantine queue as stacked cards; abbreviated columns |

### Interaction Patterns

- **Quarantine Record Fix**: Click "Fix" -> Slide-in detail panel shows original vs. suggested correction -> Accept/Edit/Reject buttons with tracked rationale
- **Validation Rule Editor**: Inline editing for rule parameters; real-time preview of rule effect on sample dataset
- **Ingestion Job Monitoring**: Auto-refreshing (5s interval) via WebSocket; progress bars with record count and error count
- **Orphan Node Resolution**: Click orphan -> Neo4j relationship suggestion panel -> One-click link to candidate parent node
- **Bulk Quarantine Actions**: Multi-select records -> Batch approve/reject with required comment
- **Data Source Health**: Pulsing indicator (green/amber/red) with tooltip showing last sync timestamp and error count

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── data-ingestion/
│       ├── page.tsx                              # Ingestion dashboard entry
│       ├── layout.tsx                            # Ingestion module layout
│       ├── loading.tsx                           # Skeleton loader
│       ├── error.tsx                             # Error boundary
│       ├── quarantine/
│       │   ├── page.tsx                          # Quarantine queue view
│       │   └── [recordId]/
│       │       └── page.tsx                      # Single quarantine record detail
│       ├── rules/
│       │   ├── page.tsx                          # Validation rule manager
│       │   └── [ruleId]/
│       │       └── page.tsx                      # Individual rule editor
│       ├── sources/
│       │   ├── page.tsx                          # Data source connector list
│       │   └── [sourceId]/
│       │       └── page.tsx                      # Source config + field mapping
│       └── components/
│           ├── IngestionDashboard.tsx             # Main dashboard container
│           ├── IngestionQualityOverview.tsx       # Metric cards row
│           ├── ActiveIngestionJobs.tsx            # Job list with progress
│           ├── IngestionJobRow.tsx                # Single job row
│           ├── QuarantineQueue.tsx                # Quarantine record table
│           ├── QuarantineRecordRow.tsx            # Single quarantine row
│           ├── QuarantineDetailPanel.tsx          # Slide-in fix panel
│           ├── ValidationFailureBreakdown.tsx     # Failure chart
│           ├── ValidationRuleManager.tsx          # Rule CRUD interface
│           ├── RuleEditorForm.tsx                 # Rule creation/edit form
│           ├── RuleTestRunner.tsx                 # Test rule against sample data
│           ├── DataSourceConnector.tsx            # Source config interface
│           ├── FieldMappingInterface.tsx          # Map source fields to schema
│           ├── OrphanNodeResolver.tsx             # Neo4j orphan resolution UI
│           └── hooks/
│               ├── useIngestionMetrics.ts         # Real-time metrics polling
│               ├── useIngestionJobs.ts            # Job queue state via WebSocket
│               ├── useQuarantineQueue.ts          # Quarantine CRUD ops
│               ├── useValidationRules.ts          # Rule management
│               ├── useDataSources.ts              # Source connector state
│               └── useOrphanNodes.ts              # Neo4j orphan queries
├── lib/
│   ├── api/
│   │   ├── ingestion-api.ts                      # Ingestion REST client
│   │   ├── quarantine-api.ts                     # Quarantine REST client
│   │   ├── validation-rules-api.ts               # Rule management client
│   │   └── data-sources-api.ts                   # Source connector client
│   ├── validators/
│   │   ├── clinical-validators.ts                # Clinical data validation rules
│   │   ├── demographic-validators.ts             # Patient demographic validators
│   │   ├── financial-validators.ts               # Billing/revenue validators
│   │   └── unit-standardizer.ts                  # Unit conversion engine
│   └── utils/
│       ├── ingestion-utils.ts                    # Ingestion helpers
│       ├── unit-conversion-tables.ts             # Clinical unit mappings
│       └── fhir-parser.ts                        # HL7 FHIR resource parser
├── types/
│   ├── ingestion.types.ts                        # Core ingestion types
│   ├── validation-rule.types.ts                  # Rule definition types
│   ├── quarantine.types.ts                       # Quarantine record types
│   └── data-source.types.ts                      # Source connector types
└── services/
    └── ingestion/
        ├── DataIngestionPipeline.ts              # Main pipeline orchestrator
        ├── ValidationEngine.ts                   # Rule execution engine
        ├── StandardizationEngine.ts              # Unit & format normalizer
        ├── QuarantineManager.ts                  # Quarantine lifecycle
        ├── OrphanDetector.ts                     # Neo4j orphan node detection
        └── IngestionJobProcessor.ts              # BullMQ job handler
```

### State Management Architecture

```typescript
// types/ingestion.types.ts

/** Represents a single healthcare data record entering the pipeline */
interface IngestionRecord {
  id: string;
  sourceId: string;
  sourceType: 'HL7_FHIR' | 'CSV' | 'API_PUSH' | 'CDC_STREAM';
  resourceType: 'Patient' | 'Encounter' | 'Observation' | 'Claim' | 'Procedure' | 'Practitioner';
  rawPayload: Record<string, unknown>;
  normalizedPayload: Record<string, unknown> | null;
  validationStatus: 'pending' | 'passed' | 'failed' | 'quarantined';
  standardizationLog: StandardizationEntry[];
  ingestedAt: string; // ISO 8601
  processedAt: string | null;
  batchId: string;
  hospitalId: string;
}

/** Tracks each standardization transformation applied to a record */
interface StandardizationEntry {
  fieldPath: string;
  originalValue: string;
  standardizedValue: string;
  conversionRule: string;        // e.g., "kPa_to_mmHg"
  confidence: number;            // 0.0 - 1.0
  appliedAt: string;
}

/** Core validation rule definition */
interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'temporal' | 'range' | 'format' | 'referential' | 'completeness' | 'uniqueness';
  resourceTypes: string[];        // Which FHIR resource types this applies to
  severity: 'critical' | 'high' | 'medium' | 'low';
  expression: string;             // JSONLogic or custom DSL expression
  parameters: Record<string, unknown>;
  isActive: boolean;
  isSystemRule: boolean;          // System rules cannot be deleted
  hospitalId: string | null;      // null = global rule
  createdBy: string;
  updatedAt: string;
}

/** Quarantine record with resolution tracking */
interface QuarantineRecord {
  id: string;
  ingestionRecordId: string;
  failedRules: FailedRuleResult[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending_review' | 'in_review' | 'resolved_fixed' | 'resolved_rejected' | 'auto_resolved';
  assignedTo: string | null;
  originalPayload: Record<string, unknown>;
  suggestedFix: Record<string, unknown> | null;
  resolution: QuarantineResolution | null;
  quarantinedAt: string;
  resolvedAt: string | null;
}

interface FailedRuleResult {
  ruleId: string;
  ruleName: string;
  fieldPath: string;
  actualValue: unknown;
  expectedConstraint: string;
  message: string;
}

interface QuarantineResolution {
  action: 'fix_and_reingest' | 'reject_permanently' | 'override_and_accept';
  correctedPayload: Record<string, unknown> | null;
  rationale: string;
  resolvedBy: string;
  resolvedAt: string;
}

/** Ingestion quality metrics aggregated per batch/timeframe */
interface IngestionQualityMetrics {
  timeframe: string;              // ISO 8601 interval
  hospitalId: string;
  totalRecords: number;
  passedValidation: number;
  failedValidation: number;
  quarantinedRecords: number;
  orphanNodesDetected: number;
  standardizationApplied: number;
  passRate: number;               // Percentage 0-100
  topFailureReasons: FailureReason[];
  averageProcessingTimeMs: number;
  throughputRecordsPerMinute: number;
}

interface FailureReason {
  ruleId: string;
  ruleName: string;
  count: number;
  percentage: number;
}

/** Data source connector configuration */
interface DataSourceConfig {
  id: string;
  hospitalId: string;
  name: string;
  type: 'HL7_FHIR' | 'CSV_UPLOAD' | 'API_ENDPOINT' | 'DATABASE_CDC';
  connectionConfig: FhirConnectionConfig | CsvUploadConfig | ApiEndpointConfig | CdcConfig;
  fieldMappings: FieldMapping[];
  schedule: IngestionSchedule;
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'error';
  lastSyncAt: string | null;
  lastErrorMessage: string | null;
  isActive: boolean;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformationRule: string | null;  // Optional transformation expression
  isRequired: boolean;
  defaultValue: unknown | null;
}

interface IngestionSchedule {
  type: 'realtime' | 'interval' | 'cron' | 'manual';
  intervalMinutes: number | null;
  cronExpression: string | null;
}

/** Orphan node from Neo4j graph analysis */
interface OrphanNode {
  nodeId: string;
  nodeType: string;                // Neo4j label
  properties: Record<string, unknown>;
  candidateParents: CandidateRelationship[];
  detectedAt: string;
  status: 'unresolved' | 'linked' | 'dismissed';
  batchId: string;
}

interface CandidateRelationship {
  targetNodeId: string;
  targetNodeType: string;
  relationshipType: string;        // e.g., "ADMITTED_TO", "TREATED_BY"
  confidenceScore: number;
  matchReason: string;
}

// --- State Management ---

interface IngestionDashboardState {
  metrics: {
    data: IngestionQualityMetrics | null;
    isLoading: boolean;
    error: string | null;
    timeframe: '1h' | '24h' | '7d' | '30d';
  };
  jobs: {
    active: IngestionJob[];
    isLoading: boolean;
    isConnected: boolean; // WebSocket status
  };
  quarantine: {
    records: QuarantineRecord[];
    totalCount: number;
    filters: QuarantineFilters;
    pagination: PaginationState;
    selectedRecord: QuarantineRecord | null;
    isDetailPanelOpen: boolean;
  };
  rules: {
    items: ValidationRule[];
    editingRule: ValidationRule | null;
    testResults: RuleTestResult[] | null;
  };
  sources: {
    items: DataSourceConfig[];
    selectedSource: DataSourceConfig | null;
  };
  orphans: {
    nodes: OrphanNode[];
    isLoading: boolean;
  };
}

interface IngestionJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  startedAt: string;
  estimatedCompletionAt: string | null;
}

interface QuarantineFilters {
  severity: ('critical' | 'high' | 'medium' | 'low')[];
  status: ('pending_review' | 'in_review')[];
  ruleCategory: string[];
  dateRange: { from: string; to: string };
  searchQuery: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
}

interface RuleTestResult {
  recordId: string;
  passed: boolean;
  failureMessage: string | null;
}
```

### API Integration Schema

```typescript
// --- REST API Endpoints ---

// Ingestion Metrics
// GET /api/v1/ingestion/metrics?hospitalId={id}&timeframe={1h|24h|7d|30d}
interface GetIngestionMetricsResponse {
  success: boolean;
  data: IngestionQualityMetrics;
}

// Ingestion Jobs
// GET /api/v1/ingestion/jobs?hospitalId={id}&status={queued|running|completed|failed}
interface GetIngestionJobsResponse {
  success: boolean;
  data: IngestionJob[];
}

// POST /api/v1/ingestion/jobs
interface CreateIngestionJobRequest {
  sourceId: string;
  hospitalId: string;
  options: {
    batchSize: number;
    skipDuplicateCheck: boolean;
    dryRun: boolean;
  };
}
interface CreateIngestionJobResponse {
  success: boolean;
  data: { jobId: string; estimatedRecords: number };
}

// Quarantine Records
// GET /api/v1/ingestion/quarantine?hospitalId={id}&severity={critical|high|medium|low}&status={pending_review|in_review}&page={n}&pageSize={n}
interface GetQuarantineRecordsResponse {
  success: boolean;
  data: {
    records: QuarantineRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// GET /api/v1/ingestion/quarantine/{recordId}
interface GetQuarantineRecordDetailResponse {
  success: boolean;
  data: QuarantineRecord & {
    originalRecord: IngestionRecord;
    suggestedFixes: SuggestedFix[];
    relatedRecords: RelatedRecord[];
  };
}

// PATCH /api/v1/ingestion/quarantine/{recordId}/resolve
interface ResolveQuarantineRecordRequest {
  action: 'fix_and_reingest' | 'reject_permanently' | 'override_and_accept';
  correctedPayload?: Record<string, unknown>;
  rationale: string;
}
interface ResolveQuarantineRecordResponse {
  success: boolean;
  data: QuarantineRecord;
}

// POST /api/v1/ingestion/quarantine/bulk-resolve
interface BulkResolveQuarantineRequest {
  recordIds: string[];
  action: 'fix_and_reingest' | 'reject_permanently' | 'override_and_accept';
  rationale: string;
}

// Validation Rules
// GET /api/v1/ingestion/rules?hospitalId={id}&category={temporal|range|format|referential|completeness|uniqueness}
interface GetValidationRulesResponse {
  success: boolean;
  data: ValidationRule[];
}

// POST /api/v1/ingestion/rules
interface CreateValidationRuleRequest {
  name: string;
  description: string;
  category: ValidationRule['category'];
  resourceTypes: string[];
  severity: ValidationRule['severity'];
  expression: string;
  parameters: Record<string, unknown>;
  hospitalId: string;
}

// PUT /api/v1/ingestion/rules/{ruleId}
interface UpdateValidationRuleRequest {
  name?: string;
  description?: string;
  severity?: ValidationRule['severity'];
  expression?: string;
  parameters?: Record<string, unknown>;
  isActive?: boolean;
}

// POST /api/v1/ingestion/rules/{ruleId}/test
interface TestValidationRuleRequest {
  sampleData: Record<string, unknown>[];  // Up to 100 records
}
interface TestValidationRuleResponse {
  success: boolean;
  data: {
    totalTested: number;
    passed: number;
    failed: number;
    results: RuleTestResult[];
  };
}

// Data Sources
// GET /api/v1/ingestion/sources?hospitalId={id}
interface GetDataSourcesResponse {
  success: boolean;
  data: DataSourceConfig[];
}

// POST /api/v1/ingestion/sources
interface CreateDataSourceRequest {
  hospitalId: string;
  name: string;
  type: DataSourceConfig['type'];
  connectionConfig: DataSourceConfig['connectionConfig'];
  fieldMappings: FieldMapping[];
  schedule: IngestionSchedule;
}

// POST /api/v1/ingestion/sources/{sourceId}/test-connection
interface TestConnectionResponse {
  success: boolean;
  data: {
    connected: boolean;
    recordsAvailable: number;
    sampleRecords: Record<string, unknown>[];
    detectedFields: string[];
    errorMessage: string | null;
  };
}

// Orphan Nodes
// GET /api/v1/ingestion/orphans?hospitalId={id}&status={unresolved|linked|dismissed}&batchId={id}
interface GetOrphanNodesResponse {
  success: boolean;
  data: OrphanNode[];
}

// PATCH /api/v1/ingestion/orphans/{nodeId}/link
interface LinkOrphanNodeRequest {
  targetNodeId: string;
  relationshipType: string;
}

// --- WebSocket Events ---
// WS /ws/ingestion/jobs/{hospitalId}
type IngestionJobEvent =
  | { type: 'JOB_STARTED'; job: IngestionJob }
  | { type: 'JOB_PROGRESS'; jobId: string; processedRecords: number; errorCount: number }
  | { type: 'JOB_COMPLETED'; jobId: string; summary: IngestionQualityMetrics }
  | { type: 'JOB_FAILED'; jobId: string; error: string }
  | { type: 'QUARANTINE_NEW'; record: QuarantineRecord };

// --- BullMQ Job Definitions ---
interface IngestionPipelineJob {
  name: 'ingest-batch';
  data: {
    sourceId: string;
    hospitalId: string;
    batchId: string;
    records: Record<string, unknown>[];
  };
}

interface ValidationJob {
  name: 'validate-record';
  data: {
    recordId: string;
    record: IngestionRecord;
    applicableRules: string[]; // Rule IDs
  };
}

interface StandardizationJob {
  name: 'standardize-record';
  data: {
    recordId: string;
    record: IngestionRecord;
    fieldMappings: FieldMapping[];
  };
}

interface OrphanDetectionJob {
  name: 'detect-orphans';
  data: {
    hospitalId: string;
    batchId: string;
    nodeTypes: string[];
  };
}

// --- Neo4j Cypher Templates ---
// Orphan detection query:
// MATCH (n:{nodeType}) WHERE NOT (n)--() AND n.hospitalId = $hospitalId AND n.batchId = $batchId RETURN n

// Candidate relationship suggestion query:
// MATCH (orphan:{nodeType} {id: $orphanId})
// MATCH (candidate) WHERE candidate.hospitalId = $hospitalId
// AND any(prop IN keys(orphan) WHERE orphan[prop] = candidate[prop])
// RETURN candidate, labels(candidate), [prop IN keys(orphan) WHERE orphan[prop] = candidate[prop]] AS matchingProps
```

## Implementation Requirements

### Core Components

1. **IngestionDashboard.tsx** - Primary container rendering quality overview, active jobs, quarantine queue, and failure breakdown. Server component that fetches initial metrics; delegates real-time updates to client children.

2. **IngestionQualityOverview.tsx** - Four `MetricCard` components displaying pass rate (gauge), quarantine count (badge), orphan nodes (count), and throughput (records/min). Color-coded thresholds: green >= 95%, amber 85-94%, red < 85%.

3. **ActiveIngestionJobs.tsx** - Client component connected to WebSocket (`/ws/ingestion/jobs/{hospitalId}`). Renders table of running/queued jobs with animated progress bars. Auto-updates on `JOB_PROGRESS` events.

4. **QuarantineQueue.tsx** - Paginated, filterable table of quarantined records. Supports multi-select for bulk actions. Sorting by severity (default), date, source. Inline severity badge with color coding.

5. **QuarantineDetailPanel.tsx** - Slide-in panel showing original data (left) vs. suggested fix (right) diff view. Powered by Claude API suggestions for ambiguous fixes. Action buttons: Accept Fix, Edit Manually, Reject Record.

6. **ValidationRuleManager.tsx** - CRUD interface for validation rules. Grouped by category tabs. Inline toggle for active/inactive. Click to expand shows rule expression and parameters.

7. **RuleEditorForm.tsx** - Form for creating/editing validation rules. JSONLogic expression builder with visual mode and raw JSON mode. Real-time syntax validation.

8. **RuleTestRunner.tsx** - Tests a rule against sample dataset (up to 100 records). Shows pass/fail results in a compact table. Used during rule creation to verify correctness.

9. **DataSourceConnector.tsx** - Source configuration with connection type selector, credential entry, schedule configuration. Test Connection button with result display.

10. **FieldMappingInterface.tsx** - Drag-and-drop or dropdown-based field mapping from source schema to platform schema. Highlights required vs. optional fields. Shows Claude AI suggested mappings.

11. **OrphanNodeResolver.tsx** - Displays orphan nodes from Neo4j with candidate parent suggestions. One-click link action creates Neo4j relationship. Confidence scores shown per candidate.

12. **ValidationFailureBreakdown.tsx** - Horizontal bar chart (Recharts) showing top failure reasons by percentage. Click bar to filter quarantine queue by that rule.

### Custom Hooks

1. **useIngestionMetrics(hospitalId, timeframe)** - Polls `GET /api/v1/ingestion/metrics` every 30 seconds. Returns metrics data, loading state, error, and refresh function. Caches previous data during refresh.

2. **useIngestionJobs(hospitalId)** - Establishes WebSocket connection to `/ws/ingestion/jobs/{hospitalId}`. Maintains reactive job list state. Handles reconnection with exponential backoff. Returns jobs, connection status, manual refresh.

3. **useQuarantineQueue(hospitalId, filters, pagination)** - Fetches quarantine records with server-side filtering and pagination. Provides resolve/bulk-resolve mutation functions. Optimistic updates on resolution.

4. **useValidationRules(hospitalId)** - CRUD operations for validation rules. Create, update, toggle active, delete. Includes test-against-sample function. Invalidates cache on mutations.

5. **useDataSources(hospitalId)** - Manages data source configurations. Create, update, delete, test-connection. Returns source list with health status.

6. **useOrphanNodes(hospitalId, batchId)** - Fetches orphan nodes from Neo4j via REST API. Provides link function to resolve orphans. Filters by node type and resolution status.

### Utility Functions

1. **unit-standardizer.ts** - Comprehensive clinical unit conversion engine. Converts between mmHg/kPa (blood pressure), mg/dL/mmol/L (glucose), Fahrenheit/Celsius (temperature), lbs/kg (weight), in/cm (height). Returns `{ standardizedValue, conversionApplied, confidence }`.

2. **clinical-validators.ts** - Validation functions for healthcare data: `validateDateSequence(dob, admitDate, dischargeDate)`, `validateVitalRange(vitalType, value)`, `validateICD10Code(code)`, `validateNPI(npi)`. Returns `{ valid, errors[] }`.

3. **fhir-parser.ts** - Parses HL7 FHIR R4 Bundle/Resource JSON into normalized `IngestionRecord` format. Handles Patient, Encounter, Observation, Claim, Procedure resource types. Extracts coded values using SNOMED/LOINC lookups.

4. **ingestion-utils.ts** - Helpers: `generateBatchId()`, `calculatePassRate(metrics)`, `formatThroughput(recordsPerMin)`, `mapSeverityToColor(severity)`, `deduplicateRecords(records)`.

## Acceptance Criteria

### Functional Requirements

1. **Automated Validation**: Incoming records automatically checked against all active validation rules for their resource type; results persisted within 500ms per record.
2. **Temporal Validation**: Date-of-birth cannot be later than admission date; discharge date cannot precede admission date; future dates flagged when inappropriate.
3. **Unit Standardization**: Blood pressure values detected in kPa automatically converted to mmHg; glucose in mmol/L converted to mg/dL; all conversions logged with audit trail.
4. **Quarantine Flow**: Records failing any critical or high-severity rule automatically quarantined; not passed to downstream analytics; flagged with specific failure reasons.
5. **Manual Review**: Quarantined records displayed in dedicated queue with severity-sorted view; administrators can fix, reject, or override each record with mandatory rationale.
6. **Bulk Actions**: Administrators can multi-select quarantine records and apply batch resolution (approve/reject) with single rationale entry.
7. **Ingestion Metrics**: Dashboard displays real-time pass rate, quarantine count, orphan node count, and throughput; trend data available for 1h, 24h, 7d, 30d windows.
8. **Failure Breakdown**: Bar chart shows top failure reasons by percentage; clicking a reason filters the quarantine queue to records failing that specific rule.
9. **Orphan Node Detection**: After each batch ingestion, Neo4j query identifies nodes with no relationships; results displayed with candidate parent suggestions and confidence scores.
10. **Orphan Resolution**: Administrators can link orphan nodes to suggested parent nodes with one click; relationship created in Neo4j graph.
11. **Validation Rule CRUD**: Administrators can create, edit, enable/disable, and test validation rules without developer intervention.
12. **Rule Testing**: New or modified rules can be tested against a sample dataset before activation; test results show pass/fail breakdown.
13. **Data Source Configuration**: Hospital-specific data sources can be configured with connection parameters, field mappings, and ingestion schedules.
14. **Field Mapping**: Source fields can be mapped to platform schema with optional transformation rules; AI-suggested mappings provided.

### Non-Functional Requirements

1. **Performance**: Ingestion pipeline processes >= 10,000 records/minute; individual record validation < 500ms; dashboard loads in < 2 seconds.
2. **Reliability**: BullMQ jobs survive worker restarts; failed jobs retry 3 times with exponential backoff; dead-letter queue for permanently failed records.
3. **Scalability**: BullMQ workers horizontally scalable; Neo4j orphan detection parallelized by node type; Redis caching for validation rule lookups.
4. **Accessibility**: WCAG 2.1 AA compliant; quarantine actions keyboard-navigable; screen reader labels for all severity indicators and metric cards.
5. **Security**: PHI fields encrypted at rest and in transit; quarantine resolution actions audited; validation rule changes logged with user attribution.
6. **Observability**: Structured logging for all pipeline stages; distributed tracing for end-to-end record flow; Prometheus metrics exported for throughput, error rates, queue depth.

## Modified Files

```
app/
├── (dashboard)/
│   └── data-ingestion/
│       ├── page.tsx                              ⬜
│       ├── layout.tsx                            ⬜
│       ├── loading.tsx                           ⬜
│       ├── error.tsx                             ⬜
│       ├── quarantine/
│       │   ├── page.tsx                          ⬜
│       │   └── [recordId]/page.tsx               ⬜
│       ├── rules/
│       │   ├── page.tsx                          ⬜
│       │   └── [ruleId]/page.tsx                 ⬜
│       ├── sources/
│       │   ├── page.tsx                          ⬜
│       │   └── [sourceId]/page.tsx               ⬜
│       └── components/
│           ├── IngestionDashboard.tsx             ⬜
│           ├── IngestionQualityOverview.tsx       ⬜
│           ├── ActiveIngestionJobs.tsx            ⬜
│           ├── IngestionJobRow.tsx                ⬜
│           ├── QuarantineQueue.tsx                ⬜
│           ├── QuarantineRecordRow.tsx            ⬜
│           ├── QuarantineDetailPanel.tsx          ⬜
│           ├── ValidationFailureBreakdown.tsx     ⬜
│           ├── ValidationRuleManager.tsx          ⬜
│           ├── RuleEditorForm.tsx                 ⬜
│           ├── RuleTestRunner.tsx                 ⬜
│           ├── DataSourceConnector.tsx            ⬜
│           ├── FieldMappingInterface.tsx          ⬜
│           ├── OrphanNodeResolver.tsx             ⬜
│           └── hooks/
│               ├── useIngestionMetrics.ts         ⬜
│               ├── useIngestionJobs.ts            ⬜
│               ├── useQuarantineQueue.ts          ⬜
│               ├── useValidationRules.ts          ⬜
│               ├── useDataSources.ts              ⬜
│               └── useOrphanNodes.ts              ⬜
├── lib/
│   ├── api/
│   │   ├── ingestion-api.ts                      ⬜
│   │   ├── quarantine-api.ts                     ⬜
│   │   ├── validation-rules-api.ts               ⬜
│   │   └── data-sources-api.ts                   ⬜
│   ├── validators/
│   │   ├── clinical-validators.ts                ⬜
│   │   ├── demographic-validators.ts             ⬜
│   │   ├── financial-validators.ts               ⬜
│   │   └── unit-standardizer.ts                  ⬜
│   └── utils/
│       ├── ingestion-utils.ts                    ⬜
│       ├── unit-conversion-tables.ts             ⬜
│       └── fhir-parser.ts                        ⬜
├── types/
│   ├── ingestion.types.ts                        ⬜
│   ├── validation-rule.types.ts                  ⬜
│   ├── quarantine.types.ts                       ⬜
│   └── data-source.types.ts                      ⬜
└── services/
    └── ingestion/
        ├── DataIngestionPipeline.ts              ⬜
        ├── ValidationEngine.ts                   ⬜
        ├── StandardizationEngine.ts              ⬜
        ├── QuarantineManager.ts                  ⬜
        ├── OrphanDetector.ts                     ⬜
        └── IngestionJobProcessor.ts              ⬜
```

## Implementation Status
**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Foundation & Data Pipeline (Sprint 1-2)
- [ ] Define TypeScript interfaces for ingestion records, validation rules, quarantine records, data sources
- [ ] Implement `DataIngestionPipeline.ts` orchestrator with BullMQ job queue integration
- [ ] Build `ValidationEngine.ts` with JSONLogic rule execution and severity-based routing
- [ ] Build `StandardizationEngine.ts` with clinical unit conversion (mmHg/kPa, mg/dL/mmol/L, F/C)
- [ ] Implement `QuarantineManager.ts` for quarantine lifecycle (create, assign, resolve, audit)
- [ ] Build `fhir-parser.ts` for HL7 FHIR R4 resource parsing (Patient, Encounter, Observation, Claim)
- [ ] Set up BullMQ workers (`IngestionJobProcessor.ts`) with retry logic and dead-letter queue
- [ ] Create PostgreSQL migrations for `validation_rules`, `quarantine_records`, `ingestion_metrics`, `data_sources` tables
- [ ] Define Neo4j schema constraints and indexes for healthcare entity nodes

### Phase 2: Neo4j Integration & Orphan Detection (Sprint 3)
- [ ] Implement `OrphanDetector.ts` with Cypher queries for disconnected node identification
- [ ] Build candidate relationship suggestion algorithm using property matching and confidence scoring
- [ ] Create Neo4j relationship creation API for orphan resolution
- [ ] Integrate orphan detection as post-ingestion BullMQ job step
- [ ] Build unit tests for orphan detection across all node types (Patient, Encounter, Practitioner, etc.)

### Phase 3: Frontend Dashboard & Quarantine UI (Sprint 4-5)
- [ ] Build `IngestionDashboard.tsx` server component with initial data fetch
- [ ] Implement `IngestionQualityOverview.tsx` with four metric cards (pass rate, quarantine, orphans, throughput)
- [ ] Build `ActiveIngestionJobs.tsx` with WebSocket connection and live progress bars
- [ ] Implement `QuarantineQueue.tsx` with server-side pagination, filtering, sorting, multi-select
- [ ] Build `QuarantineDetailPanel.tsx` slide-in panel with original vs. fix diff view
- [ ] Implement `ValidationFailureBreakdown.tsx` bar chart with click-to-filter interaction
- [ ] Build `ValidationRuleManager.tsx` with CRUD interface and category tabs
- [ ] Implement `RuleEditorForm.tsx` with JSONLogic expression builder (visual + raw modes)
- [ ] Build `RuleTestRunner.tsx` for testing rules against sample datasets
- [ ] Implement `DataSourceConnector.tsx` with connection configuration and test-connection flow
- [ ] Build `FieldMappingInterface.tsx` with drag-and-drop field mapping and AI suggestions
- [ ] Implement `OrphanNodeResolver.tsx` with candidate parent suggestions and one-click linking

### Phase 4: Polish, Testing & Deployment (Sprint 6)
- [ ] Write unit tests for `ValidationEngine`, `StandardizationEngine`, `unit-standardizer`, `clinical-validators`
- [ ] Write integration tests for end-to-end ingestion pipeline (ingest -> validate -> standardize -> persist/quarantine)
- [ ] Write E2E tests (Playwright) for quarantine review workflow, rule creation workflow, source configuration
- [ ] Performance testing: validate 10,000 records/minute throughput target
- [ ] Accessibility audit (axe-core) for all dashboard components
- [ ] Security audit: PHI encryption verification, RBAC enforcement, audit trail completeness
- [ ] Load testing: simulate concurrent ingestion from 5 hospital data sources

## Dependencies

### Internal Dependencies
- **Story 08** (Data Quality & Governance Dashboard): Ingestion metrics feed into the governance dashboard
- **Story 13** (Configure Module Data Requirements): Field requirements define what the ingestion pipeline validates against
- **Authentication & RBAC**: `data_administrator` role must exist for quarantine resolution permissions
- **Neo4j Schema**: Base graph schema (node types, relationship types) must be defined
- **Shared UI Components**: `MetricCard`, `DataTable`, `SlidePanel`, `BadgeIndicator` from design system

### External Dependencies
- **Neo4j Aura** or self-hosted Neo4j 5.x for graph database operations
- **BullMQ** (v5+) + Redis (v7+) for job queue processing
- **Claude API** for fuzzy field mapping suggestions and ambiguous value resolution
- **Recharts** (v2.x) for chart visualizations (bar chart, trend lines)
- **JSONLogic** library for validation rule expression evaluation
- **HL7 FHIR R4 specification** for resource parsing schemas

## Risk Assessment

### Technical Risks

1. **Neo4j Orphan Detection at Scale**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Paginate orphan detection queries by node type; use APOC library for batch processing; set query timeout at 30 seconds
   - Contingency: Fall back to PostgreSQL-based orphan detection using foreign key gap analysis

2. **BullMQ Worker Throughput Bottleneck**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Horizontal scaling of workers; batch processing (100 records per job); Redis Cluster for queue scalability
   - Contingency: Switch to AWS SQS + Lambda for auto-scaling ingestion processing

3. **HL7 FHIR Parser Compatibility**
   - Impact: Medium
   - Likelihood: High
   - Mitigation: Start with FHIR R4 only; use HAPI FHIR validator for schema compliance; build extensible parser architecture
   - Contingency: Require hospitals to provide data in simplified CSV format with pre-defined schema

4. **Claude API Latency for Field Mapping Suggestions**
   - Impact: Low
   - Likelihood: Medium
   - Mitigation: Make AI suggestions asynchronous (background job); cache common mapping suggestions; show manual mapping immediately with AI suggestions appearing when ready
   - Contingency: Disable AI suggestions; rely on rule-based field matching

### Business Risks

1. **Hospital Data Format Variance**
   - Impact: High
   - Likelihood: High
   - Mitigation: Hybrid SaaS model (70% standard / 30% customizable); extensive field mapping configuration; implementation consultant-guided setup
   - Contingency: Offer professional services engagement for complex data source integrations

2. **Quarantine Queue Overwhelm During Initial Onboarding**
   - Impact: Medium
   - Likelihood: High
   - Mitigation: Allow rule severity adjustment; bulk resolution tools; progressive rule enablement; start with critical rules only
   - Contingency: Automatic rule relaxation mode that widens thresholds during initial 30-day onboarding period

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
describe('ValidationEngine', () => {
  it('should flag DOB later than admission date as temporal violation', () => {});
  it('should pass record when all required fields present', () => {});
  it('should apply multiple rules in priority order', () => {});
  it('should route critical failures to quarantine immediately', () => {});
});

describe('StandardizationEngine', () => {
  it('should convert blood pressure from kPa to mmHg correctly', () => {});
  it('should convert glucose from mmol/L to mg/dL correctly', () => {});
  it('should convert temperature from Fahrenheit to Celsius correctly', () => {});
  it('should log all conversions with before/after values', () => {});
  it('should handle unknown units gracefully with quarantine flag', () => {});
});

describe('OrphanDetector', () => {
  it('should identify nodes with no relationships as orphans', () => {});
  it('should suggest candidate parents based on property matching', () => {});
  it('should assign confidence scores to candidate relationships', () => {});
});
```

### Integration Tests (Supertest + Testcontainers)
```typescript
describe('Ingestion Pipeline E2E', () => {
  it('should process a FHIR Bundle through validate -> standardize -> persist', () => {});
  it('should quarantine records failing critical rules and not persist them', () => {});
  it('should detect orphan nodes after batch ingestion', () => {});
  it('should resolve quarantined record and re-ingest into pipeline', () => {});
});
```

### E2E Tests (Playwright)
```typescript
test.describe('Data Ingestion Dashboard', () => {
  test('should display real-time ingestion metrics on dashboard', async ({ page }) => {});
  test('should review and fix quarantined record via detail panel', async ({ page }) => {});
  test('should create new validation rule and test against sample data', async ({ page }) => {});
  test('should configure new data source with field mappings', async ({ page }) => {});
  test('should resolve orphan node by linking to suggested parent', async ({ page }) => {});
});
```

## Performance Considerations

### Pipeline Throughput
- BullMQ batch processing: 100 records per job to reduce queue overhead
- Redis pipeline commands for bulk validation rule lookups
- PostgreSQL batch inserts with `INSERT ... ON CONFLICT` for idempotent persistence
- Neo4j batch graph writes using UNWIND for multi-record ingestion

### Dashboard Performance
- Server components for initial dashboard render (zero client JS for static metrics)
- WebSocket for real-time job updates (avoid polling overhead)
- Virtualized table rendering for quarantine queue (react-window) when > 100 records visible
- Chart data aggregated server-side; only summary data sent to client
- Redis caching of aggregated metrics with 30-second TTL

### Database Optimization
- PostgreSQL indexes on `quarantine_records(hospital_id, severity, status)` and `ingestion_metrics(hospital_id, timeframe)`
- Neo4j composite indexes on `(hospitalId, batchId)` for orphan detection queries
- Redis sorted sets for validation rule priority ordering
- Connection pooling: PostgreSQL (pgBouncer), Neo4j (bolt driver pool), Redis (ioredis cluster)

## Deployment Plan

### Development Phase
- Feature flag: `FEATURE_DATA_INGESTION_PIPELINE` controls visibility of entire module
- Docker Compose with PostgreSQL, Neo4j, Redis, BullMQ for local development
- Seed data: 10,000 synthetic hospital records via Faker.js + FHIR resource generators
- Mock FHIR endpoint for integration testing

### Staging Phase
- Deploy to AWS ECS staging cluster with production-like configuration
- Load test with 50,000 records across 3 simulated hospital data sources
- Validate WebSocket reliability under sustained connection (1-hour test)
- Security penetration testing on ingestion API endpoints
- Verify PHI encryption at rest using AWS KMS key rotation

### Production Phase
- Canary release to single pilot hospital (10% traffic)
- Monitor ingestion throughput, error rates, quarantine queue depth for 48 hours
- Gradual rollout: 25% -> 50% -> 100% of onboarded hospitals over 2 weeks
- Rollback trigger: error rate > 5% or throughput < 5,000 records/minute
- On-call rotation for first 2 weeks post-launch

## Monitoring & Analytics

### Performance Metrics
- Ingestion throughput (records/minute) per hospital and globally
- Validation engine p50/p95/p99 latency per rule category
- BullMQ queue depth, processing time, failure rate
- WebSocket connection count and message throughput
- Neo4j query execution time for orphan detection

### Business Metrics
- Pass rate trends over time per hospital (target: 95%+ within 90 days)
- Quarantine resolution time (mean, p95) per severity level
- Top 10 failure reasons across all hospitals (product improvement signal)
- Orphan node resolution rate (linked vs. dismissed)
- Data source health uptime percentage

### Technical Metrics
- AWS ECS task CPU/memory utilization for ingestion workers
- Redis memory usage and eviction rates
- PostgreSQL connection pool utilization
- Neo4j heap usage and page cache hit ratio
- API endpoint response times (p50/p95/p99)

### Alerting Rules
- Quarantine queue > 1,000 pending records -> PagerDuty alert
- Ingestion throughput < 5,000 records/minute for > 5 minutes -> Warning
- BullMQ dead-letter queue > 100 records -> Critical alert
- Data source health status changed to `error` -> Immediate alert
- Pass rate drops below 80% for any hospital -> Warning alert

## Documentation Requirements

### Technical Documentation
- Ingestion pipeline architecture diagram (data flow from source to Neo4j/PostgreSQL)
- Validation rule DSL reference guide (JSONLogic syntax + custom operators)
- Unit conversion table reference (all supported clinical unit conversions)
- HL7 FHIR R4 resource mapping guide (supported resources and field extraction)
- Neo4j graph schema documentation (node types, relationship types, property schemas)
- BullMQ job configuration reference (retry policies, concurrency, rate limits)

### User Documentation
- Data Administrator Guide: managing quarantine queue, creating validation rules, configuring data sources
- Implementation Consultant Guide: setting up new hospital data sources, field mapping best practices
- Data Quality Metrics Interpretation Guide: understanding pass rates, failure reasons, orphan nodes
- Troubleshooting Guide: common ingestion errors, connection failures, data format issues

## Post-Launch Review

### Success Criteria
- Ingestion pipeline maintains >= 10,000 records/minute throughput under production load
- Pass rate reaches >= 95% within 90 days for pilot hospital
- Mean quarantine resolution time < 24 hours
- Zero PHI data exposure incidents
- Dashboard load time < 2 seconds at p95
- Orphan node detection identifies >= 90% of disconnected records (validated against manual audit)

### Retrospective Items
- Evaluate whether JSONLogic is sufficient for complex multi-field validation rules or if custom DSL is needed
- Assess Claude API cost for field mapping suggestions at scale; determine if caching reduces cost sufficiently
- Review BullMQ vs. AWS SQS+Lambda cost/performance tradeoff based on production data
- Gather implementation consultant feedback on field mapping UX for onboarding efficiency
- Analyze quarantine queue patterns to identify candidates for automatic resolution rules
