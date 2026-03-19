# 10 Query Hospital Data Using Natural Language - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story

As a **hospital administrator**, I want **to ask questions about my hospital's data in natural language and receive actionable answers**, so that **I can get insights quickly without needing technical expertise or waiting for analyst reports**.

## Pre-conditions

- Hospital data has been ingested and validated through the Data Ingestion Pipeline (Story 09)
- PostgreSQL contains structured analytics data across all five modules (staffing, beds, supply chain, finance, anomaly)
- Neo4j graph database contains entity relationships for cross-module queries
- Claude API access configured with hospital-specific context and healthcare guardrails
- User authenticated with `hospital_administrator` or `hospital_director` role
- At least 30 days of historical data available for meaningful trend analysis
- Data Quality score (Story 08) is above minimum threshold (>= 80% pass rate) for queried modules

## Business Requirements

- **Query Response Time**: 90% of natural language queries return answers within 10 seconds (measured end-to-end from question submission to answer render)
- **Answer Accuracy**: >= 85% of answers rated as "accurate" or "helpful" by administrators in feedback mechanism (measured monthly)
- **Adoption Rate**: >= 60% of hospital administrators use NL query interface at least once per week within 90 days of launch
- **Guardrail Effectiveness**: Zero hallucinated clinical recommendations; all responses grounded in actual hospital data with source citations
- **Confidence Transparency**: Every answer displays a confidence indicator; low-confidence answers explicitly flagged with "human verification recommended"
- **Visualization Relevance**: >= 80% of answers include at least one supporting data visualization (chart, table, or trend line)

## Technical Specifications

### Integration Points
- **Claude API**: Anthropic Claude for natural language understanding, query decomposition, answer synthesis, and healthcare-specific guardrails
- **PostgreSQL**: Structured data queries across staffing, bed allocation, supply chain, finance, and anomaly detection modules
- **Neo4j**: Graph traversal queries for relationship-based questions (e.g., "How does Ward A staffing affect bed utilization?")
- **Redis**: Query result caching (5-minute TTL), conversation history storage, rate limiting
- **Speech-to-Text**: Web Speech API (browser-native) for voice input; fallback to manual text entry
- **Recharts/D3.js**: Dynamic chart generation based on Claude-determined visualization type
- **Story 11** (Cross-Module Impact): NL queries about cross-module effects routed to impact visualization engine
- **Story 12** (Prescriptive Recommendations): Queries like "What should I do about X?" routed to recommendation engine

### Security Requirements
- All NL queries and responses logged for audit trail; PHI in query logs encrypted at rest
- Claude API calls use server-side proxy; API keys never exposed to client
- Query results scoped to user's hospital; multi-tenant isolation enforced at query layer
- Rate limiting: 30 queries per user per hour; 200 queries per hospital per hour
- Response sanitization: Claude outputs filtered for any data outside the user's hospital scope
- Healthcare guardrails prevent Claude from providing direct medical advice or clinical diagnoses

## Design Specifications

### Visual Layout & Components

**NL Query Interface Layout**:
```
+------------------------------------------------------------------+
| [TopNav: MedicalPro Logo | Modules | Settings | User Avatar]     |
+------------------------------------------------------------------+
| [Sidebar]  |  [NLQueryInterface]                                 |
|            |  +------------------------------------------------+ |
| Analytics  |  | Ask anything about your hospital data...       | |
|  > Query   |  | +--------------------------------------------+| |
|  > History |  | | [mic icon] Type your question here...  [->] || |
|  > Saved   |  | +--------------------------------------------+| |
|            |  |                                                | |
|            |  | Suggested Questions:                           | |
|            |  | [Why is my revenue lower this quarter?]        | |
|            |  | [What is our current bed occupancy rate?]      | |
|            |  | [Which departments are overstaffed?]           | |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | [QueryResponsePanel]                           | |
|            |  |                                                | |
|            |  | Q: Why is my revenue lower this quarter?       | |
|            |  | ■ Confidence: High (92%)    [Sources: 3]      | |
|            |  |                                                | |
|            |  | Your hospital's Q3 revenue decreased by 12%   | |
|            |  | ($2.4M -> $2.1M) compared to Q2. The primary  | |
|            |  | drivers are:                                   | |
|            |  |                                                | |
|            |  | 1. Elective surgery volume down 18% due to    | |
|            |  |    OR scheduling bottleneck (Ward C)           | |
|            |  | 2. Insurance claim rejection rate increased    | |
|            |  |    from 4% to 9% (coding errors)               | |
|            |  | 3. Outpatient visits stable (+2%)              | |
|            |  |                                                | |
|            |  | +------------------------------------------+ | |
|            |  | | [Revenue Trend Chart - Line Chart]        | | |
|            |  | | Q1: $2.5M  Q2: $2.4M  Q3: $2.1M         | | |
|            |  | |  ----____                                 | | |
|            |  | |          ----____                          | | |
|            |  | +------------------------------------------+ | |
|            |  |                                                | |
|            |  | +------------------------------------------+ | |
|            |  | | Revenue Breakdown Table                   | | |
|            |  | | Category    | Q2      | Q3      | Delta  | | |
|            |  | | Surgery     | $1.2M   | $0.98M  | -18%   | | |
|            |  | | Outpatient  | $0.8M   | $0.82M  | +2%    | | |
|            |  | | Insurance   | $0.4M   | $0.30M  | -25%   | | |
|            |  | +------------------------------------------+ | |
|            |  |                                                | |
|            |  | Data Sources: Finance Module (Q1-Q3 2024),    | |
|            |  | Staffing Module (OR schedules), Claims DB      | |
|            |  |                                                | |
|            |  | [Was this helpful? 👍 👎] [Save] [Share] [Ask Follow-up] |
|            |  +------------------------------------------------+ |
|            |                                                      |
|            |  +------------------------------------------------+ |
|            |  | Follow-up Suggestions:                         | |
|            |  | [What caused the claim rejection increase?]    | |
|            |  | [Show OR scheduling details for Ward C]        | |
|            |  | [Compare this quarter to same period last yr]  | |
|            |  +------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
<AppLayout>
  <TopNavigation />
  <Sidebar activeModule="analytics-query" />
  <MainContent>
    <NLQueryInterface>
      <QueryInputBar>
        <VoiceInputButton />
        <QueryTextInput />
        <QuerySubmitButton />
      </QueryInputBar>
      <SuggestedQuestions />
      <QueryResponsePanel>
        <QueryHeader>
          <ConfidenceBadge />
          <SourceCountBadge />
        </QueryHeader>
        <AnswerText />
        <DynamicVisualization>
          <LineChart /> | <BarChart /> | <PieChart /> | <DataTable /> | <TrendLine />
        </DynamicVisualization>
        <DataSourceCitations />
        <ResponseFeedback />
        <ResponseActions /> <!-- Save, Share, Follow-up -->
      </QueryResponsePanel>
      <FollowUpSuggestions />
      <ConversationHistory />
    </NLQueryInterface>
    <SavedQueriesPanel />
    <QueryHistoryPanel />
  </MainContent>
</AppLayout>
```

### Design System Compliance

**Color Usage**:
```css
/* NL Query-specific colors */
--query-input-bg: var(--bg-secondary);        /* #F6F8F8 */
--query-input-focus: var(--primary-cerulean);  /* #00B3C6 */
--query-bubble-user: var(--primary-ink);       /* #031926 */
--query-bubble-system: var(--bg-card);         /* #FFFFFF */

/* Confidence indicator colors */
--confidence-high: #28A745;                    /* >= 85% */
--confidence-medium: #FFB74D;                  /* 60-84% */
--confidence-low: #DC3545;                     /* < 60% */

/* Visualization accent colors (Kairos palette) */
--chart-primary: var(--primary-teal);          /* #007B7A */
--chart-secondary: var(--primary-cerulean);    /* #00B3C6 */
--chart-tertiary: var(--primary-gold);         /* #C9A84A */
--chart-quaternary: var(--secondary-deep);     /* #0F3440 */
```

**Typography**:
```css
/* Query input: Inter medium for readability */
.query-input { font-family: var(--font-body); font-weight: 500; font-size: var(--text-lg); }
/* Answer text: Inter regular, generous line height */
.answer-text { font-family: var(--font-body); font-weight: 400; font-size: var(--text-base); line-height: 1.75; }
/* Section headings in answers: Merriweather */
.answer-heading { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-xl); }
/* Data values in tables/charts: JetBrains Mono for alignment */
.data-value { font-family: var(--font-mono); font-weight: 500; font-size: var(--text-sm); }
```

### Responsive Behavior

| Breakpoint | Layout Adaptation |
|---|---|
| Desktop (>= 1280px) | Sidebar + full query interface with inline visualizations and data tables |
| Laptop (1024-1279px) | Collapsed sidebar; query input pinned to top; visualizations stack vertically |
| Tablet (768-1023px) | Bottom nav replaces sidebar; full-width query input; charts resize to container width |
| Mobile (< 768px) | Full-screen query input with voice emphasis; answers in scrollable cards; charts become swipeable carousel |

### Interaction Patterns

- **Query Submission**: Type query + Enter or click submit; voice input starts on mic tap, stops on silence detection or second tap; loading state shows animated dots with "Analyzing your data..." message
- **Streaming Response**: Answer text streams token-by-token from Claude API for perceived speed; visualizations render after full answer is computed
- **Confidence Indicator**: Colored badge (green/amber/red) with percentage; hover tooltip explains confidence calculation; low confidence shows inline warning banner
- **Source Citations**: Clickable source tags (e.g., "Finance Module Q1-Q3 2024") open source data detail in side panel
- **Follow-up Questions**: AI-generated follow-up suggestions appear below each answer; clicking pre-fills query input; conversation context maintained for multi-turn queries
- **Voice Input**: Pulsing mic icon during recording; real-time transcription shown in input; "Did you mean?" correction if speech recognition uncertain
- **Feedback Loop**: Thumbs up/down on each answer; optional comment on thumbs down; data feeds into answer quality metrics

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── analytics/
│       └── query/
│           ├── page.tsx                              # NL Query interface entry
│           ├── layout.tsx                            # Query module layout
│           ├── loading.tsx                           # Initial load skeleton
│           ├── error.tsx                             # Error boundary
│           ├── history/
│           │   └── page.tsx                          # Query history view
│           ├── saved/
│           │   └── page.tsx                          # Saved queries view
│           └── components/
│               ├── NLQueryInterface.tsx               # Main query container
│               ├── QueryInputBar.tsx                  # Input with voice + text
│               ├── VoiceInputButton.tsx               # Web Speech API voice input
│               ├── SuggestedQuestions.tsx              # AI-generated question suggestions
│               ├── QueryResponsePanel.tsx             # Answer display container
│               ├── ConfidenceBadge.tsx                # Confidence score indicator
│               ├── AnswerRenderer.tsx                 # Markdown/structured answer renderer
│               ├── DynamicVisualization.tsx            # Chart/table renderer based on data type
│               ├── DataSourceCitations.tsx             # Clickable source references
│               ├── ResponseFeedback.tsx                # Thumbs up/down feedback
│               ├── FollowUpSuggestions.tsx             # AI-suggested follow-up questions
│               ├── ConversationThread.tsx              # Multi-turn conversation view
│               ├── SavedQueriesPanel.tsx               # Saved query list + management
│               ├── QueryHistoryPanel.tsx               # Past query log
│               ├── StreamingAnswerText.tsx             # Token-by-token streaming display
│               └── hooks/
│                   ├── useNLQuery.ts                   # Query submission + streaming
│                   ├── useVoiceInput.ts                # Web Speech API integration
│                   ├── useConversationContext.ts       # Multi-turn conversation state
│                   ├── useQueryHistory.ts              # History persistence + retrieval
│                   ├── useSavedQueries.ts              # Saved query CRUD
│                   ├── useQueryFeedback.ts             # Feedback submission
│                   └── useVisualizationData.ts         # Chart data parsing + rendering
├── lib/
│   ├── api/
│   │   ├── nl-query-api.ts                           # NL Query REST/streaming client
│   │   ├── query-history-api.ts                      # History CRUD client
│   │   └── query-feedback-api.ts                     # Feedback submission client
│   └── utils/
│       ├── query-utils.ts                            # Query formatting helpers
│       ├── visualization-mapper.ts                   # Map data types to chart types
│       ├── confidence-calculator.ts                  # Confidence score display logic
│       └── source-citation-parser.ts                 # Parse source refs from Claude response
├── types/
│   ├── nl-query.types.ts                             # NL Query domain types
│   ├── conversation.types.ts                         # Conversation/thread types
│   └── visualization.types.ts                        # Chart/visualization types
└── services/
    └── nl-query/
        ├── NLQueryOrchestrator.ts                    # Main query processing pipeline
        ├── QueryDecomposer.ts                        # Break NL query into data operations
        ├── QueryRouter.ts                            # Route sub-queries to appropriate data sources
        ├── AnswerSynthesizer.ts                      # Combine data results into natural language
        ├── HealthcareGuardrails.ts                   # Healthcare-specific safety filters
        ├── VisualizationGenerator.ts                 # Determine and generate chart specs
        └── ConversationManager.ts                    # Multi-turn context management
```

### State Management Architecture

```typescript
// types/nl-query.types.ts

/** Natural language query submitted by the user */
interface NLQuery {
  id: string;
  hospitalId: string;
  userId: string;
  questionText: string;
  inputMethod: 'text' | 'voice';
  conversationId: string | null;      // null for new conversations
  parentQueryId: string | null;       // For follow-up questions
  submittedAt: string;
}

/** Decomposed query components after Claude analysis */
interface DecomposedQuery {
  intent: QueryIntent;
  entities: ExtractedEntity[];
  timeframe: QueryTimeframe;
  modules: HospitalModule[];
  subQueries: DataSubQuery[];
  requiresGraphTraversal: boolean;
}

type QueryIntent =
  | 'explain_trend'          // "Why is revenue lower?"
  | 'current_status'         // "What is our bed occupancy?"
  | 'compare'                // "Compare staffing Q2 vs Q3"
  | 'forecast'               // "What will next month look like?"
  | 'recommend'              // "What should I do about overtime?"
  | 'drill_down'             // "Show me details for Ward C"
  | 'anomaly_inquiry'        // "What's unusual about this week?"
  | 'cross_module_impact';   // "How does X affect Y?"

interface ExtractedEntity {
  type: 'department' | 'ward' | 'staff_role' | 'metric' | 'time_period' | 'procedure' | 'cost_center';
  value: string;
  normalizedValue: string;
  confidence: number;
}

interface QueryTimeframe {
  type: 'absolute' | 'relative' | 'comparison';
  start: string;                       // ISO 8601
  end: string;
  comparisonPeriod: { start: string; end: string } | null;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

interface DataSubQuery {
  id: string;
  targetSource: 'postgresql' | 'neo4j';
  module: HospitalModule;
  queryType: 'aggregate' | 'trend' | 'comparison' | 'relationship' | 'detail';
  sqlTemplate: string | null;          // For PostgreSQL queries
  cypherTemplate: string | null;       // For Neo4j queries
  parameters: Record<string, unknown>;
}

/** Complete answer response from the NL Query system */
interface NLQueryResponse {
  id: string;
  queryId: string;
  answerText: string;                  // Markdown-formatted answer
  confidence: ConfidenceScore;
  visualizations: VisualizationSpec[];
  dataSources: DataSourceCitation[];
  followUpSuggestions: string[];
  processingTimeMs: number;
  tokenUsage: { input: number; output: number };
  guardrailFlags: GuardrailFlag[];
}

interface ConfidenceScore {
  overall: number;                     // 0-100
  dataCompleteness: number;            // How complete is the underlying data
  queryInterpretation: number;         // How confident in understanding the question
  answerGrounding: number;             // How well answer is supported by data
  level: 'high' | 'medium' | 'low';
  explanation: string;                 // Human-readable confidence explanation
}

interface DataSourceCitation {
  module: HospitalModule;
  tableName: string;
  timeframeUsed: string;
  recordCount: number;
  dataQualityScore: number;            // From Story 08
  description: string;                 // e.g., "Finance Module - Revenue data Q1-Q3 2024"
}

interface GuardrailFlag {
  type: 'clinical_advice_blocked' | 'low_data_quality' | 'incomplete_data' | 'hallucination_risk' | 'scope_limitation';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// types/visualization.types.ts

interface VisualizationSpec {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'data_table' | 'trend_line' | 'gauge' | 'heatmap';
  title: string;
  data: ChartDataPoint[] | TableData;
  config: ChartConfig;
}

interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  timestamp?: string;
}

interface TableData {
  headers: string[];
  rows: (string | number)[][];
  highlightRows?: number[];            // Row indexes to highlight
}

interface ChartConfig {
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisType: 'category' | 'time';
  currency: boolean;                   // Format values as currency
  percentage: boolean;                 // Format values as percentage
  showTrendLine: boolean;
  showDataLabels: boolean;
  colors: string[];                    // Kairos palette colors
}

// types/conversation.types.ts

interface Conversation {
  id: string;
  hospitalId: string;
  userId: string;
  title: string;                       // Auto-generated from first question
  turns: ConversationTurn[];
  createdAt: string;
  lastActivityAt: string;
  isSaved: boolean;
}

interface ConversationTurn {
  queryId: string;
  questionText: string;
  response: NLQueryResponse;
  feedback: QueryFeedback | null;
  timestamp: string;
}

interface QueryFeedback {
  rating: 'helpful' | 'not_helpful';
  comment: string | null;
  submittedAt: string;
}

interface SavedQuery {
  id: string;
  hospitalId: string;
  userId: string;
  questionText: string;
  label: string;
  tags: string[];
  lastRunAt: string;
  runCount: number;
}

// --- State Management ---

interface NLQueryPageState {
  query: {
    currentInput: string;
    isSubmitting: boolean;
    isStreaming: boolean;
    streamedText: string;
    error: string | null;
  };
  voice: {
    isRecording: boolean;
    isSupported: boolean;
    interimTranscript: string;
  };
  conversation: {
    activeConversation: Conversation | null;
    turns: ConversationTurn[];
    contextWindow: string[];           // Recent context for Claude
  };
  response: {
    currentResponse: NLQueryResponse | null;
    visualizations: VisualizationSpec[];
    isLoadingVisualizations: boolean;
  };
  history: {
    items: Conversation[];
    isLoading: boolean;
    searchQuery: string;
    pagination: PaginationState;
  };
  saved: {
    items: SavedQuery[];
    isLoading: boolean;
  };
  suggestions: {
    questions: string[];
    isLoading: boolean;
  };
}
```

### API Integration Schema

```typescript
// --- REST API Endpoints ---

// Submit NL Query (streaming response)
// POST /api/v1/analytics/query
interface SubmitNLQueryRequest {
  questionText: string;
  hospitalId: string;
  conversationId?: string;
  parentQueryId?: string;
  inputMethod: 'text' | 'voice';
  preferredVisualization?: VisualizationSpec['type'];
}
// Response: Server-Sent Events (SSE) stream
// Event types:
//   data: { type: 'text_delta', content: string }
//   data: { type: 'visualization', spec: VisualizationSpec }
//   data: { type: 'source_citation', citation: DataSourceCitation }
//   data: { type: 'confidence', score: ConfidenceScore }
//   data: { type: 'follow_up', suggestions: string[] }
//   data: { type: 'guardrail', flag: GuardrailFlag }
//   data: { type: 'done', response: NLQueryResponse }

// Get Query History
// GET /api/v1/analytics/query/history?hospitalId={id}&userId={id}&page={n}&pageSize={n}&search={text}
interface GetQueryHistoryResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// Get Conversation Detail
// GET /api/v1/analytics/query/conversations/{conversationId}
interface GetConversationResponse {
  success: boolean;
  data: Conversation;
}

// Submit Feedback
// POST /api/v1/analytics/query/{queryId}/feedback
interface SubmitQueryFeedbackRequest {
  rating: 'helpful' | 'not_helpful';
  comment?: string;
}
interface SubmitQueryFeedbackResponse {
  success: boolean;
  data: { feedbackId: string };
}

// Save Query
// POST /api/v1/analytics/query/saved
interface SaveQueryRequest {
  questionText: string;
  label: string;
  tags: string[];
  hospitalId: string;
}
interface SaveQueryResponse {
  success: boolean;
  data: SavedQuery;
}

// Get Saved Queries
// GET /api/v1/analytics/query/saved?hospitalId={id}&userId={id}
interface GetSavedQueriesResponse {
  success: boolean;
  data: SavedQuery[];
}

// Delete Saved Query
// DELETE /api/v1/analytics/query/saved/{queryId}

// Re-run Saved Query
// POST /api/v1/analytics/query/saved/{queryId}/run
// Response: Same SSE stream as SubmitNLQuery

// Get Suggested Questions
// GET /api/v1/analytics/query/suggestions?hospitalId={id}&context={module}
interface GetSuggestedQuestionsResponse {
  success: boolean;
  data: {
    questions: string[];
    basedOn: string; // e.g., "recent anomalies", "trending metrics"
  };
}

// --- Server-Side Pipeline (NestJS) ---

// NLQueryOrchestrator pipeline steps:
// 1. QueryDecomposer: NL question -> DecomposedQuery (via Claude API)
// 2. QueryRouter: DecomposedQuery -> DataSubQuery[] -> Execute against PostgreSQL/Neo4j
// 3. AnswerSynthesizer: Raw data results + original question -> NLQueryResponse (via Claude API)
// 4. VisualizationGenerator: Data results -> VisualizationSpec[] (determined by data shape)
// 5. HealthcareGuardrails: Filter response for safety + compliance

// --- Claude API Integration ---

interface ClaudeQueryDecompositionPrompt {
  system: string;   // Healthcare context + decomposition rules
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  tools: Array<{
    name: 'query_postgresql' | 'query_neo4j' | 'get_module_schema';
    description: string;
    input_schema: Record<string, unknown>;
  }>;
}

interface ClaudeAnswerSynthesisPrompt {
  system: string;   // Answer formatting rules + guardrails + citation requirements
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  // Context injection:
  // - Original question
  // - Decomposed query plan
  // - Raw data results from PostgreSQL/Neo4j
  // - Hospital metadata (name, modules enabled, data quality scores)
  // - Conversation history (for follow-up context)
}

// BullMQ job for async query processing (complex queries > 10s)
interface AsyncQueryJob {
  name: 'process-nl-query';
  data: {
    queryId: string;
    query: NLQuery;
    decomposedQuery: DecomposedQuery;
  };
}
```

## Implementation Requirements

### Core Components

1. **NLQueryInterface.tsx** - Main container orchestrating the query experience. Manages conversation state, routes between query input, response display, and history views. Server component that hydrates with suggested questions; delegates streaming to client children.

2. **QueryInputBar.tsx** - Client component with text input (auto-expanding textarea), voice input button, and submit button. Handles keyboard shortcuts (Enter to submit, Shift+Enter for newline). Debounced auto-suggest as user types.

3. **VoiceInputButton.tsx** - Client component wrapping Web Speech API (`SpeechRecognition`). Displays pulsing mic icon during recording. Shows interim transcription in real-time. Falls back to disabled state with tooltip on unsupported browsers.

4. **QueryResponsePanel.tsx** - Client component receiving SSE stream from API. Renders answer progressively (streaming text), then charts/tables after complete. Includes confidence badge, source citations, and feedback buttons.

5. **StreamingAnswerText.tsx** - Client component that renders Claude streaming output token-by-token. Uses `requestAnimationFrame` for smooth rendering. Handles markdown formatting (headers, lists, bold, links) during streaming.

6. **DynamicVisualization.tsx** - Renders the appropriate chart component based on `VisualizationSpec.type`. Uses Recharts for line/bar/pie charts. Uses custom HTML table for data tables. Responsive sizing with ResizeObserver.

7. **ConfidenceBadge.tsx** - Color-coded badge showing confidence percentage and level. Green >= 85%, amber 60-84%, red < 60%. Hover popover shows breakdown (data completeness, query interpretation, answer grounding).

8. **DataSourceCitations.tsx** - Renders clickable source tags below the answer. Each tag shows module name, timeframe, and record count. Clicking opens a side panel with data quality details.

9. **FollowUpSuggestions.tsx** - Renders AI-generated follow-up question chips below the response. Clicking a suggestion auto-populates the query input and submits. Styled as outlined pill buttons in cerulean.

10. **ConversationThread.tsx** - Displays multi-turn conversation history for the active conversation. User questions in ink-colored bubbles (right-aligned); system answers in white cards (left-aligned).

11. **ResponseFeedback.tsx** - Thumbs up/down buttons with optional comment modal on thumbs-down. Persists feedback to API. Shows "Thank you for your feedback" confirmation.

12. **SavedQueriesPanel.tsx** - List of saved queries with labels, tags, and last-run date. Click to re-run; long-press/right-click to edit label/tags or delete.

### Custom Hooks

1. **useNLQuery(hospitalId)** - Core query submission hook. Establishes SSE connection to `/api/v1/analytics/query`. Manages streaming state (text accumulation, visualization parsing, confidence extraction). Returns `{ submitQuery, streamedText, response, isStreaming, error, abort }`.

2. **useVoiceInput()** - Wraps Web Speech API. Returns `{ isRecording, isSupported, interimTranscript, finalTranscript, startRecording, stopRecording, error }`. Language set to `en-US` with continuous mode disabled (stop on silence).

3. **useConversationContext(conversationId)** - Manages multi-turn conversation state. Maintains context window (last 5 turns) for Claude API. Returns `{ conversation, addTurn, clearConversation, switchConversation }`.

4. **useQueryHistory(hospitalId, userId)** - Fetches paginated query history. Supports search filtering. Returns `{ conversations, isLoading, search, loadMore }`.

5. **useSavedQueries(hospitalId, userId)** - CRUD for saved queries. Returns `{ savedQueries, saveQuery, deleteQuery, rerunQuery, isLoading }`.

6. **useQueryFeedback(queryId)** - Submits feedback for a specific query response. Returns `{ submitFeedback, isSubmitted, isSubmitting }`.

7. **useVisualizationData(specs)** - Parses `VisualizationSpec[]` into chart-ready data. Handles currency formatting, percentage formatting, color assignment from Kairos palette. Returns `{ charts, tables, isReady }`.

### Utility Functions

1. **visualization-mapper.ts** - `mapDataToVisualization(dataShape, intent)`: Determines optimal chart type based on data shape (time series -> line chart, categorical comparison -> bar chart, proportional -> pie chart, tabular -> data table).

2. **confidence-calculator.ts** - `formatConfidence(score)`: Returns `{ level, color, label, explanation }`. `getConfidenceBreakdown(score)`: Returns detailed breakdown for popover display.

3. **source-citation-parser.ts** - `parseCitations(claudeResponse)`: Extracts structured source references from Claude's markdown response. `formatCitation(citation)`: Returns display string with module name, timeframe, quality badge.

4. **query-utils.ts** - `generateConversationTitle(firstQuestion)`, `truncateQueryPreview(text, maxLength)`, `formatProcessingTime(ms)`, `buildContextWindow(turns, maxTokens)`.

## Acceptance Criteria

### Functional Requirements

1. **Natural Language Input**: Administrator can type any question in English about hospital data; system accepts queries up to 500 characters.
2. **Voice Input**: Administrator can tap microphone icon and speak a question; speech transcribed to text in real-time; confirmed and submitted on silence detection or manual stop.
3. **Query Interpretation**: System correctly interprets query intent (explain trend, current status, compare, forecast, recommend, drill-down, anomaly, cross-module) with >= 85% accuracy.
4. **Data Retrieval**: System queries appropriate PostgreSQL tables and/or Neo4j graph based on decomposed query; results scoped to user's hospital.
5. **Answer Generation**: Clear, natural language answer generated from data; answers cite specific numbers, percentages, and comparisons; no fabricated data.
6. **Streaming Response**: Answer text streams to user token-by-token via SSE; complete answer renders in < 10 seconds for 90% of queries.
7. **Visualizations**: Answers include appropriate charts/tables; chart type matched to data shape (trend -> line chart, comparison -> bar chart, breakdown -> pie chart, detail -> table).
8. **Confidence Display**: Every answer shows confidence score with color-coded badge; low-confidence answers display inline warning recommending human verification.
9. **Source Citations**: Every answer cites specific data sources (module, table, timeframe, record count); citations are clickable to show detail.
10. **Healthcare Guardrails**: System refuses to provide direct clinical diagnoses or treatment recommendations; responses flagged when data quality is below threshold; out-of-scope queries handled gracefully.
11. **Follow-up Questions**: After each answer, system suggests 2-3 relevant follow-up questions; conversation context maintained across turns.
12. **Query History**: All queries and responses persisted; searchable history view; conversations grouped by session.
13. **Saved Queries**: Administrator can save frequently used queries with custom labels and tags; saved queries can be re-run with current data.
14. **Feedback Mechanism**: Each answer has thumbs up/down rating; thumbs-down allows optional comment; feedback data persisted for quality improvement.

### Non-Functional Requirements

1. **Performance**: 90% of queries answered within 10 seconds end-to-end; streaming first token within 2 seconds; dashboard initial load < 2 seconds.
2. **Reliability**: Graceful handling of Claude API timeouts (30-second timeout); retry once on transient failure; clear error message to user.
3. **Scalability**: Support 50 concurrent queries per hospital; Redis caching for repeated similar queries (5-minute TTL).
4. **Accessibility**: WCAG 2.1 AA compliant; voice input fallback to text; screen reader announces streaming text completion; keyboard navigation for all actions.
5. **Security**: Query logs encrypted; PHI in responses scoped to user's hospital; rate limiting prevents abuse; Claude API key server-side only.
6. **Cost Management**: Token usage tracked per query; monthly usage dashboard for hospital; alert at 80% of monthly budget.

## Modified Files

```
app/
├── (dashboard)/
│   └── analytics/
│       └── query/
│           ├── page.tsx                              ⬜
│           ├── layout.tsx                            ⬜
│           ├── loading.tsx                           ⬜
│           ├── error.tsx                             ⬜
│           ├── history/page.tsx                      ⬜
│           ├── saved/page.tsx                        ⬜
│           └── components/
│               ├── NLQueryInterface.tsx               ⬜
│               ├── QueryInputBar.tsx                  ⬜
│               ├── VoiceInputButton.tsx               ⬜
│               ├── SuggestedQuestions.tsx              ⬜
│               ├── QueryResponsePanel.tsx             ⬜
│               ├── StreamingAnswerText.tsx             ⬜
│               ├── ConfidenceBadge.tsx                ⬜
│               ├── AnswerRenderer.tsx                 ⬜
│               ├── DynamicVisualization.tsx            ⬜
│               ├── DataSourceCitations.tsx             ⬜
│               ├── ResponseFeedback.tsx                ⬜
│               ├── FollowUpSuggestions.tsx             ⬜
│               ├── ConversationThread.tsx              ⬜
│               ├── SavedQueriesPanel.tsx               ⬜
│               ├── QueryHistoryPanel.tsx               ⬜
│               └── hooks/
│                   ├── useNLQuery.ts                   ⬜
│                   ├── useVoiceInput.ts                ⬜
│                   ├── useConversationContext.ts       ⬜
│                   ├── useQueryHistory.ts              ⬜
│                   ├── useSavedQueries.ts              ⬜
│                   ├── useQueryFeedback.ts             ⬜
│                   └── useVisualizationData.ts         ⬜
├── lib/
│   ├── api/
│   │   ├── nl-query-api.ts                           ⬜
│   │   ├── query-history-api.ts                      ⬜
│   │   └── query-feedback-api.ts                     ⬜
│   └── utils/
│       ├── query-utils.ts                            ⬜
│       ├── visualization-mapper.ts                   ⬜
│       ├── confidence-calculator.ts                  ⬜
│       └── source-citation-parser.ts                 ⬜
├── types/
│   ├── nl-query.types.ts                             ⬜
│   ├── conversation.types.ts                         ⬜
│   └── visualization.types.ts                        ⬜
└── services/
    └── nl-query/
        ├── NLQueryOrchestrator.ts                    ⬜
        ├── QueryDecomposer.ts                        ⬜
        ├── QueryRouter.ts                            ⬜
        ├── AnswerSynthesizer.ts                      ⬜
        ├── HealthcareGuardrails.ts                   ⬜
        ├── VisualizationGenerator.ts                 ⬜
        └── ConversationManager.ts                    ⬜
```

## Implementation Status
**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Claude API Integration & Query Pipeline (Sprint 1-2)
- [ ] Define TypeScript interfaces for NL queries, responses, conversations, visualizations
- [ ] Implement `NLQueryOrchestrator.ts` as the main pipeline orchestrator
- [ ] Build `QueryDecomposer.ts` with Claude API tool-use for query decomposition into structured sub-queries
- [ ] Build `QueryRouter.ts` to route sub-queries to PostgreSQL (aggregate/trend) or Neo4j (relationship/graph)
- [ ] Implement `AnswerSynthesizer.ts` with Claude API for natural language answer generation from raw data
- [ ] Build `HealthcareGuardrails.ts` with filters for clinical advice prevention, hallucination risk, data quality warnings
- [ ] Implement `VisualizationGenerator.ts` to determine optimal chart type from data shape and generate `VisualizationSpec`
- [ ] Build `ConversationManager.ts` for multi-turn context window management (last 5 turns)
- [ ] Set up SSE streaming endpoint (`POST /api/v1/analytics/query`) in NestJS
- [ ] Create PostgreSQL tables for `nl_queries`, `conversations`, `query_feedback`, `saved_queries`
- [ ] Configure Claude API prompt templates with healthcare system prompts and tool definitions

### Phase 2: Frontend Query Interface (Sprint 3-4)
- [ ] Build `NLQueryInterface.tsx` main container with server-side suggested questions
- [ ] Implement `QueryInputBar.tsx` with auto-expanding textarea, Enter/Shift+Enter handling
- [ ] Build `VoiceInputButton.tsx` with Web Speech API integration and fallback handling
- [ ] Implement `StreamingAnswerText.tsx` with SSE consumption and progressive markdown rendering
- [ ] Build `DynamicVisualization.tsx` with Recharts integration for line/bar/pie charts and HTML tables
- [ ] Implement `ConfidenceBadge.tsx` with color-coded indicator and hover breakdown popover
- [ ] Build `DataSourceCitations.tsx` with clickable source tags and detail side panel
- [ ] Implement `FollowUpSuggestions.tsx` with auto-submit on click
- [ ] Build `ConversationThread.tsx` with multi-turn display and scroll-to-latest
- [ ] Implement `ResponseFeedback.tsx` with rating + optional comment modal
- [ ] Build `QueryInputBar` voice transcription display with "Did you mean?" correction

### Phase 3: History, Saved Queries & Suggestions (Sprint 5)
- [ ] Build `QueryHistoryPanel.tsx` with paginated conversation list and search
- [ ] Implement `SavedQueriesPanel.tsx` with CRUD operations and re-run functionality
- [ ] Build `SuggestedQuestions.tsx` with AI-generated context-aware suggestions
- [ ] Implement query caching in Redis (5-minute TTL for identical queries)
- [ ] Build rate limiting middleware (30 queries/user/hour, 200 queries/hospital/hour)
- [ ] Implement token usage tracking and monthly budget alerting

### Phase 4: Polish, Testing & Deployment (Sprint 6)
- [ ] Write unit tests for `QueryDecomposer`, `QueryRouter`, `HealthcareGuardrails`, `VisualizationGenerator`
- [ ] Write integration tests for end-to-end query pipeline (NL question -> SSE stream -> rendered answer)
- [ ] Write E2E tests (Playwright) for query submission, voice input, conversation flow, history search, saved queries
- [ ] Performance testing: validate 10-second response time for 90th percentile queries
- [ ] Accessibility audit for voice input, streaming text, chart accessibility (alt text, data tables)
- [ ] Security audit: PHI scoping, rate limiting, Claude API key protection, query log encryption
- [ ] User acceptance testing with hospital administrators (>= 5 test sessions with feedback)

## Dependencies

### Internal Dependencies
- **Story 08** (Data Quality Dashboard): Data quality scores used in confidence calculation and guardrail warnings
- **Story 09** (Data Ingestion Pipeline): Validated, standardized data in PostgreSQL/Neo4j required for accurate query answers
- **Story 11** (Cross-Module Impact): Cross-module queries routed to impact visualization engine
- **Story 12** (Prescriptive Recommendations): "What should I do?" queries routed to recommendation engine
- **Authentication & RBAC**: Hospital scoping; `hospital_administrator` and `hospital_director` roles
- **Shared UI Components**: `MetricCard`, `SlidePanel`, `Badge`, chart components from design system

### External Dependencies
- **Claude API** (Anthropic): Primary AI layer for query decomposition, answer synthesis, guardrails
- **Recharts** (v2.x): Chart rendering for line, bar, pie, and gauge visualizations
- **Web Speech API**: Browser-native speech recognition for voice input
- **Redis** (v7+): Query result caching, rate limiting, conversation context storage
- **EventSource polyfill**: SSE client for browsers with limited EventSource support

## Risk Assessment

### Technical Risks

1. **Claude API Latency Exceeds 10-Second Target**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Streaming SSE for perceived speed; cache common query patterns; pre-compute frequent metrics; decompose complex queries into parallel sub-queries
   - Contingency: Offer "processing" notification with email delivery for queries exceeding 30 seconds

2. **Query Decomposition Accuracy Below 85%**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Extensive prompt engineering with healthcare-specific examples; use Claude tool-use for structured output; iterative prompt refinement based on feedback data
   - Contingency: Fall back to guided query builder with dropdowns for module, metric, timeframe selection

3. **Hallucination in Answers Despite Guardrails**
   - Impact: Critical
   - Likelihood: Low
   - Mitigation: All answers require grounding in actual query results; guardrail layer validates numbers in answer match data; confidence score penalizes vague data
   - Contingency: Add human-review requirement for low-confidence answers; prominent disclaimer on all AI-generated insights

4. **Voice Input Browser Compatibility**
   - Impact: Low
   - Likelihood: Medium
   - Mitigation: Feature detection with graceful degradation; text input always available; clear unsupported browser message
   - Contingency: Server-side speech-to-text via AWS Transcribe as fallback

### Business Risks

1. **Low Administrator Adoption**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Onboarding tutorial with guided first query; suggested questions seeded with hospital-relevant examples; email digest of "questions other administrators asked"
   - Contingency: Embed query input prominently on every module dashboard page

2. **Claude API Cost Exceeds Budget**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Token usage tracking; aggressive caching (5-min TTL); query length limits (500 chars); hospital-level monthly budgets
   - Contingency: Tiered query limits per pricing plan; fallback to pre-computed reports for common questions

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
describe('QueryDecomposer', () => {
  it('should identify "Why is revenue lower?" as explain_trend intent with finance module', () => {});
  it('should extract time period from "this quarter" as current calendar quarter', () => {});
  it('should decompose multi-module question into parallel sub-queries', () => {});
  it('should handle ambiguous queries with clarification prompt', () => {});
});

describe('HealthcareGuardrails', () => {
  it('should block responses containing direct clinical diagnoses', () => {});
  it('should flag answers when underlying data quality score < 80%', () => {});
  it('should add disclaimer to predictive/forecast answers', () => {});
  it('should prevent cross-hospital data leakage in multi-tenant environment', () => {});
});

describe('VisualizationGenerator', () => {
  it('should generate line chart spec for time-series revenue data', () => {});
  it('should generate bar chart spec for department comparison data', () => {});
  it('should generate data table spec for detailed record listings', () => {});
  it('should use Kairos color palette for all chart specs', () => {});
});
```

### Integration Tests (Supertest)
```typescript
describe('NL Query Pipeline', () => {
  it('should stream answer for simple single-module revenue question', () => {});
  it('should handle cross-module query requiring both PostgreSQL and Neo4j', () => {});
  it('should maintain conversation context across follow-up questions', () => {});
  it('should enforce rate limiting at user and hospital levels', () => {});
  it('should return cached result for identical query within TTL window', () => {});
});
```

### E2E Tests (Playwright)
```typescript
test.describe('NL Query Interface', () => {
  test('should submit text query and display streaming answer with visualization', async ({ page }) => {});
  test('should record voice input and auto-submit on silence', async ({ page }) => {});
  test('should display confidence badge and source citations', async ({ page }) => {});
  test('should navigate follow-up suggestions and maintain conversation', async ({ page }) => {});
  test('should save query and re-run from saved queries panel', async ({ page }) => {});
  test('should display healthcare guardrail warning for clinical question', async ({ page }) => {});
});
```

## Performance Considerations

### Query Pipeline Optimization
- Claude API streaming reduces perceived latency (first token in < 2 seconds)
- Parallel sub-query execution (PostgreSQL + Neo4j queries run concurrently)
- Redis caching of identical queries (SHA-256 hash of normalized question text) with 5-minute TTL
- Pre-computed materialized views for common metrics (daily revenue, weekly occupancy, monthly staffing)
- Query decomposition result caching for similar question patterns

### Frontend Performance
- SSE connection with automatic reconnection and backoff
- Progressive rendering: text first, then visualizations (avoids layout shift)
- Chart lazy loading: Recharts dynamically imported only when visualization is present
- Virtualized conversation history for long threads (react-window)
- Image/chart thumbnails for history preview (avoid re-rendering full charts)

### Cost Optimization
- Token counting before Claude API calls; reject queries that would exceed budget
- Conversation context pruning: only last 5 turns sent to Claude (reduces input tokens)
- Common query pattern detection and pre-computed answer templates
- Cache hit rate target: >= 25% of queries served from Redis cache

## Deployment Plan

### Development Phase
- Feature flag: `FEATURE_NL_QUERY_INTERFACE` controls visibility
- Mock Claude API responses for frontend development (recorded response fixtures)
- Seed conversation history with 50 sample queries and answers per demo hospital
- Local Redis instance for caching and rate limiting development

### Staging Phase
- End-to-end testing with live Claude API (staging API key with lower rate limits)
- Load test: 50 concurrent users submitting queries for 30 minutes
- SSE reliability test: maintain streaming connections for 1 hour
- Security audit: verify hospital data isolation, rate limiting, API key protection
- Cost projection: measure average tokens per query; project monthly cost per hospital

### Production Phase
- Canary release to single pilot hospital with monitoring
- Monitor query success rate, response time, confidence distribution, feedback ratings
- Gradual rollout: 25% -> 50% -> 100% over 2 weeks
- Rollback trigger: success rate < 90% or p95 latency > 20 seconds
- Weekly review of guardrail flags and feedback ratings for prompt tuning

## Monitoring & Analytics

### Performance Metrics
- Query-to-first-token latency (p50, p95, p99)
- End-to-end query response time (p50, p95, p99)
- Claude API token usage per query (input, output, total)
- SSE stream reliability (dropped connections, reconnections)
- Cache hit rate for query results

### Business Metrics
- Daily/weekly active users of NL query interface
- Queries per user per day (target: >= 3 for active users)
- Feedback rating distribution (helpful vs. not helpful)
- Top query intents and modules queried
- Follow-up question usage rate
- Saved query count and re-run frequency

### Technical Metrics
- Claude API error rate and timeout rate
- Query decomposition accuracy (measured via feedback on misinterpreted queries)
- Redis cache memory utilization
- SSE connection pool usage
- Rate limiting trigger frequency

### Alerting Rules
- Claude API error rate > 5% for 5 minutes -> PagerDuty alert
- Query p95 latency > 20 seconds -> Warning alert
- Monthly token budget at 80% consumption -> Budget alert
- Feedback "not helpful" rate > 30% in rolling 24 hours -> Quality alert
- SSE connection failures > 10% in 5 minutes -> Infrastructure alert

## Documentation Requirements

### Technical Documentation
- Claude API prompt engineering guide (system prompts, tool definitions, decomposition examples)
- Query pipeline architecture diagram (NL input -> decompose -> route -> execute -> synthesize -> stream)
- Healthcare guardrails specification (blocked patterns, data quality thresholds, compliance rules)
- SSE streaming protocol documentation (event types, reconnection strategy, error handling)
- Visualization auto-selection algorithm documentation (data shape -> chart type mapping)

### User Documentation
- Getting Started Guide: first query walkthrough with examples
- Query Tips: how to ask effective questions (specify timeframe, module, metric)
- Voice Input Guide: supported browsers, tips for clear speech recognition
- Understanding Confidence Scores: what high/medium/low confidence means and when to verify
- Saved Queries & History: managing frequently used queries

## Post-Launch Review

### Success Criteria
- 90% of queries answered within 10 seconds end-to-end
- >= 85% of answers rated "helpful" by administrators
- >= 60% of administrators use NL query at least weekly within 90 days
- Zero instances of hallucinated data or cross-hospital data leakage
- Claude API cost within 120% of projected monthly budget
- Healthcare guardrails block 100% of inappropriate clinical advice queries

### Retrospective Items
- Review top "not helpful" feedback to identify query decomposition or answer synthesis improvements
- Analyze most common query patterns for pre-computation and caching optimization
- Evaluate Claude API cost vs. accuracy tradeoff; consider model size optimization for simple queries
- Assess administrator onboarding friction; refine suggested questions based on actual usage patterns
- Survey administrators on most desired query capabilities not yet supported
- Evaluate whether graph-based queries via Neo4j provide sufficient value or if PostgreSQL is sufficient for most queries
