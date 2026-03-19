# 06 Run What-If Foresight Simulations - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **hospital director**, I want to **create and run what-if simulation scenarios across hospital operations**, so that I can **understand the cascading impact of decisions before implementing them and prevent problems before they happen**.

## Pre-conditions
- All five operational modules (staffing, bed allocation, supply chain, finance, anomaly detection) have functional API endpoints providing current-state data
- Neo4j graph database is populated with cross-module dependency relationships (e.g., staffing --> bed capacity --> revenue)
- Historical operational data (minimum 12 months) is available in PostgreSQL for trend modeling and baseline calculations
- Claude API integration is active for natural language scenario input processing and result interpretation
- BullMQ infrastructure is deployed for long-running simulation job processing
- User authentication and RBAC system supports the `director` role with simulation permissions
- Data science layer has trained models for staffing forecasting, demand prediction, and cost projection

## Business Requirements
- **Enable data-driven strategic decisions** by quantifying cascading impacts before implementation
  - Success Metric: 90% of major operational decisions preceded by at least one simulation run
- **Reduce unintended consequences** of operational changes
  - Success Metric: 50% reduction in reactive operational adjustments within 6 months of adoption
- **Accelerate decision-making cycles** by replacing manual impact analysis with automated simulation
  - Success Metric: Decision impact analysis time reduced from 2 weeks to under 1 hour
- **Create competitive differentiation** for Southeast Asian healthcare market
  - Success Metric: Simulation capability cited as top-3 purchase driver by 70% of new clients
- **Build institutional scenario library** for repeated decision patterns
  - Success Metric: Average hospital maintains library of 20+ saved scenarios within first year

## Technical Specifications

### Integration Points
- **Staffing Module API** (`/api/v1/staffing`): Read current rosters, shift patterns, skill matrices, cost-per-FTE for staffing variable adjustments
- **Bed Allocation Module API** (`/api/v1/beds`): Read ward configurations, occupancy rates, bed types, turnover times for capacity simulations
- **Supply Chain Module API** (`/api/v1/supply-chain`): Read supplier contracts, inventory levels, lead times, consumption rates for supply simulations
- **Finance Module API** (`/api/v1/finance`): Read revenue streams, cost centers, budget allocations, margin calculations for financial impact projection
- **Anomaly Detection Module** (Story 05): Simulation results feed into anomaly detection for identifying risk thresholds in projected scenarios
- **Neo4j Graph DB**: Query cross-module dependency graph to determine cascading impact paths (e.g., `STAFFING -[IMPACTS]-> BEDS -[IMPACTS]-> REVENUE`)
- **Claude API**: Parse natural language scenario descriptions, generate narrative summaries of simulation results, explain confidence intervals
- **BullMQ Job Queues**: `simulation-execution-queue`, `simulation-cascade-queue`, `simulation-report-queue`
- **Redis**: Cache intermediate simulation results, store simulation progress state for real-time progress reporting

### Security Requirements
- **HIPAA-Adjacent Compliance**: Simulations using real patient census data must anonymize/aggregate all patient identifiers before processing
- **Data Encryption**: Scenario configurations and results encrypted at rest (AES-256); financial projections treated as confidential data
- **RBAC Enforcement**: Only `director`, `admin`, and `finance_manager` roles can create/run simulations; `viewer` role can only see shared simulation results
- **Audit Logging**: Every simulation creation, execution, modification, share, and deletion logged with actor, timestamp, scenario parameters
- **Data Isolation**: Simulations operate on cloned/snapshot data; no simulation writes to production operational tables
- **Scenario Access Control**: Private by default; explicit sharing required; shared scenarios are read-only unless creator grants edit permission
- **Rate Limiting**: Maximum 5 concurrent simulation jobs per user to prevent resource exhaustion

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  HEADER: Medical Pro - Foresight Simulation Engine                 |
+------------------------------------------------------------------+
|                                                                    |
|  +--SCENARIO BUILDER (Top Section)-----------------------------+  |
|  |                                                              |  |
|  |  Scenario Name: [Q1 Staffing Reduction Analysis___________]  |  |
|  |                                                              |  |
|  |  +--VARIABLE CARDS (horizontal scroll)-------------------+   |  |
|  |  | [+ Staffing]  [+ Beds]  [+ Supply]  [+ Finance]      |   |  |
|  |  |                                                        |   |  |
|  |  | +--CARD----------+ +--CARD----------+ +--CARD------+  |   |  |
|  |  | | STAFFING       | | BED ALLOC      | | FINANCE    |  |   |  |
|  |  | | Reduce Nurses  | | Close Ward B   | | (auto)     |  |   |  |
|  |  | | -20 FTE        | | -30 beds       | | projected  |  |   |  |
|  |  | | Dec 2025       | | Jan 2026       | |            |  |   |  |
|  |  | | [Edit] [x]     | | [Edit] [x]     | | [locked]   |  |   |  |
|  |  | +-----------------+ +-----------------+ +------------+  |   |  |
|  |  +--------------------------------------------------------+   |  |
|  |                                                              |  |
|  |  [Run Simulation]  [Save Draft]  [Load Template]             |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--RESULTS PANEL (Below, appears after simulation)------------+  |
|  |                                                              |  |
|  |  +--IMPACT SUMMARY (4 cards)-----------------------------+   |  |
|  |  | Staffing Impact | Bed Impact | Supply Impact | Revenue |  |  |
|  |  | -20 FTE         | -12% cap   | +5% cost     | -$340K  |  |  |
|  |  | HIGH RISK       | MED RISK   | LOW RISK     | HIGH    |  |  |
|  |  +--------------------------------------------------------+   |  |
|  |                                                              |  |
|  |  +--CASCADE FLOW DIAGRAM---------------------------------+   |  |
|  |  |  [Nurses -20] --> [Ward B Close] --> [Beds -30]       |   |  |
|  |  |       |                                  |             |   |  |
|  |  |       v                                  v             |   |  |
|  |  |  [Overtime +35%] --> [Cost +$120K] --> [Rev -$340K]   |   |  |
|  |  +--------------------------------------------------------+   |  |
|  |                                                              |  |
|  |  +--BEFORE/AFTER COMPARISON------------------------------+   |  |
|  |  |  Module     | Current  | Projected | Delta  | Risk    |   |  |
|  |  |  Staffing   | 200 FTE  | 180 FTE   | -20    | High    |   |  |
|  |  |  Beds       | 500      | 470       | -30    | Medium  |   |  |
|  |  |  Overtime   | $80K/mo  | $200K/mo  | +150%  | High    |   |  |
|  |  |  Revenue    | $2.1M/mo | $1.76M/mo | -$340K | High    |   |  |
|  |  +--------------------------------------------------------+   |  |
|  |                                                              |  |
|  |  +--CONFIDENCE INTERVALS---------------------------------+   |  |
|  |  |  Revenue Impact: -$340K (90% CI: -$280K to -$410K)    |   |  |
|  |  |  [||||||||||||||||░░░░]                                |   |  |
|  |  +--------------------------------------------------------+   |  |
|  |                                                              |  |
|  |  [Compare Scenarios]  [Share]  [Export PDF]  [Save]          |  |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
SimulationPage
├── SimulationPageHeader
│   ├── BreadcrumbNav
│   └── SimulationModeToggle (builder / comparison / history)
├── ScenarioBuilder
│   ├── ScenarioNameInput
│   ├── ScenarioDescriptionInput
│   ├── VariableCardStrip
│   │   ├── AddVariableButton (per module)
│   │   └── VariableCard (repeating)
│   │       ├── VariableCardHeader (module icon + name)
│   │       ├── VariableParameterForm
│   │       │   ├── VariableSlider
│   │       │   ├── VariableNumberInput
│   │       │   ├── VariableDatePicker
│   │       │   └── VariableDropdownSelect
│   │       └── VariableCardActions (edit, remove)
│   ├── NaturalLanguageInput
│   │   └── ClaudeParseIndicator
│   └── ScenarioActionBar
│       ├── RunSimulationButton
│       ├── SaveDraftButton
│       └── LoadTemplateButton
├── SimulationProgressOverlay
│   ├── ProgressBar
│   ├── StageIndicator
│   └── EstimatedTimeRemaining
├── SimulationResultsPanel
│   ├── ImpactSummaryStrip
│   │   └── ImpactSummaryCard (repeating)
│   │       ├── ModuleIcon
│   │       ├── ImpactValue
│   │       ├── ImpactDelta
│   │       └── RiskLevelBadge
│   ├── CascadeFlowDiagram
│   │   ├── CascadeNode (repeating)
│   │   └── CascadeEdge (repeating)
│   ├── BeforeAfterComparisonTable
│   │   └── ComparisonRow (repeating)
│   ├── ConfidenceIntervalChart
│   │   └── ConfidenceBar (repeating)
│   ├── SimulationNarrativeSummary
│   │   └── ClaudeGeneratedInsight
│   └── ResultsActionBar
│       ├── CompareScenarioButton
│       ├── ShareButton
│       ├── ExportPdfButton
│       └── SaveResultsButton
├── ScenarioComparisonView
│   ├── ScenarioSelectorBar
│   │   └── ScenarioChip (repeating)
│   ├── SideBySideComparisonGrid
│   │   └── ComparisonColumn (repeating)
│   └── ComparisonDeltaHighlights
├── ScenarioLibrary
│   ├── LibrarySearchBar
│   ├── LibraryFilterTabs (my scenarios / shared / templates)
│   └── ScenarioLibraryCard (repeating)
│       ├── ScenarioMetadata
│       ├── ScenarioTags
│       └── ScenarioQuickActions
└── SimulationHistoryTimeline
    └── HistoryEntry (repeating)
```

### Design System Compliance
- **Primary Background**: `ink` (#031926) for page and panel backgrounds
- **Scenario Builder**: `ink-light` (#0A2A3C) card backgrounds with `teal` (#007B7A) accent border on active variable cards
- **Variable Cards**: White/5 glassmorphism with module-specific accent colors:
  - Staffing: `cerulean` (#00B3C6)
  - Beds: `teal` (#007B7A)
  - Supply Chain: `gold` (#C9A84A)
  - Finance: `#8B5CF6` (purple-500 for financial indicators)
- **Run Simulation Button**: Gradient from `teal` to `cerulean` with hover brightness increase; disabled state at 40% opacity
- **Impact Summary Cards**: Risk-level color coding: High = `#DC2626`, Medium = `gold`, Low = `teal`
- **Cascade Flow Diagram**: Nodes styled as rounded rect with module color; edges as animated dashed lines using `stroke-dashoffset` animation
- **Confidence Intervals**: `teal` fill for range bar, `gold` marker for point estimate
- **Headings**: Merriweather, 600 weight, white for primary headings, `cerulean` for section headings
- **Body Text**: Inter, 400 weight, `#E2E8F0` for primary, `#94A3B8` for secondary/metadata
- **Comparison Table**: Alternating row backgrounds `ink`/`ink-light`, delta cells colored by direction (positive green, negative red)

### Responsive Behavior
- **Desktop (xl: 1280px+)**: Full scenario builder with 4-across variable cards, results panel below with side-by-side comparison
- **Large Tablet (lg: 1024px)**: Variable cards 3-across, comparison mode stacks to tabbed view instead of side-by-side
- **Tablet (md: 768px)**: Variable cards 2-across, cascade flow diagram simplifies to vertical list, comparison table scrolls horizontally
- **Mobile (sm: 640px)**: Single-column layout, variable cards full-width stacked, simplified results with expandable sections, cascade diagram as numbered text list
- **Breakpoint Classes**: Variable strip `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, results grid `grid-cols-2 md:grid-cols-4`

### Interaction Patterns
- **Natural Language Input**: Director types "What if I reduce nursing staff by 20 in December?" -> Claude parses into structured variable cards with loading shimmer during parsing
- **Variable Card Creation**: Click "+" button for module, opens slide-up form with parameter inputs; form validates ranges (e.g., staff reduction 1-500, date must be future)
- **Variable Slider**: Draggable slider with real-time value display; snap points at meaningful intervals (5, 10, 25, 50 for staff counts)
- **Run Simulation**: Button shows pulsing state, progress overlay appears with stage indicators (Validating -> Computing Staffing Impact -> Computing Bed Impact -> Computing Financial Impact -> Generating Narrative -> Complete)
- **Simulation Progress**: Real-time progress via WebSocket/SSE, estimated time displayed, cancel button available
- **Results Reveal**: Impact cards animate in with staggered `fadeIn` (200ms delay between cards), cascade diagram draws edges progressively
- **Cascade Flow Interaction**: Hover on node highlights all connected edges and downstream impacts; click node to see detailed breakdown
- **Comparison Mode**: Drag scenario cards to comparison slots (max 4); synchronized scrolling on comparison table
- **Share Flow**: Modal with user search, permission level (view/comment), and optional message; generates shareable link
- **Export PDF**: Server-side PDF generation via Puppeteer/Playwright screenshot of results panel with formatted headers and footers
- **Loading States**: Skeleton cards during initial load, shimmer effect on Claude NLP parsing, progress bar during simulation
- **Error States**: Simulation failure shows error type (timeout, data unavailable, dependency error) with retry option

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── simulations/
│       ├── page.tsx                              # SimulationPage (server component - scenario library)
│       ├── loading.tsx                           # Skeleton for library page
│       ├── error.tsx                             # Error boundary
│       ├── layout.tsx                            # Simulation section layout
│       ├── new/
│       │   └── page.tsx                          # New scenario builder page
│       ├── [scenarioId]/
│       │   ├── page.tsx                          # Scenario detail / results view
│       │   ├── edit/
│       │   │   └── page.tsx                      # Edit existing scenario
│       │   └── compare/
│       │       └── page.tsx                      # Comparison view
│       ├── compare/
│       │   └── page.tsx                          # Multi-scenario comparison
│       ├── _components/
│       │   ├── SimulationPageHeader.tsx           # Page header with mode toggle
│       │   ├── ScenarioBuilder.tsx                # Main scenario builder container
│       │   ├── ScenarioNameInput.tsx              # Scenario title input
│       │   ├── VariableCardStrip.tsx              # Horizontal variable card layout
│       │   ├── VariableCard.tsx                   # Individual variable card
│       │   ├── VariableParameterForm.tsx          # Variable configuration form
│       │   ├── VariableSlider.tsx                 # Slider input for numeric variables
│       │   ├── NaturalLanguageInput.tsx           # Claude NLP scenario input
│       │   ├── ClaudeParseIndicator.tsx           # NLP parsing status indicator
│       │   ├── ScenarioActionBar.tsx              # Run/Save/Load buttons
│       │   ├── RunSimulationButton.tsx            # Primary CTA with states
│       │   ├── SimulationProgressOverlay.tsx      # Progress modal during execution
│       │   ├── ProgressStageIndicator.tsx         # Stage-by-stage progress
│       │   ├── SimulationResultsPanel.tsx         # Results container
│       │   ├── ImpactSummaryStrip.tsx             # Impact summary cards row
│       │   ├── ImpactSummaryCard.tsx              # Individual impact card
│       │   ├── RiskLevelBadge.tsx                 # Risk level indicator
│       │   ├── CascadeFlowDiagram.tsx             # Dependency cascade visualization
│       │   ├── CascadeNode.tsx                    # Individual cascade node
│       │   ├── CascadeEdge.tsx                    # Connection between nodes
│       │   ├── BeforeAfterComparisonTable.tsx     # Comparison data table
│       │   ├── ComparisonRow.tsx                  # Individual comparison row
│       │   ├── ConfidenceIntervalChart.tsx        # Confidence interval bars
│       │   ├── SimulationNarrativeSummary.tsx     # Claude-generated narrative
│       │   ├── ResultsActionBar.tsx               # Compare/Share/Export buttons
│       │   ├── ScenarioComparisonView.tsx         # Side-by-side comparison
│       │   ├── ScenarioSelectorBar.tsx            # Scenario picker for comparison
│       │   ├── SideBySideComparisonGrid.tsx       # Comparison grid layout
│       │   ├── ScenarioLibrary.tsx                # Saved scenario browser
│       │   ├── ScenarioLibraryCard.tsx            # Library item card
│       │   ├── ShareScenarioDialog.tsx            # Share modal
│       │   └── ExportPdfButton.tsx                # PDF export trigger
│       ├── _hooks/
│       │   ├── useScenarioBuilder.ts              # Scenario builder state management
│       │   ├── useSimulationExecution.ts          # Simulation run lifecycle
│       │   ├── useSimulationProgress.ts           # Real-time progress tracking
│       │   ├── useSimulationResults.ts            # Results data fetching
│       │   ├── useScenarioLibrary.ts              # Scenario CRUD operations
│       │   ├── useScenarioComparison.ts           # Multi-scenario comparison logic
│       │   ├── useNaturalLanguageParse.ts         # Claude NLP parsing hook
│       │   └── useCascadeGraph.ts                 # Neo4j cascade data fetching
│       └── _utils/
│           ├── simulation-types.ts                # TypeScript type definitions
│           ├── simulation-validators.ts           # Variable validation logic
│           ├── cascade-layout.ts                  # Graph layout calculations
│           ├── confidence-interval.ts             # CI calculation helpers
│           └── scenario-templates.ts              # Built-in scenario templates
├── api/
│   └── v1/
│       └── simulations/
│           ├── route.ts                           # GET list / POST create scenario
│           ├── [scenarioId]/
│           │   ├── route.ts                       # GET/PATCH/DELETE scenario
│           │   ├── run/
│           │   │   └── route.ts                   # POST trigger simulation
│           │   ├── results/
│           │   │   └── route.ts                   # GET simulation results
│           │   ├── share/
│           │   │   └── route.ts                   # POST share scenario
│           │   └── export/
│           │       └── route.ts                   # GET export PDF
│           ├── compare/
│           │   └── route.ts                       # POST compare scenarios
│           ├── parse-nlp/
│           │   └── route.ts                       # POST natural language parse
│           ├── progress/
│           │   └── route.ts                       # SSE simulation progress
│           └── templates/
│               └── route.ts                       # GET built-in templates
lib/
├── simulation/
│   ├── simulation-engine.ts                       # Core simulation engine
│   ├── simulation-types.ts                        # Shared type definitions
│   ├── cascade-calculator.ts                      # Cross-module cascade logic
│   ├── confidence-calculator.ts                   # Confidence interval computation
│   ├── module-impact/
│   │   ├── staffing-impact.ts                     # Staffing impact model
│   │   ├── bed-impact.ts                          # Bed allocation impact model
│   │   ├── supply-chain-impact.ts                 # Supply chain impact model
│   │   └── finance-impact.ts                      # Financial impact model
│   └── scenario-templates.ts                      # Template definitions
```

### State Management Architecture
```typescript
// ===== Global State (Zustand Store) =====

interface SimulationGlobalState {
  activeScenario: Scenario | null;
  scenarioLibrary: ScenarioSummary[];
  simulationStatus: SimulationStatus;
  simulationProgress: SimulationProgress | null;
  comparisonScenarios: string[];             // scenario IDs for comparison
}

// ===== Scenario Definition =====

interface Scenario {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;                         // ISO 8601
  updatedAt: string;
  status: ScenarioStatus;
  variables: SimulationVariable[];
  results: SimulationResults | null;
  metadata: ScenarioMetadata;
  sharing: ScenarioSharing;
}

type ScenarioStatus = 'draft' | 'ready' | 'running' | 'completed' | 'failed';

interface ScenarioMetadata {
  tags: string[];
  baselineDate: string;                      // snapshot date for current-state data
  simulationHorizon: string;                 // e.g., "6_months", "1_year"
  version: number;
  templateId: string | null;
}

interface ScenarioSharing {
  visibility: 'private' | 'shared' | 'organization';
  sharedWith: SharedRecipient[];
}

interface SharedRecipient {
  userId: string;
  userName: string;
  permission: 'view' | 'comment' | 'edit';
  sharedAt: string;
}

// ===== Simulation Variables =====

interface SimulationVariable {
  id: string;
  module: HospitalModule;
  parameterType: VariableParameterType;
  label: string;                             // human-readable label
  description: string;
  currentValue: number | string;
  adjustedValue: number | string;
  unit: string;                              // e.g., "FTE", "beds", "USD", "%"
  effectiveDate: string;                     // when change takes effect
  constraints: VariableConstraints;
}

type HospitalModule =
  | 'staffing'
  | 'bed-allocation'
  | 'supply-chain'
  | 'finance';

type VariableParameterType =
  | 'staff_count'
  | 'staff_skill_mix'
  | 'ward_status'
  | 'bed_count'
  | 'supplier_change'
  | 'inventory_level'
  | 'budget_allocation'
  | 'service_line'
  | 'custom';

interface VariableConstraints {
  min: number;
  max: number;
  step: number;
  validation: string;                        // validation rule expression
}

// ===== Simulation Results =====

interface SimulationResults {
  scenarioId: string;
  executedAt: string;
  executionDurationMs: number;
  moduleImpacts: ModuleImpact[];
  cascadeGraph: CascadeGraph;
  confidenceIntervals: ConfidenceInterval[];
  narrativeSummary: string;                  // Claude-generated narrative
  riskAssessment: RiskAssessment;
  beforeAfterComparison: ComparisonEntry[];
}

interface ModuleImpact {
  module: HospitalModule;
  metrics: ImpactMetric[];
  overallRisk: RiskLevel;
  summary: string;
}

interface ImpactMetric {
  name: string;                              // e.g., "Nurse-to-Patient Ratio"
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  unit: string;
  direction: 'positive' | 'negative' | 'neutral';
  risk: RiskLevel;
}

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

// ===== Cascade Graph =====

interface CascadeGraph {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
}

interface CascadeNode {
  id: string;
  module: HospitalModule;
  label: string;
  value: string;
  risk: RiskLevel;
  isDirectChange: boolean;                   // user-defined vs. cascaded
  position: { x: number; y: number };
}

interface CascadeEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;                             // e.g., "-20 FTE causes..."
  impact: 'direct' | 'indirect';
  strength: number;                          // 0-1 impact strength
}

// ===== Confidence Intervals =====

interface ConfidenceInterval {
  metric: string;
  pointEstimate: number;
  lowerBound: number;                        // 90% CI lower
  upperBound: number;                        // 90% CI upper
  confidenceLevel: number;                   // e.g., 0.90
  unit: string;
}

// ===== Risk Assessment =====

interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationSuggestions: string[];           // Claude-generated
}

interface RiskFactor {
  description: string;
  module: HospitalModule;
  severity: RiskLevel;
  likelihood: number;                        // 0-1
}

// ===== Comparison =====

interface ComparisonEntry {
  module: HospitalModule;
  metric: string;
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  risk: RiskLevel;
  unit: string;
}

interface ScenarioComparison {
  scenarios: Scenario[];
  comparisonMatrix: ComparisonMatrixRow[];
  recommendation: string;                    // Claude-generated recommendation
}

interface ComparisonMatrixRow {
  metric: string;
  module: HospitalModule;
  unit: string;
  values: {
    scenarioId: string;
    scenarioName: string;
    value: number;
    delta: number;
    risk: RiskLevel;
  }[];
}

// ===== Simulation Progress =====

type SimulationStatus = 'idle' | 'running' | 'completed' | 'failed';

interface SimulationProgress {
  scenarioId: string;
  stage: SimulationStage;
  stageProgress: number;                     // 0-100
  overallProgress: number;                   // 0-100
  estimatedTimeRemainingMs: number;
  currentMessage: string;
}

type SimulationStage =
  | 'validating'
  | 'snapshotting_baseline'
  | 'computing_staffing'
  | 'computing_beds'
  | 'computing_supply_chain'
  | 'computing_finance'
  | 'calculating_cascades'
  | 'computing_confidence'
  | 'generating_narrative'
  | 'complete';

// ===== Scenario Summary (for library list) =====

interface ScenarioSummary {
  id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  variableCount: number;
  modules: HospitalModule[];
  overallRisk: RiskLevel | null;
  tags: string[];
}
```

### API Integration Schema
```typescript
// ===== GET /api/v1/simulations =====
// List scenarios with filtering

interface GetScenariosRequest {
  status?: ScenarioStatus[];
  modules?: HospitalModule[];
  createdBy?: string;
  visibility?: 'private' | 'shared' | 'organization';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface GetScenariosResponse {
  data: ScenarioSummary[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
  };
}

// ===== POST /api/v1/simulations =====
// Create a new scenario

interface CreateScenarioRequest {
  name: string;
  description?: string;
  variables: Omit<SimulationVariable, 'id'>[];
  metadata: {
    tags?: string[];
    baselineDate?: string;
    simulationHorizon: string;
    templateId?: string;
  };
}

interface CreateScenarioResponse {
  data: Scenario;
}

// ===== GET /api/v1/simulations/:scenarioId =====

interface GetScenarioDetailResponse {
  data: Scenario;
  availableVariables: AvailableVariable[];   // possible variables to add
}

interface AvailableVariable {
  module: HospitalModule;
  parameterType: VariableParameterType;
  label: string;
  description: string;
  currentValue: number | string;
  constraints: VariableConstraints;
  unit: string;
}

// ===== POST /api/v1/simulations/:scenarioId/run =====
// Trigger simulation execution

interface RunSimulationRequest {
  priority?: 'normal' | 'high';
}

interface RunSimulationResponse {
  success: boolean;
  jobId: string;
  estimatedDurationMs: number;
  scenarioId: string;
}

// ===== SSE /api/v1/simulations/progress?scenarioId=xxx =====
// Real-time simulation progress

type SimulationProgressEvent =
  | { type: 'progress'; data: SimulationProgress }
  | { type: 'stage_complete'; data: { stage: SimulationStage; durationMs: number } }
  | { type: 'simulation_complete'; data: { scenarioId: string; resultsSummary: ModuleImpact[] } }
  | { type: 'simulation_failed'; data: { scenarioId: string; error: string; stage: SimulationStage } }
  | { type: 'heartbeat'; data: { timestamp: string } };

// ===== GET /api/v1/simulations/:scenarioId/results =====

interface GetSimulationResultsResponse {
  data: SimulationResults;
}

// ===== POST /api/v1/simulations/compare =====

interface CompareScenarioRequest {
  scenarioIds: string[];                     // 2-4 scenario IDs
  metrics?: string[];                        // specific metrics to compare
}

interface CompareScenarioResponse {
  data: ScenarioComparison;
}

// ===== POST /api/v1/simulations/parse-nlp =====
// Parse natural language into structured variables

interface ParseNlpRequest {
  input: string;                             // e.g., "What if I fire 20 nurses in December?"
}

interface ParseNlpResponse {
  success: boolean;
  variables: Omit<SimulationVariable, 'id'>[];
  interpretation: string;                    // Claude's interpretation of the input
  confidence: number;                        // 0-1 parse confidence
  clarificationNeeded: boolean;
  clarificationPrompt?: string;              // follow-up question if ambiguous
}

// ===== POST /api/v1/simulations/:scenarioId/share =====

interface ShareScenarioRequest {
  recipients: {
    userId: string;
    permission: 'view' | 'comment' | 'edit';
  }[];
  message?: string;
}

interface ShareScenarioResponse {
  success: boolean;
  shareLink: string;
  recipients: SharedRecipient[];
}

// ===== GET /api/v1/simulations/:scenarioId/export =====

interface ExportSimulationResponse {
  downloadUrl: string;
  expiresAt: string;                         // pre-signed URL expiry
  format: 'pdf';
}

// ===== GET /api/v1/simulations/templates =====

interface GetTemplatesResponse {
  data: ScenarioTemplate[];
}

interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;                          // e.g., "Staffing Optimization", "Cost Reduction"
  variables: Omit<SimulationVariable, 'id'>[];
  popularity: number;                        // usage count
}
```

## Implementation Requirements

### Core Components

| Component | Description | Props |
|---|---|---|
| `SimulationPage` | Server component; renders scenario library with saved/shared scenarios | None (server) |
| `ScenarioBuilder` | Main scenario builder with variable management | `scenario?: Scenario, mode: 'create' \| 'edit'` |
| `VariableCardStrip` | Horizontal scrollable layout for variable cards | `variables: SimulationVariable[], onAdd: (module) => void, onRemove: (id) => void` |
| `VariableCard` | Individual variable with parameter form | `variable: SimulationVariable, onChange: (variable) => void, onRemove: () => void` |
| `VariableParameterForm` | Form fields for variable configuration by type | `variable: SimulationVariable, constraints: VariableConstraints, onChange: (value) => void` |
| `VariableSlider` | Range slider with value display and snap points | `min: number, max: number, step: number, value: number, onChange: (v) => void` |
| `NaturalLanguageInput` | Text input with Claude NLP parsing | `onParsed: (variables) => void` |
| `RunSimulationButton` | Primary CTA with loading/progress states | `scenarioId: string, disabled: boolean, onComplete: () => void` |
| `SimulationProgressOverlay` | Modal with real-time progress tracking | `progress: SimulationProgress, onCancel: () => void` |
| `ImpactSummaryCard` | Module impact card with risk badge | `impact: ModuleImpact` |
| `CascadeFlowDiagram` | Interactive dependency cascade visualization | `graph: CascadeGraph, onNodeClick: (nodeId) => void` |
| `BeforeAfterComparisonTable` | Current vs. projected comparison table | `entries: ComparisonEntry[]` |
| `ConfidenceIntervalChart` | Horizontal bar chart with CI ranges | `intervals: ConfidenceInterval[]` |
| `SimulationNarrativeSummary` | Claude-generated plain-English results narrative | `narrative: string, riskAssessment: RiskAssessment` |
| `ScenarioComparisonView` | Side-by-side comparison of multiple scenarios | `scenarios: Scenario[]` |
| `ScenarioLibrary` | Browse and search saved scenarios | `scenarios: ScenarioSummary[], onSelect: (id) => void` |
| `ScenarioLibraryCard` | Individual scenario in library listing | `scenario: ScenarioSummary, onOpen: () => void` |
| `ShareScenarioDialog` | Modal for sharing with user search and permissions | `scenarioId: string, onShare: (recipients) => void` |

### Custom Hooks

| Hook | Purpose | Return Type |
|---|---|---|
| `useScenarioBuilder` | Manages scenario draft state, variable CRUD, auto-save | `{ scenario, addVariable, updateVariable, removeVariable, save, isDirty }` |
| `useSimulationExecution` | Triggers simulation run, manages job lifecycle | `{ run, cancel, status, jobId, error }` |
| `useSimulationProgress` | SSE-based real-time progress tracking | `{ progress, stage, overallPercent, estimatedTime, isConnected }` |
| `useSimulationResults` | Fetches completed simulation results | `{ results, isLoading, error, refetch }` |
| `useScenarioLibrary` | CRUD operations for scenario library with pagination | `{ scenarios, create, duplicate, delete, isLoading, pagination }` |
| `useScenarioComparison` | Multi-scenario comparison data fetching | `{ comparison, addScenario, removeScenario, isComparing }` |
| `useNaturalLanguageParse` | Claude NLP parsing with debounce and confidence display | `{ parse, isParsing, parsedVariables, interpretation, confidence }` |
| `useCascadeGraph` | Fetches and layouts cascade graph data from Neo4j | `{ graph, isLoading, selectedNode, selectNode }` |

### Utility Functions

| Function | Purpose | Signature |
|---|---|---|
| `validateScenarioVariables` | Validate all variables meet constraints before simulation | `(variables: SimulationVariable[]) => ValidationResult` |
| `calculateCascadeLayout` | Compute node positions for cascade flow diagram | `(graph: CascadeGraph, containerDims: Dimensions) => LayoutGraph` |
| `formatImpactDelta` | Format delta values with sign and unit | `(delta: number, unit: string) => string` |
| `computeRiskLevel` | Determine risk level from impact severity and metric type | `(metric: ImpactMetric) => RiskLevel` |
| `serializeScenarioToUrl` | Encode scenario params for shareable URL | `(scenario: Scenario) => string` |
| `buildConfidenceIntervalBounds` | Calculate display bounds for CI chart | `(intervals: ConfidenceInterval[]) => ChartBounds` |
| `groupImpactsByModule` | Group comparison entries by module for display | `(entries: ComparisonEntry[]) => Record<HospitalModule, ComparisonEntry[]>` |
| `parseNaturalLanguageDate` | Extract date references from NLP input | `(text: string) => { month: number; year: number } \| null` |

## Acceptance Criteria

### Functional Requirements
- [ ] Director can create a new scenario with a descriptive name and optional description
- [ ] Director can add variables from any module: staffing (headcount, skill mix), beds (ward status, capacity), supply chain (suppliers, inventory), finance (budget)
- [ ] Each variable card displays current value, adjustment input, unit, and effective date
- [ ] Variable slider respects constraints (min/max/step) and displays real-time value
- [ ] Director can type natural language scenario description and system parses it into structured variables via Claude API
- [ ] NLP parsing shows confidence level and requests clarification when input is ambiguous
- [ ] Simulation engine computes cascading impact across all affected modules using Neo4j dependency graph
- [ ] Simulation progress displayed in real-time with stage indicators and estimated time remaining
- [ ] Results show before-and-after comparison table with current values, projected values, deltas, and risk levels
- [ ] Cascade flow diagram visualizes dependency chain with interactive nodes (hover for detail, click for breakdown)
- [ ] Confidence intervals displayed for all numeric projections with 90% confidence bands
- [ ] Claude generates narrative summary explaining results in plain English with risk assessment
- [ ] Scenarios can be saved as drafts, run, and saved with results
- [ ] Scenarios can be compared side-by-side (up to 4 scenarios)
- [ ] Scenarios can be shared with other users with configurable permissions (view/comment/edit)
- [ ] Results can be exported as PDF report
- [ ] Built-in scenario templates available for common decision patterns (staffing reduction, ward closure, supplier change)
- [ ] Scenario library displays all saved scenarios with search, filters, and metadata

### Non-Functional Requirements
- [ ] Simulation execution completes within 30 seconds for standard scenarios (up to 10 variables)
- [ ] Scenario builder page loads in under 2 seconds (LCP)
- [ ] NLP parsing responds within 5 seconds of input submission
- [ ] Cascade flow diagram renders smoothly at 60fps with up to 20 nodes and 30 edges
- [ ] PDF export generates within 10 seconds for standard result sets
- [ ] Support up to 100 saved scenarios per user without performance degradation
- [ ] Simulation engine handles concurrent executions (5 per user, 50 per organization)
- [ ] All simulation data isolated from production operational data (read-only snapshots)
- [ ] WCAG 2.1 AA compliance for all simulation UI components

## Modified Files
```
app/
├── (dashboard)/
│   └── simulations/
│       ├── page.tsx                              [+] NEW - Scenario library
│       ├── loading.tsx                           [+] NEW - Skeleton loader
│       ├── error.tsx                             [+] NEW - Error boundary
│       ├── layout.tsx                            [+] NEW - Section layout
│       ├── new/page.tsx                          [+] NEW - New scenario builder
│       ├── [scenarioId]/page.tsx                 [+] NEW - Scenario detail
│       ├── [scenarioId]/edit/page.tsx            [+] NEW - Edit scenario
│       ├── [scenarioId]/compare/page.tsx         [+] NEW - Comparison view
│       ├── compare/page.tsx                      [+] NEW - Multi-scenario compare
│       └── _components/
│           ├── SimulationPageHeader.tsx           [+] NEW
│           ├── ScenarioBuilder.tsx                [+] NEW
│           ├── ScenarioNameInput.tsx              [+] NEW
│           ├── VariableCardStrip.tsx              [+] NEW
│           ├── VariableCard.tsx                   [+] NEW
│           ├── VariableParameterForm.tsx          [+] NEW
│           ├── VariableSlider.tsx                 [+] NEW
│           ├── NaturalLanguageInput.tsx           [+] NEW
│           ├── ClaudeParseIndicator.tsx           [+] NEW
│           ├── ScenarioActionBar.tsx              [+] NEW
│           ├── RunSimulationButton.tsx            [+] NEW
│           ├── SimulationProgressOverlay.tsx      [+] NEW
│           ├── ProgressStageIndicator.tsx         [+] NEW
│           ├── SimulationResultsPanel.tsx         [+] NEW
│           ├── ImpactSummaryStrip.tsx             [+] NEW
│           ├── ImpactSummaryCard.tsx              [+] NEW
│           ├── RiskLevelBadge.tsx                 [+] NEW
│           ├── CascadeFlowDiagram.tsx             [+] NEW
│           ├── CascadeNode.tsx                    [+] NEW
│           ├── CascadeEdge.tsx                    [+] NEW
│           ├── BeforeAfterComparisonTable.tsx     [+] NEW
│           ├── ComparisonRow.tsx                  [+] NEW
│           ├── ConfidenceIntervalChart.tsx        [+] NEW
│           ├── SimulationNarrativeSummary.tsx     [+] NEW
│           ├── ResultsActionBar.tsx               [+] NEW
│           ├── ScenarioComparisonView.tsx         [+] NEW
│           ├── ScenarioSelectorBar.tsx            [+] NEW
│           ├── SideBySideComparisonGrid.tsx       [+] NEW
│           ├── ScenarioLibrary.tsx                [+] NEW
│           ├── ScenarioLibraryCard.tsx            [+] NEW
│           ├── ShareScenarioDialog.tsx            [+] NEW
│           └── ExportPdfButton.tsx                [+] NEW
├── api/v1/simulations/
│   ├── route.ts                                   [+] NEW - List/Create
│   ├── [scenarioId]/route.ts                      [+] NEW - CRUD
│   ├── [scenarioId]/run/route.ts                  [+] NEW - Execute
│   ├── [scenarioId]/results/route.ts              [+] NEW - Results
│   ├── [scenarioId]/share/route.ts                [+] NEW - Share
│   ├── [scenarioId]/export/route.ts               [+] NEW - PDF export
│   ├── compare/route.ts                           [+] NEW - Compare
│   ├── parse-nlp/route.ts                         [+] NEW - NLP parsing
│   ├── progress/route.ts                          [+] NEW - SSE progress
│   └── templates/route.ts                         [+] NEW - Templates
lib/
├── simulation/
│   ├── simulation-engine.ts                       [+] NEW - Core engine
│   ├── simulation-types.ts                        [+] NEW - Types
│   ├── cascade-calculator.ts                      [+] NEW - Cascade logic
│   ├── confidence-calculator.ts                   [+] NEW - CI computation
│   ├── module-impact/staffing-impact.ts           [+] NEW
│   ├── module-impact/bed-impact.ts                [+] NEW
│   ├── module-impact/supply-chain-impact.ts       [+] NEW
│   ├── module-impact/finance-impact.ts            [+] NEW
│   └── scenario-templates.ts                      [+] NEW - Templates
├── db/schema/
│   ├── scenarios.ts                               [+] NEW - Scenario table
│   ├── simulation-variables.ts                    [+] NEW - Variables table
│   ├── simulation-results.ts                      [+] NEW - Results table
│   └── scenario-shares.ts                         [+] NEW - Sharing table
```

## Implementation Status
**OVERALL STATUS**: :white_check_mark: MVP FRONTEND COMPLETE

> **Note**: The MVP implementation uses mock services with deterministic data instead of real backend APIs. Backend items (API route handlers, database schemas, BullMQ workers, Neo4j integration, real Claude API, PDF export) are excluded from MVP scope and will be implemented when the backend infrastructure is ready.

### MVP Frontend Implementation
| Task | Status |
|---|---|
| Implement `simulation.types.ts` TypeScript definitions (20+ types/interfaces) | :white_check_mark: Complete |
| Implement `simulation.constants.ts` (MODULE_CONFIG, RISK_LEVEL_CONFIG, SIMULATION_STAGES, etc.) | :white_check_mark: Complete |
| Implement `simulation.utils.ts` (11 utility functions: layout, formatting, validation) | :white_check_mark: Complete |
| Implement `simulation.service.ts` (mock service with 11 functions, deterministic simulation engine) | :white_check_mark: Complete |
| Build `useSimulation` hook with useReducer (18 action types) and async action creators | :white_check_mark: Complete |
| Build `useSimulationExecution` hook (run/cancel lifecycle with progress callbacks) | :white_check_mark: Complete |
| Build `useNaturalLanguageParse` hook (regex-based mock NLP) | :white_check_mark: Complete |
| Build `useScenarioLibrary` hook (scenarios, templates, duplicate) | :white_check_mark: Complete |
| Build `useScenarioComparison` hook (add/remove/clear scenarios) | :white_check_mark: Complete |
| Implement `page.tsx` SPA with view mode switching (library/builder/results/comparison) | :white_check_mark: Complete |
| Implement `layout.tsx`, `loading.tsx`, `error.tsx` | :white_check_mark: Complete |
| Build `ScenarioBuilder` with `VariableCardStrip` and `VariableCard` components | :white_check_mark: Complete |
| Build `VariableParameterForm` with slider, number input, date picker | :white_check_mark: Complete |
| Build `NaturalLanguageInput` with parse indicator and confidence display | :white_check_mark: Complete |
| Build `ScenarioActionBar` (Run Simulation, Save Draft, Load Template) | :white_check_mark: Complete |
| Build `ImpactSummaryCards` with `RiskLevelBadge` | :white_check_mark: Complete |
| Implement `CascadeFlowDiagram` (pure SVG, BFS-layered layout, hover highlighting) | :white_check_mark: Complete |
| Build `BeforeAfterComparisonTable` with risk-colored deltas | :white_check_mark: Complete |
| Implement `ConfidenceIntervalChart` with Recharts vertical bar chart | :white_check_mark: Complete |
| Build `SimulationNarrativeSummary` with mock AI analysis and risk assessment | :white_check_mark: Complete |
| Build `ResultsActionBar` (Compare, Share, Back, Save) | :white_check_mark: Complete |
| Implement `ScenarioLibrary` with tabs, search, and `ScenarioLibraryCard` grid | :white_check_mark: Complete |
| Implement `ScenarioComparisonView` with metrics table and risk comparison | :white_check_mark: Complete |
| Build `SimulationProgressOverlay` with stage stepper and progress bar | :white_check_mark: Complete |
| Build `ShareScenarioDialog` with link generation and copy-to-clipboard | :white_check_mark: Complete |
| Implement `SimulationPageHeader` with contextual titles and mode toggle | :white_check_mark: Complete |
| SideNavBar integration (Simulations nav item) | :white_check_mark: Complete |
| Homepage module card integration | :white_check_mark: Complete |
| `npm run build` — zero TypeScript errors | :white_check_mark: Verified |

### Phase 1: Scenario Builder Foundation
| Task | Status |
|---|---|
| Define database schemas for scenarios, variables, results, shares | :white_large_square: Not Started (backend) |
| Build `POST /api/v1/simulations` create scenario endpoint | :white_large_square: Not Started (backend) |
| Build `GET /api/v1/simulations` list scenarios endpoint | :white_large_square: Not Started (backend) |

### Phase 2: Simulation Engine & Execution (Backend)
| Task | Status |
|---|---|
| Implement per-module impact models (staffing, bed, supply-chain, finance) | :white_large_square: Not Started (backend) |
| Build `cascade-calculator.ts` with Neo4j graph traversal | :white_large_square: Not Started (backend) |
| Implement `confidence-calculator.ts` for Monte Carlo estimation | :white_large_square: Not Started (backend) |
| Set up BullMQ `simulation-execution-queue` with progress reporting | :white_large_square: Not Started (backend) |
| Build SSE progress endpoint | :white_large_square: Not Started (backend) |

### Phase 3: Real API Integrations
| Task | Status |
|---|---|
| Integrate real Claude API for narrative summary generation | :white_large_square: Not Started (backend) |
| Integrate real Claude API for NLP scenario parsing | :white_large_square: Not Started (backend) |
| Build PDF export endpoint with server-side rendering | :white_large_square: Not Started (backend) |

### Phase 4: Polish & Testing
| Task | Status |
|---|---|
| End-to-end testing with complex multi-variable scenarios | :white_large_square: Not Started |
| Accessibility audit and remediation | :white_large_square: Not Started |

## Dependencies
| Dependency | Type | Status | Notes |
|---|---|---|---|
| Staffing Module API (Story 01) | Data Source | Required | Current staffing data for baseline and variable definitions |
| Bed Allocation Module API (Story 02) | Data Source | Required | Current bed/ward data for baseline and capacity simulations |
| Supply Chain Module API (Story 03) | Data Source | Required | Current supplier and inventory data for supply simulations |
| Finance Module API (Story 04) | Data Source | Required | Current financial data for revenue/cost impact projections |
| Anomaly Detection (Story 05) | Integration | Recommended | Simulation results feed anomaly thresholds for risk detection |
| Neo4j Graph DB | Infrastructure | Required | Cross-module dependency graph for cascade calculation |
| Claude API Access | External Service | Required | NLP parsing, narrative generation, risk assessment |
| BullMQ / Redis | Infrastructure | Required | Async simulation job processing and progress tracking |
| Recharts Library | NPM Package | Required | Confidence interval and comparison charts |
| D3.js or ReactFlow | NPM Package | Required | Cascade flow diagram rendering |
| Puppeteer/Playwright | NPM Package | Required | Server-side PDF export generation |
| Data Science Models | Internal API | Required | Staffing forecasting, demand prediction for accurate projections |

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Simulation Accuracy**: Models produce inaccurate projections leading to flawed decisions | High | Critical | Confidence intervals on all projections, explicit uncertainty communication, calibration against historical data, human review requirement |
| **Cascade Complexity**: Cross-module cascade calculation exceeds computational bounds | Medium | High | Limit cascade depth to 3 hops, pre-compute common dependency paths, cache intermediate results, tiered simulation modes (quick/full) |
| **NLP Ambiguity**: Natural language input misinterpreted by Claude leading to wrong variables | Medium | Medium | Confidence score display, user confirmation step before running, clarification prompts for ambiguous input |
| **Long Simulation Times**: Complex scenarios exceed 30s target execution time | Medium | High | Background job processing with SSE progress, result caching for repeated runs, parallelized module impact calculations |
| **Data Staleness**: Simulation baseline data diverges from current operational reality | Low | High | Configurable baseline date, data freshness indicators, warning when baseline > 24 hours old |
| **PDF Export Failures**: Server-side rendering fails for complex visualizations | Medium | Low | Fallback to simplified PDF layout, async export with email delivery, retry mechanism |
| **Neo4j Query Performance**: Complex graph traversals slow under production data volumes | Medium | Medium | Query optimization, pre-materialized paths for common cascades, query timeout with fallback |

## Testing Strategy
- **Unit Tests**: Module impact calculators (staffing, beds, supply chain, finance) with known input/output pairs; cascade calculator with predefined graph structures; confidence interval computation; variable validation logic
- **Integration Tests**: End-to-end simulation execution from scenario creation through result generation; Claude NLP parsing with varied natural language inputs; BullMQ job lifecycle (queue -> process -> complete/fail); SSE progress delivery accuracy
- **Component Tests**: `ScenarioBuilder` renders and manages variable cards correctly; `VariableSlider` respects constraints and reports values; `CascadeFlowDiagram` renders nodes and edges with correct positioning; `BeforeAfterComparisonTable` displays deltas with correct formatting and colors; `NaturalLanguageInput` shows parsing state and results
- **End-to-End Tests**: Full flow: create scenario -> add variables -> run simulation -> view results -> save; NLP flow: type natural language -> parse -> confirm variables -> run; Comparison flow: select 3 scenarios -> compare side-by-side; Share flow: share scenario -> recipient receives -> views read-only
- **Performance Tests**: Simulation execution time with 1, 5, 10, 20 variables; concurrent simulation handling (5 per user); cascade graph rendering with 20+ nodes; scenario library loading with 100+ scenarios
- **Accuracy Tests**: Backtest simulation projections against known historical outcomes for calibration

## Performance Considerations
- **Parallelized Module Impact**: Compute staffing, bed, supply chain, and finance impacts in parallel using `Promise.allSettled`, then merge for cascade calculation
- **Cascade Path Caching**: Cache common dependency paths in Redis (e.g., staffing -> beds -> revenue) with 1-hour TTL to avoid repeated Neo4j traversals
- **Progressive Results**: Stream partial results (module by module) via SSE as they complete, not waiting for full simulation
- **Memoized Comparison**: `useMemo` on comparison matrix calculations to prevent recalculation on unrelated state changes
- **Lazy-Loaded Visualizations**: `CascadeFlowDiagram` and `ConfidenceIntervalChart` loaded via `next/dynamic` with skeleton fallbacks
- **Database Indexing**: Composite indexes on `scenarios(created_by, status)`, `scenarios(updated_at)`, full-text index on `name` and `description`
- **Simulation Result Caching**: Cache completed simulation results in Redis (24h TTL) for instant re-display without database queries
- **Optimistic Draft Saving**: Auto-save scenario drafts to localStorage first, sync to server in background
- **Canvas-Based Cascade Rendering**: Use HTML5 Canvas (via D3 or ReactFlow) for cascade diagram with 50+ nodes to avoid DOM bloat

## Deployment Plan
1. **Database Migration**: Deploy scenario, variable, result, and share table schemas to PostgreSQL staging
2. **Simulation Engine**: Deploy module impact calculators and cascade calculator to ECS as background workers
3. **BullMQ Workers**: Deploy simulation execution, cascade, and report generation workers
4. **API Endpoints**: Deploy simulation REST API and SSE progress endpoint
5. **Feature Flag**: Gate simulation UI behind `FEATURE_FORESIGHT_SIMULATION` flag
6. **Template Seeding**: Seed 5 built-in scenario templates (staffing reduction, ward closure, supplier change, budget cut, demand surge)
7. **Synthetic Calibration**: Run simulation engine against 12 months historical data to calibrate accuracy and confidence intervals
8. **Beta Program**: Enable for 3-5 hospital directors in pilot program, collect qualitative feedback
9. **Full Rollout**: Scale to all director-role users after 2-week beta validation
10. **Post-Deployment Verification**: Confirm simulation completes <30s, NLP parses <5s, SSE updates every 2s

## Monitoring & Analytics
- **Simulation Execution Time**: Track P50/P95/P99 execution times by variable count (target: P95 <30s for <=10 variables)
- **NLP Parse Success Rate**: Track percentage of NLP inputs successfully parsed to valid variables (target: >85%)
- **Simulation Completion Rate**: Track percentage of started simulations that complete vs. fail/timeout (target: >98%)
- **Scenario Creation Rate**: Track new scenarios created per user per month (engagement metric)
- **Template Usage**: Track which templates are most popular and customization patterns
- **Comparison Usage**: Track how often comparison view is used and typical scenario count
- **Share Rate**: Track what percentage of completed scenarios are shared with others
- **NLP vs. Manual**: Track percentage of variables created via NLP vs. manual input
- **Cascade Query Performance**: Monitor Neo4j query times for cascade calculations (alert if P95 >5s)
- **BullMQ Queue Health**: Monitor queue depth, processing time, failure rate for simulation jobs
- **Revenue Attribution**: Track decisions that cite simulation results as supporting evidence

## Documentation Requirements
- **Simulation Engine Technical Guide**: Architecture of module impact calculators, cascade algorithm, confidence interval computation
- **Scenario Builder User Guide**: How to create scenarios, add variables, run simulations, interpret results
- **NLP Input Guide**: Examples of natural language inputs the system understands with best practices
- **API Reference**: OpenAPI 3.0 spec for all simulation endpoints including SSE events
- **Template Authoring Guide**: How to create custom scenario templates with variable definitions and default values
- **Accuracy Methodology Document**: How simulations are calibrated, what confidence intervals mean, limitations and caveats

## Post-Launch Review
- **Week 1 Review**: Monitor simulation execution success rates; identify and fix top failure modes; gather initial user feedback on scenario builder UX
- **Week 2 Review**: Evaluate NLP parsing accuracy across different input styles; tune Claude prompts for improved interpretation
- **Week 4 Review**: Analyze first completed simulations against actual outcomes (where decisions were implemented); calibrate models
- **Month 2 Review**: Assess template usage; create additional templates based on common user-created scenarios; evaluate comparison feature adoption
- **Quarter 1 Review**: Full retrospective on simulation accuracy, user engagement, decision impact; plan enhancements (automated scenario suggestions, machine learning model improvements, multi-hospital simulations)
