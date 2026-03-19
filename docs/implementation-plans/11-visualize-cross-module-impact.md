# 11 Visualize Cross-Module Impact Analysis - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story

As a **hospital director**, I want **to see how changes in one operational module (e.g., staffing) impact other modules (e.g., bed allocation, revenue, supply chain)**, so that **I can make holistic decisions that account for cascading effects across the entire hospital operation**.

## Pre-conditions

- All five analytics modules (staffing, bed allocation, supply chain, finance, anomaly detection) have data ingested and validated (Story 09)
- Neo4j graph database contains entity relationships across modules (departments, staff, beds, supplies, revenue centers)
- Cross-module relationship graph seeded with baseline impact weights (e.g., staffing -> bed utilization edge weight)
- What-if simulation engine (Story 06) is available for impact scenario execution
- User authenticated with `hospital_director` or `hospital_administrator` role
- At least 90 days of historical data available for impact correlation analysis
- Module data field configurations (Story 13) completed with cross-module field linkages defined

## Business Requirements

- **Decision Quality Improvement**: Hospital directors report >= 40% improvement in confidence when making cross-departmental decisions (measured via quarterly survey)
- **Impact Visibility**: 100% of inter-module relationships defined in Neo4j graph exposed in the impact visualization interface
- **Cascade Traceability**: Directors can trace any change through 3+ downstream modules with impact severity indicators within 5 seconds
- **Simulation Integration**: Impact visualizations can be generated from what-if simulation results (Story 06) and prescriptive recommendations (Story 12)
- **Graph Performance**: Neo4j traversal queries for impact analysis return within 3 seconds for graphs with up to 10,000 nodes
- **Adoption**: >= 50% of hospital directors interact with impact visualization at least once per week within 60 days of launch

## Technical Specifications

### Integration Points
- **Neo4j Graph Database**: Primary data store for entity relationships and impact weights; Cypher queries for path traversal, shortest path, and cascading impact calculation
- **PostgreSQL**: Historical data for impact magnitude calculations; time-series data for trend-based impact estimation
- **What-If Simulation Engine** (Story 06): Receives simulation scenarios; returns projected impacts that feed into the visualization
- **Prescriptive Recommendations** (Story 12): Each recommendation links to its impact visualization showing downstream effects
- **NL Query Interface** (Story 10): Cross-module impact queries routed to this visualization engine
- **Claude API**: AI-assisted impact narrative generation (natural language explanations of cascading effects)
- **D3.js / React Flow**: Force-directed graph rendering and interactive flow diagrams
- **Redis**: Caching computed impact paths and graph layouts for frequently accessed scenarios

### Security Requirements
- Impact data scoped to user's hospital; multi-tenant Neo4j isolation via `hospitalId` property on all nodes
- Graph traversal queries enforced with hospital-scoped Cypher parameterization
- Impact simulation results with PHI-adjacent data (staffing names, patient counts) access-controlled by role
- Audit logging for all impact analysis sessions (who viewed what impact scenario)
- Rate limiting on Neo4j traversal queries to prevent resource exhaustion (10 traversals/minute/user)

## Design Specifications

### Visual Layout & Components

**Cross-Module Impact Visualization Layout**:
```
+------------------------------------------------------------------+
| [TopNav: MedicalPro Logo | Modules | Settings | User Avatar]     |
+------------------------------------------------------------------+
| [Sidebar]  |  [ImpactAnalysisDashboard]                         |
|            |  +------------------------------------------------+ |
| Impact     |  | Cross-Module Impact Analysis  [Fullscreen]     | |
| Analysis   |  | Origin: [Staffing v]  Change: [Reduce 20 RNs] | |
|            |  +------------------------------------------------+ |
|  > Graph   |                                                      |
|  > Flow    |  +------------------------------------------------+ |
|  > History |  |                                                | |
|            |  |           [ImpactGraph - Force Directed]       | |
|            |  |                                                | |
|            |  |              [ STAFFING ]                      | |
|            |  |             /    |     \                       | |
|            |  |          HIGH  MEDIUM  LOW                     | |
|            |  |          /       |       \                     | |
|            |  |   [BED ALLOC] [SUPPLY] [FINANCE]               | |
|            |  |       |          |         |                   | |
|            |  |    MEDIUM      LOW       HIGH                  | |
|            |  |       |          |         |                   | |
|            |  |   [ANOMALY]  [ANOMALY] [BED ALLOC]             | |
|            |  |                                                | |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | Impact Cascade Detail                          | |
|            |  | +--------------------------------------------+ | |
|            |  | | Module        | Impact  | Severity | Conf. | | |
|            |  | | Bed Alloc.    | -12%    | HIGH     | 89%   | | |
|            |  | |   Occupancy forced reduction in Ward A/B   | | |
|            |  | | Supply Chain  | -5%     | MEDIUM   | 76%   | | |
|            |  | |   Reduced consumable demand (-$12K/mo)     | | |
|            |  | | Finance       | -$180K  | HIGH     | 92%   | | |
|            |  | |   Revenue loss from reduced bed capacity   | | |
|            |  | | Anomaly Det.  | +15%    | MEDIUM   | 71%   | | |
|            |  | |   Expected spike in overtime anomalies     | | |
|            |  | +--------------------------------------------+ | |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | AI Impact Narrative                            | |
|            |  | Reducing 20 RNs would create a high-impact    | |
|            |  | cascade: bed capacity drops 12% in Wards A/B, | |
|            |  | causing estimated $180K/quarter revenue loss.  | |
|            |  | Supply costs decrease modestly ($12K/mo), but | |
|            |  | overtime anomalies are projected to increase   | |
|            |  | 15% as remaining staff cover gaps.             | |
|            |  | [Run Simulation] [View Recommendations]        | |
|            |  +------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
<AppLayout>
  <TopNavigation />
  <Sidebar activeModule="impact-analysis" />
  <MainContent>
    <ImpactAnalysisDashboard>
      <ImpactScenarioSelector>
        <ModuleOriginDropdown />
        <ChangeDescriptionInput />
        <AnalyzeButton />
      </ImpactScenarioSelector>
      <ImpactGraph>
        <ForceDirectedGraph>
          <ModuleNode />
          <ImpactEdge />
          <SeverityIndicator />
        </ForceDirectedGraph>
        <GraphControls>
          <ZoomControl />
          <LayoutToggle /> <!-- Force / Hierarchical / Radial -->
          <FilterBySeverity />
        </GraphControls>
        <GraphLegend />
      </ImpactGraph>
      <ImpactCascadeDetail>
        <ImpactModuleRow>
          <SeverityBadge />
          <ImpactMetric />
          <ConfidenceIndicator />
          <ImpactDescription />
        </ImpactModuleRow>
      </ImpactCascadeDetail>
      <ImpactNarrative>
        <AIGeneratedSummary />
        <ActionButtons /> <!-- Run Simulation, View Recommendations -->
      </ImpactNarrative>
      <ImpactTimeline>
        <TimelineEvent />
      </ImpactTimeline>
    </ImpactAnalysisDashboard>
    <ImpactFlowDiagram />
    <ImpactHistoryPanel />
  </MainContent>
</AppLayout>
```

### Design System Compliance

**Color Usage**:
```css
/* Impact severity colors */
--impact-high: #DC3545;                         /* Red - high severity */
--impact-medium: #FFB74D;                       /* Amber - medium severity */
--impact-low: #28A745;                          /* Green - low severity */

/* Module node colors (Kairos palette) */
--node-staffing: var(--primary-teal);           /* #007B7A */
--node-beds: var(--primary-cerulean);           /* #00B3C6 */
--node-supply: var(--primary-gold);             /* #C9A84A */
--node-finance: var(--secondary-deep);          /* #0F3440 */
--node-anomaly: var(--primary-ink);             /* #031926 */

/* Edge colors match severity */
--edge-high: rgba(220, 53, 69, 0.8);
--edge-medium: rgba(255, 183, 77, 0.7);
--edge-low: rgba(40, 167, 69, 0.6);

/* Graph background */
--graph-bg: var(--bg-secondary);                /* #F6F8F8 */
--graph-grid: rgba(0, 0, 0, 0.03);             /* Subtle grid lines */
```

**Typography**:
```css
/* Module node labels: Merriweather semibold */
.module-node-label { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-sm); }
/* Impact metric values: JetBrains Mono for precise numbers */
.impact-metric { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-lg); }
/* Severity badges: Inter semibold */
.severity-badge { font-family: var(--font-body); font-weight: 600; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; }
/* AI narrative: Inter regular with generous line-height */
.ai-narrative { font-family: var(--font-body); font-weight: 400; font-size: var(--text-base); line-height: 1.75; }
```

### Responsive Behavior

| Breakpoint | Layout Adaptation |
|---|---|
| Desktop (>= 1280px) | Full graph visualization (800x600px) + detail table side-by-side; narrative below |
| Laptop (1024-1279px) | Graph visualization (600x450px) above detail table; collapsed sidebar |
| Tablet (768-1023px) | Graph in simplified radial layout (400x400px); detail table as accordion cards; bottom nav |
| Mobile (< 768px) | List view replaces graph (modules listed with impact arrows); impact cascade as stacked cards; narrative collapsed behind "Read Analysis" button |

### Interaction Patterns

- **Module Node Click**: Clicking a module node in the graph highlights all edges from that module; detail panel scrolls to that module's impact row; pulsing animation on connected nodes
- **Edge Hover**: Hovering an edge shows tooltip with impact summary (e.g., "Staffing -> Bed Allocation: -12% occupancy, HIGH severity")
- **Severity Filter**: Toggle high/medium/low checkboxes to show/hide edges by severity; nodes with no visible edges fade to 30% opacity
- **Layout Toggle**: Switch between force-directed (organic), hierarchical (tree), and radial (center-outward) layouts; smooth 500ms transition animation
- **Zoom & Pan**: Scroll to zoom; click+drag to pan; double-click node to center and zoom to neighborhood; minimap in bottom-right corner
- **Run Simulation**: Button passes current scenario to what-if simulation engine (Story 06); returns to this view with simulated impact data overlaid
- **Impact Path Tracing**: Click "Trace" on any downstream module to highlight the complete path from origin to that module, pulsing along each edge sequentially
- **Fullscreen Mode**: Expand graph to fill viewport; scenario selector and controls float as overlay; press Escape to exit

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── impact-analysis/
│       ├── page.tsx                              # Impact analysis entry
│       ├── layout.tsx                            # Impact module layout
│       ├── loading.tsx                           # Graph skeleton loader
│       ├── error.tsx                             # Error boundary
│       ├── history/
│       │   └── page.tsx                          # Impact analysis history
│       └── components/
│           ├── ImpactAnalysisDashboard.tsx        # Main container
│           ├── ImpactScenarioSelector.tsx         # Origin module + change input
│           ├── ImpactGraph.tsx                    # Graph visualization container
│           ├── ForceDirectedGraph.tsx             # D3.js force simulation wrapper
│           ├── HierarchicalGraph.tsx              # Tree layout variant
│           ├── RadialGraph.tsx                    # Radial layout variant
│           ├── ModuleNode.tsx                     # Individual module node SVG
│           ├── ImpactEdge.tsx                     # Edge with severity coloring
│           ├── SeverityIndicator.tsx              # Severity icon badge
│           ├── GraphControls.tsx                  # Zoom, layout toggle, filter
│           ├── GraphLegend.tsx                    # Color/severity legend
│           ├── GraphMinimap.tsx                   # Overview minimap
│           ├── ImpactCascadeDetail.tsx            # Table of downstream impacts
│           ├── ImpactModuleRow.tsx                # Single module impact row
│           ├── ImpactNarrative.tsx                # AI-generated summary
│           ├── ImpactTimeline.tsx                 # Chronological impact unfolding
│           ├── ImpactPathTracer.tsx               # Animated path tracing overlay
│           ├── ImpactFlowDiagram.tsx              # Sankey/flow diagram variant
│           └── hooks/
│               ├── useImpactGraph.ts              # Neo4j graph data + layout
│               ├── useImpactAnalysis.ts           # Impact calculation + caching
│               ├── useGraphLayout.ts              # D3.js force simulation state
│               ├── useGraphInteraction.ts         # Zoom, pan, selection state
│               ├── useImpactNarrative.ts          # Claude API narrative generation
│               ├── useImpactHistory.ts            # Analysis session history
│               └── useImpactSimulation.ts         # Integration with Story 06
├── lib/
│   ├── api/
│   │   ├── impact-analysis-api.ts                # Impact analysis REST client
│   │   ├── impact-graph-api.ts                   # Neo4j graph query client
│   │   └── impact-narrative-api.ts               # Claude narrative client
│   ├── graph/
│   │   ├── force-layout.ts                       # D3.js force simulation config
│   │   ├── hierarchical-layout.ts                # Tree layout algorithm
│   │   ├── radial-layout.ts                      # Radial layout algorithm
│   │   ├── graph-transforms.ts                   # Node/edge transform utilities
│   │   └── impact-path-calculator.ts             # Cascading impact path finder
│   └── utils/
│       ├── impact-utils.ts                       # Impact formatting helpers
│       ├── severity-calculator.ts                # Impact severity classification
│       └── graph-color-mapper.ts                 # Module -> color mapping
├── types/
│   ├── impact-analysis.types.ts                  # Core impact types
│   ├── impact-graph.types.ts                     # Graph node/edge types
│   └── impact-scenario.types.ts                  # Scenario input types
└── services/
    └── impact-analysis/
        ├── ImpactAnalysisEngine.ts               # Main analysis orchestrator
        ├── GraphTraversalService.ts              # Neo4j Cypher query builder
        ├── CascadeCalculator.ts                  # Cascading impact calculation
        ├── ImpactWeightModel.ts                  # Historical data -> impact weights
        └── ImpactNarrativeGenerator.ts           # Claude API narrative generation
```

### State Management Architecture

```typescript
// types/impact-analysis.types.ts

/** Defines the five hospital analytics modules */
type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

/** A scenario describing a change in one module */
interface ImpactScenario {
  id: string;
  hospitalId: string;
  originModule: HospitalModule;
  changeDescription: string;                    // Human-readable change
  changeParameters: ChangeParameter[];          // Structured change values
  createdBy: string;
  createdAt: string;
}

interface ChangeParameter {
  metricName: string;                           // e.g., "rn_headcount"
  currentValue: number;
  projectedValue: number;
  unit: string;                                 // e.g., "FTEs", "beds", "$"
  changeType: 'absolute' | 'percentage';
}

/** A node in the impact graph representing a hospital module */
interface ImpactGraphNode {
  id: string;
  module: HospitalModule;
  label: string;                                // e.g., "Staffing", "Bed Allocation"
  isOrigin: boolean;                            // True for the change origin module
  impactMetrics: ImpactMetric[];                // Downstream impacts on this module
  position: { x: number; y: number };           // Layout coordinates
  depth: number;                                // Distance from origin (0 = origin)
}

interface ImpactMetric {
  metricName: string;                           // e.g., "bed_occupancy_rate"
  displayName: string;                          // e.g., "Bed Occupancy Rate"
  currentValue: number;
  projectedValue: number;
  delta: number;                                // projectedValue - currentValue
  deltaPercentage: number;
  unit: string;
  direction: 'increase' | 'decrease' | 'stable';
}

/** An edge connecting two modules with impact data */
interface ImpactGraphEdge {
  id: string;
  sourceModule: HospitalModule;
  targetModule: HospitalModule;
  severity: 'high' | 'medium' | 'low';
  confidence: number;                           // 0-100
  impactSummary: string;                        // e.g., "Bed occupancy drops 12%"
  impactMagnitude: number;                      // Normalized 0-1 for edge thickness
  relationshipType: string;                     // Neo4j relationship label
  historicalCorrelation: number;                // Historical correlation coefficient
}

/** Complete impact analysis result */
interface ImpactAnalysisResult {
  id: string;
  scenarioId: string;
  hospitalId: string;
  graph: {
    nodes: ImpactGraphNode[];
    edges: ImpactGraphEdge[];
  };
  cascadePaths: CascadePath[];
  narrative: string;                            // Claude-generated summary
  totalModulesAffected: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  analysisTimeMs: number;
  confidence: number;                           // Overall analysis confidence
  dataSourcesUsed: string[];
  computedAt: string;
}

/** A single cascade path from origin to terminal module */
interface CascadePath {
  id: string;
  path: CascadeStep[];
  totalImpactScore: number;                     // Weighted sum of impact along path
  terminalModule: HospitalModule;
}

interface CascadeStep {
  fromModule: HospitalModule;
  toModule: HospitalModule;
  severity: 'high' | 'medium' | 'low';
  mechanism: string;                            // e.g., "Reduced RN headcount -> fewer staffed beds"
  impactMetrics: ImpactMetric[];
}

/** Neo4j relationship model for cross-module connections */
interface ModuleRelationship {
  sourceModule: HospitalModule;
  targetModule: HospitalModule;
  relationshipType: string;                     // e.g., "STAFFS", "ALLOCATES_TO", "SUPPLIES", "GENERATES_REVENUE"
  weight: number;                               // Historical impact weight (0-1)
  bidirectional: boolean;
  lastCalculatedAt: string;
  dataPointCount: number;                       // Number of historical observations
}

/** Impact weight model derived from historical data */
interface ImpactWeightMatrix {
  hospitalId: string;
  lastUpdatedAt: string;
  weights: ImpactWeight[];
}

interface ImpactWeight {
  sourceModule: HospitalModule;
  targetModule: HospitalModule;
  sourceMetric: string;
  targetMetric: string;
  correlationCoefficient: number;               // -1 to 1
  lagDays: number;                              // Days of delay before impact manifests
  confidence: number;                           // 0-100 based on data points
  sampleSize: number;
}

// --- Graph Layout State ---

type GraphLayoutType = 'force' | 'hierarchical' | 'radial';

interface GraphViewState {
  layout: GraphLayoutType;
  zoom: number;                                 // 0.1 - 3.0
  panOffset: { x: number; y: number };
  selectedNodeId: string | null;
  highlightedEdgeIds: string[];
  severityFilter: {
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  isFullscreen: boolean;
  isTracingPath: boolean;
  tracingPathId: string | null;
  animationProgress: number;                    // 0-1 for path tracing animation
}

// --- Page State ---

interface ImpactAnalysisPageState {
  scenario: {
    originModule: HospitalModule | null;
    changeDescription: string;
    changeParameters: ChangeParameter[];
    isAnalyzing: boolean;
    error: string | null;
  };
  analysis: {
    result: ImpactAnalysisResult | null;
    isLoading: boolean;
    error: string | null;
  };
  graph: GraphViewState;
  narrative: {
    text: string;
    isGenerating: boolean;
  };
  history: {
    sessions: ImpactAnalysisResult[];
    isLoading: boolean;
  };
}
```

### API Integration Schema

```typescript
// --- REST API Endpoints ---

// Run Impact Analysis
// POST /api/v1/impact-analysis/analyze
interface RunImpactAnalysisRequest {
  hospitalId: string;
  originModule: HospitalModule;
  changeDescription: string;
  changeParameters: ChangeParameter[];
}
interface RunImpactAnalysisResponse {
  success: boolean;
  data: ImpactAnalysisResult;
}

// Get Impact Graph (Neo4j)
// GET /api/v1/impact-analysis/graph?hospitalId={id}
interface GetImpactGraphResponse {
  success: boolean;
  data: {
    nodes: ImpactGraphNode[];
    edges: ImpactGraphEdge[];
    moduleRelationships: ModuleRelationship[];
  };
}

// Get Cascade Paths
// GET /api/v1/impact-analysis/{analysisId}/cascades?originModule={module}&targetModule={module}
interface GetCascadePathsResponse {
  success: boolean;
  data: CascadePath[];
}

// Get Impact Weight Matrix
// GET /api/v1/impact-analysis/weights?hospitalId={id}
interface GetImpactWeightsResponse {
  success: boolean;
  data: ImpactWeightMatrix;
}

// Recalculate Impact Weights (admin action)
// POST /api/v1/impact-analysis/weights/recalculate
interface RecalculateWeightsRequest {
  hospitalId: string;
  modules: HospitalModule[];   // Which module pairs to recalculate
  lookbackDays: number;        // Historical window (default: 365)
}
interface RecalculateWeightsResponse {
  success: boolean;
  data: {
    jobId: string;
    estimatedDurationSeconds: number;
  };
}

// Generate Impact Narrative (Claude API)
// POST /api/v1/impact-analysis/{analysisId}/narrative
interface GenerateNarrativeRequest {
  analysisId: string;
  detailLevel: 'summary' | 'detailed';
}
interface GenerateNarrativeResponse {
  success: boolean;
  data: {
    narrative: string;
    tokenUsage: { input: number; output: number };
  };
}

// Get Analysis History
// GET /api/v1/impact-analysis/history?hospitalId={id}&page={n}&pageSize={n}
interface GetAnalysisHistoryResponse {
  success: boolean;
  data: {
    analyses: ImpactAnalysisResult[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// Link to Simulation Engine (Story 06)
// POST /api/v1/impact-analysis/{analysisId}/simulate
interface TriggerSimulationRequest {
  analysisId: string;
  simulationParameters: {
    timeHorizonDays: number;
    confidenceInterval: number;
    iterations: number;
  };
}
interface TriggerSimulationResponse {
  success: boolean;
  data: {
    simulationId: string;
    redirectUrl: string;     // URL to simulation results page
  };
}

// --- Neo4j Cypher Query Templates ---

// Get all module relationships for a hospital
// MATCH (s:Module {hospitalId: $hospitalId})-[r:IMPACTS]->(t:Module {hospitalId: $hospitalId})
// RETURN s, r, t

// Cascading impact traversal from origin module
// MATCH path = (origin:Module {name: $originModule, hospitalId: $hospitalId})
//   -[:IMPACTS*1..4]->(downstream:Module)
// RETURN path, relationships(path) AS impacts, length(path) AS depth
// ORDER BY depth

// Calculate orphan modules (no incoming/outgoing impacts)
// MATCH (m:Module {hospitalId: $hospitalId})
// WHERE NOT (m)-[:IMPACTS]->() AND NOT ()-[:IMPACTS]->(m)
// RETURN m

// Shortest impact path between two modules
// MATCH path = shortestPath(
//   (source:Module {name: $sourceModule, hospitalId: $hospitalId})
//   -[:IMPACTS*]->(target:Module {name: $targetModule, hospitalId: $hospitalId})
// )
// RETURN path, relationships(path) AS impacts

// --- BullMQ Jobs ---

interface ImpactWeightRecalculationJob {
  name: 'recalculate-impact-weights';
  data: {
    hospitalId: string;
    sourceModule: HospitalModule;
    targetModule: HospitalModule;
    lookbackDays: number;
  };
}

interface ImpactAnalysisJob {
  name: 'run-impact-analysis';
  data: {
    analysisId: string;
    scenario: ImpactScenario;
    weightMatrix: ImpactWeightMatrix;
  };
}
```

## Implementation Requirements

### Core Components

1. **ImpactAnalysisDashboard.tsx** - Main container rendering scenario selector, graph visualization, cascade detail, and narrative. Server component fetches baseline graph structure; delegates interactive visualization to client children.

2. **ImpactScenarioSelector.tsx** - Client component with module origin dropdown (5 modules), change description text input, and structured parameter editor (add metric, set current/projected values). "Analyze Impact" button triggers analysis.

3. **ImpactGraph.tsx** - Client component wrapping D3.js-powered SVG graph visualization. Manages layout engine selection (force/hierarchical/radial). Renders `ModuleNode` and `ImpactEdge` components. Handles zoom, pan, and selection events via `useGraphInteraction`.

4. **ForceDirectedGraph.tsx** - D3.js force simulation implementation. Configures forces: center gravity, link distance proportional to impact magnitude, collision avoidance, charge repulsion. Smooth tick-based animation with `requestAnimationFrame`.

5. **ModuleNode.tsx** - SVG component for a single module node. Circular node with module-specific color and icon. Pulsing animation when selected. Size proportional to total impact magnitude. Label with module name and primary impact metric.

6. **ImpactEdge.tsx** - SVG path component for edges. Width proportional to `impactMagnitude`. Color mapped to `severity` (red/amber/green). Animated dash pattern during path tracing. Hover tooltip with `impactSummary`.

7. **SeverityIndicator.tsx** - Colored badge with icon (red circle = high, amber triangle = medium, green square = low). Used across graph edges, cascade table, and detail views.

8. **GraphControls.tsx** - Floating control panel with zoom slider (+/- buttons), layout toggle (3 buttons), severity filter checkboxes, fullscreen toggle. Positioned bottom-right of graph container.

9. **ImpactCascadeDetail.tsx** - Table listing all affected modules with impact metrics. Sortable by severity, delta, and confidence. Clicking a row highlights corresponding node and edges in graph. Expandable rows show Claude-generated mechanism descriptions.

10. **ImpactNarrative.tsx** - Claude-generated natural language summary of the complete impact analysis. Includes key findings, risk warnings, and contextual observations. "Run Simulation" and "View Recommendations" action buttons linked to Stories 06 and 12.

11. **ImpactPathTracer.tsx** - Overlay component that animates a pulsing dot traveling along a selected cascade path. Triggered by clicking "Trace" on a cascade row. Uses SVG `animateMotion` along edge paths with 3-second animation duration.

12. **ImpactFlowDiagram.tsx** - Alternative Sankey/flow diagram visualization showing proportional flow of impact between modules. Width of flow bands represents impact magnitude. Useful for aggregate views.

### Custom Hooks

1. **useImpactGraph(hospitalId)** - Fetches baseline graph structure from Neo4j via REST API. Returns `{ nodes, edges, relationships, isLoading, error }`. Caches graph structure in Redis with 5-minute TTL.

2. **useImpactAnalysis(hospitalId)** - Submits impact analysis scenarios and retrieves results. Returns `{ analyze, result, isAnalyzing, error, clearResult }`. Manages optimistic graph updates during analysis.

3. **useGraphLayout(nodes, edges, layoutType)** - Manages D3.js force simulation lifecycle. Returns `{ layoutNodes, layoutEdges, isSimulating, restart }`. Cleanly tears down simulation on layout type change or unmount.

4. **useGraphInteraction()** - Manages zoom, pan, selection, and hover state for the graph SVG. Returns `{ zoom, panOffset, selectedNodeId, hoveredEdgeId, handlers }`. Uses `d3-zoom` behavior.

5. **useImpactNarrative(analysisId)** - Fetches Claude-generated narrative for a completed analysis. Returns `{ narrative, isGenerating, error, regenerate }`. Streams narrative tokens for perceived speed.

6. **useImpactHistory(hospitalId)** - Fetches paginated history of past impact analyses. Returns `{ sessions, isLoading, loadMore }`. Each session includes graph snapshot for replay.

7. **useImpactSimulation(analysisId)** - Integration hook with what-if simulation engine. Returns `{ triggerSimulation, simulationId, isRunning, redirectToResults }`.

### Utility Functions

1. **impact-path-calculator.ts** - `calculateCascadePaths(graph, originModule)`: BFS/DFS traversal to find all downstream impact paths; returns ordered by total impact score. `findShortestImpactPath(graph, source, target)`: Dijkstra variant using inverse impact magnitude as weight.

2. **severity-calculator.ts** - `classifySeverity(deltaPercentage, confidence)`: Returns `'high' | 'medium' | 'low'` based on thresholds (high: delta > 10% AND confidence > 80%; medium: delta > 5%; low: otherwise). `aggregateSeverity(edges)`: Returns worst-case severity from a collection.

3. **graph-color-mapper.ts** - `getModuleColor(module)`: Returns Kairos palette color for each module. `getSeverityColor(severity)`: Returns semantic color. `getEdgeGradient(sourceModule, targetModule)`: Returns CSS gradient for edge rendering.

4. **impact-utils.ts** - `formatImpactDelta(delta, unit)`, `formatConfidenceScore(confidence)`, `calculateTotalImpactScore(path)`, `generateScenarioId()`.

## Acceptance Criteria

### Functional Requirements

1. **Scenario Input**: Director can select an origin module and describe a change (free text + structured parameters); system accepts changes across all five modules.
2. **Impact Graph Display**: After analysis, interactive force-directed graph renders with module nodes and impact edges; all affected downstream modules visible within 3 seconds.
3. **Severity Indication**: Each edge and impact row shows severity (high/medium/low) with color-coded badges; severity based on delta magnitude and confidence score.
4. **Cascade Tracing**: Director can trace a change from origin through all downstream modules; animated path tracing highlights the complete cascade path.
5. **Impact Detail Table**: Table shows each affected module with specific impact metrics (current value, projected value, delta, delta %, confidence); sortable and expandable.
6. **AI Narrative**: Claude-generated narrative summarizes cascading effects in plain language; narrative regenerates if scenario parameters change.
7. **Graph Layouts**: Three layout options available (force-directed, hierarchical, radial); smooth transition between layouts.
8. **Zoom & Pan**: Graph supports zoom (mouse scroll, pinch), pan (click-drag), and center-on-node (double-click); minimap shows viewport position.
9. **Severity Filtering**: Toggle checkboxes filter edges by severity; unaffected nodes fade; filter state persists during session.
10. **Simulation Integration**: "Run Simulation" button passes scenario to what-if engine (Story 06); returns with simulated projections overlaid on impact graph.
11. **Recommendation Link**: Impact analysis links to prescriptive recommendations (Story 12) for actionable next steps.
12. **Fullscreen Mode**: Graph expands to fill viewport with floating controls; press Escape to exit.
13. **Analysis History**: Past analyses saved and browsable; clicking a historical analysis restores the graph and narrative.

### Non-Functional Requirements

1. **Performance**: Neo4j traversal queries return within 3 seconds for graphs up to 10,000 nodes; graph rendering achieves 60fps during interaction; initial page load < 2 seconds.
2. **Scalability**: Impact weight recalculation supports up to 365 days of historical data; graph visualization handles up to 50 nodes and 200 edges smoothly.
3. **Accessibility**: WCAG 2.1 AA compliant; screen reader announces module names and severity levels; keyboard navigation for graph nodes (Tab to next node, Enter to select).
4. **Responsiveness**: Graph adapts layout for all breakpoints; mobile view provides list-based alternative with preserved functionality.
5. **Security**: Graph data scoped to user's hospital; Neo4j queries parameterized to prevent injection; analysis sessions audited.

## Modified Files

```
app/
├── (dashboard)/
│   └── impact-analysis/
│       ├── page.tsx                              ⬜
│       ├── layout.tsx                            ⬜
│       ├── loading.tsx                           ⬜
│       ├── error.tsx                             ⬜
│       ├── history/page.tsx                      ⬜
│       └── components/
│           ├── ImpactAnalysisDashboard.tsx        ⬜
│           ├── ImpactScenarioSelector.tsx         ⬜
│           ├── ImpactGraph.tsx                    ⬜
│           ├── ForceDirectedGraph.tsx             ⬜
│           ├── HierarchicalGraph.tsx              ⬜
│           ├── RadialGraph.tsx                    ⬜
│           ├── ModuleNode.tsx                     ⬜
│           ├── ImpactEdge.tsx                     ⬜
│           ├── SeverityIndicator.tsx              ⬜
│           ├── GraphControls.tsx                  ⬜
│           ├── GraphLegend.tsx                    ⬜
│           ├── GraphMinimap.tsx                   ⬜
│           ├── ImpactCascadeDetail.tsx            ⬜
│           ├── ImpactModuleRow.tsx                ⬜
│           ├── ImpactNarrative.tsx                ⬜
│           ├── ImpactTimeline.tsx                 ⬜
│           ├── ImpactPathTracer.tsx               ⬜
│           ├── ImpactFlowDiagram.tsx              ⬜
│           └── hooks/
│               ├── useImpactGraph.ts              ⬜
│               ├── useImpactAnalysis.ts           ⬜
│               ├── useGraphLayout.ts              ⬜
│               ├── useGraphInteraction.ts         ⬜
│               ├── useImpactNarrative.ts          ⬜
│               ├── useImpactHistory.ts            ⬜
│               └── useImpactSimulation.ts         ⬜
├── lib/
│   ├── api/
│   │   ├── impact-analysis-api.ts                ⬜
│   │   ├── impact-graph-api.ts                   ⬜
│   │   └── impact-narrative-api.ts               ⬜
│   ├── graph/
│   │   ├── force-layout.ts                       ⬜
│   │   ├── hierarchical-layout.ts                ⬜
│   │   ├── radial-layout.ts                      ⬜
│   │   ├── graph-transforms.ts                   ⬜
│   │   └── impact-path-calculator.ts             ⬜
│   └── utils/
│       ├── impact-utils.ts                       ⬜
│       ├── severity-calculator.ts                ⬜
│       └── graph-color-mapper.ts                 ⬜
├── types/
│   ├── impact-analysis.types.ts                  ⬜
│   ├── impact-graph.types.ts                     ⬜
│   └── impact-scenario.types.ts                  ⬜
└── services/
    └── impact-analysis/
        ├── ImpactAnalysisEngine.ts               ⬜
        ├── GraphTraversalService.ts              ⬜
        ├── CascadeCalculator.ts                  ⬜
        ├── ImpactWeightModel.ts                  ⬜
        └── ImpactNarrativeGenerator.ts           ⬜
```

## Implementation Status
**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Neo4j Graph Model & Impact Engine (Sprint 1-2)
- [ ] Define TypeScript interfaces for impact scenario, graph nodes/edges, cascade paths, weight matrix
- [ ] Design Neo4j schema: Module nodes, IMPACTS relationships with weight/severity properties
- [ ] Implement `GraphTraversalService.ts` with Cypher query templates for cascade traversal, shortest path, orphan detection
- [ ] Build `CascadeCalculator.ts` with BFS traversal for downstream impact path enumeration
- [ ] Implement `ImpactWeightModel.ts` for historical correlation-based weight calculation (PostgreSQL aggregate queries -> Neo4j weight updates)
- [ ] Build `ImpactAnalysisEngine.ts` orchestrator combining graph traversal, weight application, and severity classification
- [ ] Create BullMQ job for impact weight recalculation (`recalculate-impact-weights`)
- [ ] Seed Neo4j with baseline module relationships and demo impact weights for pilot hospital
- [ ] Create PostgreSQL table `impact_analyses` for storing analysis results and history

### Phase 2: Graph Visualization (Sprint 3-4)
- [ ] Build `ImpactGraph.tsx` container with SVG viewport, resize handling, and layout engine dispatcher
- [ ] Implement `ForceDirectedGraph.tsx` with D3.js force simulation (center, charge, link, collision forces)
- [ ] Build `HierarchicalGraph.tsx` with tree layout (origin at top, cascades flowing downward)
- [ ] Implement `RadialGraph.tsx` with radial layout (origin at center, depth rings outward)
- [ ] Build `ModuleNode.tsx` SVG component with module color, icon, size scaling, label, and selection state
- [ ] Implement `ImpactEdge.tsx` SVG path with severity coloring, width scaling, hover tooltip, and animated dash for tracing
- [ ] Build `GraphControls.tsx` floating panel with zoom, layout toggle, severity filter, fullscreen
- [ ] Implement `GraphMinimap.tsx` overview component with viewport indicator
- [ ] Build `ImpactPathTracer.tsx` animated dot traversal with SVG animateMotion
- [ ] Implement `useGraphLayout` hook for D3 simulation lifecycle management
- [ ] Build `useGraphInteraction` hook for zoom/pan/select state management with d3-zoom

### Phase 3: Dashboard UI & AI Narrative (Sprint 5)
- [ ] Build `ImpactAnalysisDashboard.tsx` main page with scenario selector, graph, detail, narrative sections
- [ ] Implement `ImpactScenarioSelector.tsx` with module dropdown, change description input, parameter editor
- [ ] Build `ImpactCascadeDetail.tsx` table with severity badges, sortable columns, expandable rows
- [ ] Implement `ImpactNarrative.tsx` with Claude API streaming narrative generation
- [ ] Build `ImpactTimeline.tsx` showing chronological impact unfolding (lag days)
- [ ] Implement `ImpactFlowDiagram.tsx` Sankey/flow variant using D3.js sankey layout
- [ ] Build simulation integration: "Run Simulation" button linking to Story 06
- [ ] Implement recommendation link: connecting impact results to Story 12 prescriptive engine
- [ ] Build analysis history view with session replay capability

### Phase 4: Polish, Testing & Deployment (Sprint 6)
- [ ] Write unit tests for `CascadeCalculator`, `ImpactWeightModel`, `severity-calculator`, `impact-path-calculator`
- [ ] Write integration tests for Neo4j traversal queries with test graph data
- [ ] Write E2E tests (Playwright) for scenario input, graph interaction, path tracing, layout switching, fullscreen
- [ ] Performance testing: validate 3-second Neo4j query response for 10,000-node graphs
- [ ] Accessibility audit for graph SVG (aria-labels, keyboard nav, screen reader announcements)
- [ ] Mobile responsiveness testing across breakpoints; verify list-based fallback
- [ ] Cross-browser testing for SVG rendering and D3.js animations (Chrome, Firefox, Safari, Edge)

## Dependencies

### Internal Dependencies
- **Story 06** (What-If Simulations): Simulation engine for scenario execution; impact results feed back to visualization
- **Story 09** (Data Ingestion): Validated data in PostgreSQL/Neo4j required for accurate impact weight calculation
- **Story 10** (NL Query): Cross-module impact queries routed to this visualization
- **Story 12** (Prescriptive Recommendations): Recommendations link to impact visualization for downstream effects display
- **Story 13** (Module Configuration): Cross-module field linkages define which metrics are connected across modules
- **Neo4j Schema**: Module nodes and IMPACTS relationships must be seeded with baseline data
- **Shared UI Components**: `SeverityBadge`, `MetricCard`, `DataTable`, `SlidePanel` from design system

### External Dependencies
- **D3.js** (v7+): Force simulation, zoom behavior, layout algorithms, SVG manipulation
- **Neo4j JavaScript Driver** (v5+): Server-side Cypher query execution
- **Claude API**: Natural language impact narrative generation
- **Redis** (v7+): Graph layout caching, analysis result caching
- **React Flow** (optional): Alternative to D3.js for node-based graph rendering if D3 proves insufficient

## Risk Assessment

### Technical Risks

1. **D3.js Force Simulation Performance with Large Graphs**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Limit visible nodes to 50 (aggregate sub-module details); use WebGL renderer (d3-force-gpu) for > 50 nodes; debounce layout recalculation
   - Contingency: Fall back to static pre-computed layouts served from cache

2. **Neo4j Traversal Query Timeout for Deep Cascades**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Limit traversal depth to 4 hops (covers all 5 modules); use Neo4j query planner hints; index on hospitalId + module
   - Contingency: Pre-compute cascade paths nightly via BullMQ job; serve from cache

3. **Impact Weight Accuracy**
   - Impact: High
   - Likelihood: High
   - Mitigation: Start with expert-defined weights; validate against historical data; use correlation coefficients with confidence intervals; clear "estimated" labels on low-confidence weights
   - Contingency: Allow hospital administrators to manually adjust weights; flag auto-calculated weights as "provisional"

4. **SVG Rendering Cross-Browser Issues**
   - Impact: Low
   - Likelihood: Medium
   - Mitigation: Test on Chrome, Firefox, Safari, Edge; use standardized SVG elements; polyfill path animation
   - Contingency: Canvas-based rendering fallback via D3 canvas module

### Business Risks

1. **Director Comprehension of Graph Visualization**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Default to simplified hierarchical layout; prominent AI narrative in plain language; onboarding walkthrough with guided first analysis
   - Contingency: Offer table-only view without graph for users who prefer it

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
describe('CascadeCalculator', () => {
  it('should find all downstream paths from staffing module', () => {});
  it('should calculate total impact score for each cascade path', () => {});
  it('should respect maximum traversal depth of 4', () => {});
  it('should handle circular references without infinite loop', () => {});
});

describe('ImpactWeightModel', () => {
  it('should calculate correlation coefficient between staffing and bed occupancy', () => {});
  it('should apply lag adjustment for delayed impacts', () => {});
  it('should assign low confidence to weights with few data points', () => {});
});

describe('severity-calculator', () => {
  it('should classify >10% delta with >80% confidence as HIGH', () => {});
  it('should classify 5-10% delta as MEDIUM', () => {});
  it('should classify <5% delta as LOW', () => {});
});
```

### Integration Tests
```typescript
describe('Impact Analysis Pipeline', () => {
  it('should run complete impact analysis from scenario to graph result', () => {});
  it('should generate Claude narrative from analysis result', () => {});
  it('should persist analysis to history and retrieve correctly', () => {});
  it('should trigger simulation from analysis result', () => {});
});
```

### E2E Tests (Playwright)
```typescript
test.describe('Impact Visualization', () => {
  test('should submit scenario and display impact graph within 5 seconds', async ({ page }) => {});
  test('should trace cascade path with animated dot traversal', async ({ page }) => {});
  test('should switch between force, hierarchical, and radial layouts', async ({ page }) => {});
  test('should filter edges by severity and fade unaffected nodes', async ({ page }) => {});
  test('should zoom, pan, and center on selected node', async ({ page }) => {});
  test('should enter and exit fullscreen mode', async ({ page }) => {});
});
```

## Performance Considerations

### Graph Rendering
- D3.js force simulation limited to 300 ticks (alpha decay 0.01) for fast convergence
- Node/edge rendering uses SVG groups with `transform` for efficient re-positioning (no DOM manipulation)
- Zoom/pan uses CSS transform on SVG container (hardware-accelerated)
- Path tracing animation uses SVG `animateMotion` (offloaded to browser rendering engine)
- Graph layout cached in Redis after initial computation; restored on revisit

### Data Processing
- Impact weight recalculation runs as background BullMQ job (not blocking UI)
- Neo4j traversal queries use parameterized Cypher with compiled query plans
- PostgreSQL aggregate queries for weight calculation use materialized views (refreshed daily)
- Analysis results cached in Redis with 15-minute TTL

### Frontend Optimization
- D3.js dynamically imported (not in initial bundle; loaded on route entry)
- Graph renders in stages: nodes first (< 100ms), edges second (< 200ms), labels third (< 300ms)
- Severity filter toggles use CSS visibility (no DOM re-creation)
- Full-screen uses native Fullscreen API (no layout recalculation)

## Deployment Plan

### Development Phase
- Feature flag: `FEATURE_IMPACT_VISUALIZATION` controls module visibility
- Mock Neo4j data: seeded graph with 5 modules, 12 relationships, and demo impact weights
- D3.js prototype: standalone HTML page for force simulation tuning before React integration
- Storybook stories for each graph component (ModuleNode, ImpactEdge, GraphControls)

### Staging Phase
- End-to-end test with production-sized graph data (50 nodes, 200 edges from pilot hospital)
- Performance benchmark: measure graph render time, Neo4j query latency, animation FPS
- Cross-browser testing on Chrome, Firefox, Safari, Edge
- Accessibility audit (axe-core + manual screen reader testing)

### Production Phase
- Canary release to single pilot hospital
- Monitor graph rendering performance, Neo4j query times, Claude narrative quality
- Gradual rollout: 25% -> 50% -> 100% over 2 weeks
- Rollback trigger: graph render > 5 seconds or Neo4j query timeout rate > 10%

## Monitoring & Analytics

### Performance Metrics
- Neo4j cascade traversal query time (p50, p95, p99)
- Graph rendering FPS during force simulation
- Impact analysis total response time (scenario -> graph render)
- Claude narrative generation time

### Business Metrics
- Impact analyses per director per week
- Most common origin modules for scenarios
- Average cascade depth (how many modules affected)
- Simulation trigger rate from impact analysis
- Recommendation click-through rate from impact view

### Technical Metrics
- D3.js force simulation tick count to convergence
- Redis graph cache hit rate
- SVG DOM node count during rendering
- WebSocket/SSE connection stability for narrative streaming

### Alerting Rules
- Neo4j traversal timeout rate > 5% -> Warning alert
- Graph rendering FPS < 30 during interaction -> Performance alert
- Impact weight recalculation job failure -> Critical alert

## Documentation Requirements

### Technical Documentation
- Neo4j graph schema documentation (Module nodes, IMPACTS relationships, property schemas)
- D3.js force simulation configuration guide (force strengths, tick limits, layout parameters)
- Impact weight calculation methodology (correlation analysis, lag adjustment, confidence scoring)
- Cypher query reference for cascade traversal, shortest path, and orphan detection

### User Documentation
- Hospital Director Impact Analysis Guide: creating scenarios, reading the graph, understanding severity
- Graph Interaction Guide: zoom, pan, layout switching, path tracing, fullscreen
- Understanding Impact Weights: how the system calculates cross-module relationships
- Connecting Impact Analysis to Simulations and Recommendations

## Post-Launch Review

### Success Criteria
- Neo4j traversal queries under 3 seconds for all hospitals
- Graph renders at 60fps during interaction on modern browsers
- >= 50% of directors use impact visualization weekly within 60 days
- Directors report >= 40% improvement in cross-departmental decision confidence
- Zero circular reference bugs in cascade calculation
- Impact narratives rated "helpful" by >= 80% of users

### Retrospective Items
- Evaluate D3.js vs. React Flow vs. Cytoscape.js for graph rendering based on production experience
- Assess whether 3 layout types are sufficient or if custom layouts are needed
- Review impact weight accuracy by comparing predicted vs. actual outcomes after decisions
- Gather director feedback on narrative quality and actionability
- Analyze whether mobile list-based fallback provides sufficient value or needs rethinking
