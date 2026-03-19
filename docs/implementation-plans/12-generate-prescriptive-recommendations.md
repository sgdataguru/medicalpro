# 12 Generate Prescriptive Action Recommendations - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story

As a **hospital administrator**, I want **to receive prescriptive recommendations that suggest specific actions to optimize operations**, so that **I can act on data-driven advice rather than just reviewing descriptive reports of what already happened**.

## Pre-conditions

- Predictive models for all five modules (staffing, bed allocation, supply chain, finance, anomaly detection) are trained and producing forecasts
- Historical data for at least 90 days ingested and validated (Story 09) with data quality score >= 85%
- Cross-module impact analysis engine (Story 11) operational for downstream effect projection
- What-if simulation engine (Story 06) available for recommendation impact validation
- Claude API configured with healthcare-specific prescriptive prompt templates
- User authenticated with `hospital_administrator` or `hospital_director` role
- PostgreSQL stores recommendation history, user actions (accept/defer/dismiss), and feedback for reinforcement learning loop

## Business Requirements

- **Recommendation Quality**: >= 70% of accepted recommendations produce measurable positive outcomes within 90 days (measured by comparing predicted vs. actual metric changes)
- **Actionability**: 100% of recommendations include specific action steps, reasoning, supporting data, and expected outcomes
- **Adoption Rate**: >= 50% of administrators interact with recommendations weekly; >= 30% accept at least one recommendation per month
- **Prioritization Accuracy**: Recommendations ranked by impact/urgency; top-3 recommendations rated as "most important" by >= 80% of administrators in survey
- **Learning Loop**: Recommendation relevance improves >= 10% quarter-over-quarter (measured by acceptance rate trend)
- **Response Time**: Recommendations generated and displayed within 15 seconds of predictive model output availability

## Technical Specifications

### Integration Points
- **Predictive Model Layer**: Receives forecasts from staffing, bed allocation, supply chain, finance, and anomaly detection models (PostgreSQL + Redis cache)
- **Claude API**: Generates natural language recommendation narratives, reasoning explanations, and expected outcome projections
- **Neo4j Graph Database**: Cross-module relationship traversal for understanding downstream effects of each recommendation
- **What-If Simulation Engine** (Story 06): Validates recommendations by running recommended scenarios through simulation
- **Cross-Module Impact Visualization** (Story 11): Each recommendation links to its impact visualization
- **BullMQ**: Asynchronous recommendation generation pipeline triggered by new predictive model outputs
- **Redis**: Caching generated recommendations, user preference profiles, and recommendation scoring models
- **Notification Service**: Push/email notifications for urgent high-priority recommendations

### Security Requirements
- Recommendations containing PHI-adjacent data (patient counts, staff names) access-controlled by role
- Recommendation accept/defer/dismiss actions logged with user attribution and rationale in immutable audit trail
- Hospital-scoped recommendations: multi-tenant isolation prevents cross-hospital recommendation leakage
- Claude API calls for recommendation generation use server-side proxy; no PII sent to Claude
- Recommendation data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Administrator rationale for dismissing recommendations not visible to other hospitals

## Design Specifications

### Visual Layout & Components

**Prescriptive Recommendations Dashboard Layout**:
```
+------------------------------------------------------------------+
| [TopNav: MedicalPro Logo | Modules | Settings | User Avatar]     |
+------------------------------------------------------------------+
| [Sidebar]     |  [RecommendationDashboard]                       |
|               |  +----------------------------------------------+|
| Recomm.       |  | Active Recommendations (7)  [Filter v]     | |
|  > Active     |  +----------------------------------------------+|
|  > Accepted   |                                                   |
|  > Deferred   |  +----------------------------------------------+|
|  > Dismissed  |  | [RecommendationCard - HIGH PRIORITY]         | |
|  > History    |  | #R-2024-0142  |  Bed Allocation  | URGENT   | |
|               |  |                                              | |
| Analytics     |  | Reallocate 15 beds from Ward A to Ward B     | |
|  > Outcomes   |  |                                              | |
|  > Trends     |  | Expected Impact:                             | |
|               |  | - Reduce overflow risk by 30%                | |
|               |  | - Increase Ward B utilization from 72% to 89%| |
|               |  | - Revenue uplift: +$45K/quarter              | |
|               |  |                                              | |
|               |  | Confidence: 87%  |  Based on: 180 days data  | |
|               |  |                                              | |
|               |  | [Accept] [Defer 7d] [Dismiss] [View Impact]  | |
|               |  +----------------------------------------------+|
|               |                                                   |
|               |  +----------------------------------------------+|
|               |  | [RecommendationCard - MEDIUM PRIORITY]       | |
|               |  | #R-2024-0143  |  Staffing  |  IMPORTANT     | |
|               |  |                                              | |
|               |  | Increase weekend RN shifts by 3 FTEs in     | |
|               |  | Emergency Department                         | |
|               |  |                                              | |
|               |  | Expected Impact:                             | |
|               |  | - Reduce patient wait time by 22 minutes     | |
|               |  | - Decrease overtime costs by $8K/month       | |
|               |  | - Improve patient satisfaction score +0.6pts | |
|               |  |                                              | |
|               |  | [Accept] [Defer 7d] [Dismiss] [View Impact]  | |
|               |  +----------------------------------------------+|
|               |                                                   |
|               |  +----------------------------------------------+|
|               |  | Recommendation Outcomes Summary              | |
|               |  | +------------------------------------------+| |
|               |  | | Accepted | Positive | Neutral | Negative || |
|               |  | |   24     |   18     |    4    |    2     || |
|               |  | +------------------------------------------+| |
|               |  | Success Rate: 75%   Avg Impact: +$62K/qtr  | |
|               |  +----------------------------------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
<AppLayout>
  <TopNavigation />
  <Sidebar activeModule="recommendations" />
  <MainContent>
    <RecommendationDashboard>
      <RecommendationFilters>
        <PriorityFilter />
        <ModuleFilter />
        <StatusFilter />
        <DateRangeFilter />
      </RecommendationFilters>
      <RecommendationList>
        <RecommendationCard>
          <RecommendationHeader>
            <PriorityBadge />
            <ModuleBadge />
            <UrgencyIndicator />
          </RecommendationHeader>
          <RecommendationBody>
            <ActionSummary />
            <ExpectedImpactList />
            <ConfidenceIndicator />
            <DataBasisLabel />
          </RecommendationBody>
          <RecommendationActions>
            <AcceptButton />
            <DeferButton />
            <DismissButton />
            <ViewImpactButton />
          </RecommendationActions>
        </RecommendationCard>
      </RecommendationList>
      <RecommendationDetail>
        <DetailReasoning />
        <SupportingDataTable />
        <ImpactProjectionChart />
        <SimulationPreview />
        <RelatedRecommendations />
      </RecommendationDetail>
      <RecommendationOutcomes>
        <OutcomeSummaryCards />
        <OutcomeTrendChart />
        <AcceptanceRateChart />
      </RecommendationOutcomes>
    </RecommendationDashboard>
  </MainContent>
</AppLayout>
```

### Design System Compliance

**Color Usage**:
```css
/* Priority colors */
--priority-urgent: #DC3545;                    /* Red - urgent action required */
--priority-high: #FFB74D;                      /* Amber - high priority */
--priority-medium: var(--primary-cerulean);     /* #00B3C6 - medium priority */
--priority-low: var(--secondary-silver);        /* #BFC9CC - low priority / informational */

/* Recommendation card accents */
--rec-card-border-urgent: 4px solid #DC3545;
--rec-card-border-high: 4px solid #FFB74D;
--rec-card-border-medium: 4px solid var(--primary-cerulean);
--rec-card-border-low: 4px solid var(--secondary-silver);

/* Action button colors */
--btn-accept: var(--primary-teal);             /* #007B7A - positive action */
--btn-defer: var(--secondary-silver);          /* #BFC9CC - neutral postpone */
--btn-dismiss: var(--text-muted);              /* #8A9899 - dismiss (not destructive) */

/* Outcome colors */
--outcome-positive: #28A745;
--outcome-neutral: var(--secondary-silver);
--outcome-negative: #DC3545;

/* Gold accent for premium recommendation insights */
--rec-insight-accent: var(--primary-gold);     /* #C9A84A */
```

**Typography**:
```css
/* Recommendation title: Merriweather semibold */
.rec-title { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-xl); color: var(--primary-ink); }
/* Action summary: Inter medium for emphasis */
.rec-action { font-family: var(--font-body); font-weight: 500; font-size: var(--text-lg); }
/* Impact metric values: JetBrains Mono bold */
.rec-impact-value { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-base); }
/* Reasoning text: Inter regular */
.rec-reasoning { font-family: var(--font-body); font-weight: 400; font-size: var(--text-sm); line-height: 1.6; }
```

### Responsive Behavior

| Breakpoint | Layout Adaptation |
|---|---|
| Desktop (>= 1280px) | Sidebar + recommendation list (2/3 width) + detail panel (1/3 width) |
| Laptop (1024-1279px) | Collapsed sidebar; recommendation cards full-width; detail opens as slide-over |
| Tablet (768-1023px) | Bottom nav; recommendation cards stacked; detail as modal |
| Mobile (< 768px) | Full-width recommendation cards; swipe actions (left=defer, right=accept); detail as full-screen overlay |

### Interaction Patterns

- **Card Priority Indication**: Left border color indicates priority; urgent cards show subtle pulse animation on first appearance
- **Accept Flow**: Click "Accept" -> Confirmation dialog with implementation notes textarea -> Success toast with "Track Implementation" link
- **Defer Flow**: Click "Defer" -> Select deferral period (7d/14d/30d/custom) -> Optional reason -> Card moves to "Deferred" with countdown badge
- **Dismiss Flow**: Click "Dismiss" -> Required rationale selection (not applicable, already done, disagree with analysis, other) + optional comment -> Card archived
- **View Impact**: Opens Story 11 impact visualization pre-loaded with this recommendation's scenario
- **Detail Expansion**: Click card -> Slide-in detail panel (desktop) or modal (mobile) with reasoning, data, projections, related recommendations
- **Swipe Actions (Mobile)**: Swipe right to accept, swipe left to defer; swipe requires confirmation
- **Notification Badge**: Sidebar recommendation icon shows count of new/urgent recommendations since last visit

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── recommendations/
│       ├── page.tsx                              # Recommendation dashboard entry
│       ├── layout.tsx                            # Recommendation module layout
│       ├── loading.tsx                           # Loading skeleton
│       ├── error.tsx                             # Error boundary
│       ├── [recommendationId]/
│       │   └── page.tsx                          # Single recommendation detail
│       ├── accepted/
│       │   └── page.tsx                          # Accepted recommendations + tracking
│       ├── history/
│       │   └── page.tsx                          # Historical recommendations + outcomes
│       ├── outcomes/
│       │   └── page.tsx                          # Outcome analytics dashboard
│       └── components/
│           ├── RecommendationDashboard.tsx        # Main container
│           ├── RecommendationFilters.tsx          # Priority/module/status/date filters
│           ├── RecommendationList.tsx             # Scrollable card list
│           ├── RecommendationCard.tsx             # Individual recommendation card
│           ├── PriorityBadge.tsx                  # Priority level indicator
│           ├── UrgencyIndicator.tsx               # Time-sensitive urgency badge
│           ├── ExpectedImpactList.tsx             # Bullet list of projected impacts
│           ├── RecommendationActions.tsx          # Accept/Defer/Dismiss buttons
│           ├── AcceptConfirmationDialog.tsx       # Accept confirmation with notes
│           ├── DeferDialog.tsx                    # Defer period selector
│           ├── DismissDialog.tsx                  # Dismiss rationale capture
│           ├── RecommendationDetail.tsx           # Full detail view
│           ├── DetailReasoning.tsx                # AI reasoning explanation
│           ├── SupportingDataTable.tsx            # Historical data supporting rec
│           ├── ImpactProjectionChart.tsx          # Projected impact visualization
│           ├── SimulationPreview.tsx              # Mini simulation result preview
│           ├── RelatedRecommendations.tsx         # Other recs for same module
│           ├── OutcomeSummaryCards.tsx             # Accepted rec outcome metrics
│           ├── OutcomeTrendChart.tsx              # Outcome success rate over time
│           ├── AcceptanceRateChart.tsx            # Acceptance/defer/dismiss rates
│           └── hooks/
│               ├── useRecommendations.ts          # Recommendation list + CRUD
│               ├── useRecommendationDetail.ts     # Single rec detail fetch
│               ├── useRecommendationActions.ts    # Accept/defer/dismiss mutations
│               ├── useRecommendationOutcomes.ts   # Outcome tracking data
│               ├── useRecommendationFilters.ts    # Filter state management
│               ├── useRecommendationNotifications.ts # New rec notification polling
│               └── useRecommendationLearning.ts   # Learning loop feedback data
├── lib/
│   ├── api/
│   │   ├── recommendations-api.ts                # Recommendation REST client
│   │   ├── recommendation-actions-api.ts         # Accept/defer/dismiss client
│   │   └── recommendation-outcomes-api.ts        # Outcome tracking client
│   └── utils/
│       ├── recommendation-utils.ts               # Formatting helpers
│       ├── priority-calculator.ts                # Priority scoring logic
│       └── outcome-tracker.ts                    # Outcome comparison logic
├── types/
│   ├── recommendation.types.ts                   # Core recommendation types
│   ├── recommendation-action.types.ts            # Action (accept/defer/dismiss) types
│   └── recommendation-outcome.types.ts           # Outcome tracking types
└── services/
    └── recommendations/
        ├── RecommendationEngine.ts               # Main recommendation generator
        ├── PredictiveModelAggregator.ts          # Collects outputs from all predictive models
        ├── PrescriptiveAnalyzer.ts               # Converts predictions to prescriptive actions
        ├── RecommendationPrioritizer.ts          # Ranks by impact * urgency * confidence
        ├── RecommendationNarrativeGenerator.ts   # Claude API narrative generation
        ├── OutcomeTracker.ts                     # Tracks accepted recommendation outcomes
        └── LearningLoopProcessor.ts              # Adjusts recommendations based on feedback
```

### State Management Architecture

```typescript
// types/recommendation.types.ts

/** A prescriptive recommendation generated by the system */
interface Recommendation {
  id: string;
  hospitalId: string;
  module: HospitalModule;
  status: 'active' | 'accepted' | 'deferred' | 'dismissed' | 'expired';
  priority: RecommendationPriority;
  urgency: RecommendationUrgency;

  // Content
  title: string;                                 // Short action statement
  actionSummary: string;                         // 1-2 sentence action description
  detailedReasoning: string;                     // Claude-generated reasoning (markdown)
  specificActions: ActionStep[];                  // Numbered action steps

  // Expected outcomes
  expectedImpacts: ExpectedImpact[];
  confidenceScore: number;                       // 0-100

  // Data basis
  dataBasis: DataBasis;
  predictiveModelId: string;                     // Source predictive model
  relatedRecommendationIds: string[];

  // Metadata
  generatedAt: string;
  expiresAt: string | null;                      // Some recommendations are time-sensitive
  lastViewedAt: string | null;
  viewCount: number;

  // Action taken
  action: RecommendationAction | null;
}

type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

interface RecommendationPriority {
  level: 'urgent' | 'high' | 'medium' | 'low';
  score: number;                                 // 0-100 composite score
  factors: PriorityFactor[];
}

interface PriorityFactor {
  name: string;                                  // e.g., "revenue_impact", "patient_safety", "cost_savings"
  weight: number;                                // 0-1
  value: number;                                 // 0-100
}

interface RecommendationUrgency {
  level: 'immediate' | 'this_week' | 'this_month' | 'next_quarter';
  reason: string;                                // e.g., "Bed overflow projected within 5 days"
  deadlineDate: string | null;
}

interface ActionStep {
  stepNumber: number;
  description: string;
  responsible: string;                           // Role responsible for this step
  estimatedDuration: string;                     // e.g., "2-3 days"
  dependencies: string[];                        // Step numbers that must complete first
}

interface ExpectedImpact {
  metricName: string;                            // e.g., "bed_overflow_risk"
  displayName: string;                           // e.g., "Bed Overflow Risk"
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  unit: string;                                  // e.g., "%", "$", "FTEs", "minutes"
  timeToImpact: string;                          // e.g., "2 weeks", "next quarter"
  confidence: number;
  direction: 'positive' | 'negative' | 'neutral';  // Positive = good for hospital
}

interface DataBasis {
  timeframeDays: number;                         // How many days of data analyzed
  recordCount: number;                           // Total records analyzed
  modules: HospitalModule[];                     // Which modules contributed data
  dataQualityScore: number;                      // From Story 08
  modelAccuracy: number;                         // Predictive model's historical accuracy
  lastDataUpdateAt: string;
}

// types/recommendation-action.types.ts

/** Record of action taken on a recommendation */
interface RecommendationAction {
  id: string;
  recommendationId: string;
  actionType: 'accept' | 'defer' | 'dismiss';

  // Accept-specific
  implementationNotes: string | null;
  targetImplementationDate: string | null;

  // Defer-specific
  deferUntilDate: string | null;
  deferReason: string | null;

  // Dismiss-specific
  dismissReason: DismissReason | null;
  dismissComment: string | null;

  // Common
  actionBy: string;                              // User ID
  actionAt: string;

  // Tracking
  outcome: RecommendationOutcome | null;
}

type DismissReason =
  | 'not_applicable'
  | 'already_implemented'
  | 'disagree_with_analysis'
  | 'insufficient_resources'
  | 'organizational_constraint'
  | 'other';

// types/recommendation-outcome.types.ts

/** Tracked outcome of an accepted recommendation */
interface RecommendationOutcome {
  id: string;
  recommendationId: string;
  actionId: string;

  // Comparison
  predictedImpacts: ExpectedImpact[];            // What was predicted
  actualImpacts: ActualImpact[];                 // What actually happened

  // Assessment
  overallResult: 'positive' | 'neutral' | 'negative';
  accuracyScore: number;                         // How close prediction was to reality (0-100)

  // Timeline
  implementedAt: string;
  measuredAt: string;
  measurementWindowDays: number;

  // Feedback
  administratorFeedback: string | null;
  lessonsLearned: string | null;
}

interface ActualImpact {
  metricName: string;
  displayName: string;
  baselineValue: number;                         // Value at time of implementation
  actualValue: number;                           // Value at measurement time
  delta: number;
  deltaPercentage: number;
  unit: string;
}

// --- State Management ---

interface RecommendationPageState {
  list: {
    recommendations: Recommendation[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
    newCount: number;                            // Unseen recommendations
  };
  filters: {
    priority: ('urgent' | 'high' | 'medium' | 'low')[];
    modules: HospitalModule[];
    status: Recommendation['status'][];
    dateRange: { from: string; to: string } | null;
    sortBy: 'priority' | 'date' | 'module' | 'confidence';
    sortOrder: 'asc' | 'desc';
  };
  detail: {
    selectedRecommendation: Recommendation | null;
    isDetailOpen: boolean;
    relatedRecommendations: Recommendation[];
    simulationPreview: SimulationPreviewData | null;
  };
  actions: {
    isProcessing: boolean;
    pendingAction: {
      recommendationId: string;
      actionType: 'accept' | 'defer' | 'dismiss';
    } | null;
  };
  outcomes: {
    summary: OutcomeSummary | null;
    trends: OutcomeTrend[];
    isLoading: boolean;
  };
}

interface OutcomeSummary {
  totalAccepted: number;
  positiveOutcomes: number;
  neutralOutcomes: number;
  negativeOutcomes: number;
  successRate: number;                           // Percentage
  averageImpactDollars: number;
  averageAccuracyScore: number;
}

interface OutcomeTrend {
  month: string;
  acceptedCount: number;
  successRate: number;
  averageImpact: number;
}

interface SimulationPreviewData {
  simulationId: string;
  summary: string;
  keyMetrics: { name: string; value: number; unit: string }[];
}
```

### API Integration Schema

```typescript
// --- REST API Endpoints ---

// Get Recommendations
// GET /api/v1/recommendations?hospitalId={id}&priority={urgent|high|medium|low}&module={staffing|...}&status={active|accepted|deferred|dismissed}&sortBy={priority|date|module|confidence}&sortOrder={asc|desc}&page={n}&pageSize={n}
interface GetRecommendationsResponse {
  success: boolean;
  data: {
    recommendations: Recommendation[];
    total: number;
    newCount: number;
    page: number;
    pageSize: number;
  };
}

// Get Single Recommendation Detail
// GET /api/v1/recommendations/{recommendationId}
interface GetRecommendationDetailResponse {
  success: boolean;
  data: Recommendation & {
    relatedRecommendations: Recommendation[];
    impactVisualizationUrl: string;              // Link to Story 11
    simulationPreview: SimulationPreviewData | null;
  };
}

// Accept Recommendation
// POST /api/v1/recommendations/{recommendationId}/accept
interface AcceptRecommendationRequest {
  implementationNotes: string;
  targetImplementationDate: string;
}
interface AcceptRecommendationResponse {
  success: boolean;
  data: {
    action: RecommendationAction;
    recommendation: Recommendation;
  };
}

// Defer Recommendation
// POST /api/v1/recommendations/{recommendationId}/defer
interface DeferRecommendationRequest {
  deferUntilDate: string;
  deferReason?: string;
}
interface DeferRecommendationResponse {
  success: boolean;
  data: {
    action: RecommendationAction;
    recommendation: Recommendation;
  };
}

// Dismiss Recommendation
// POST /api/v1/recommendations/{recommendationId}/dismiss
interface DismissRecommendationRequest {
  dismissReason: DismissReason;
  comment?: string;
}
interface DismissRecommendationResponse {
  success: boolean;
  data: {
    action: RecommendationAction;
    recommendation: Recommendation;
  };
}

// Get Recommendation Outcomes
// GET /api/v1/recommendations/outcomes?hospitalId={id}&startDate={date}&endDate={date}
interface GetRecommendationOutcomesResponse {
  success: boolean;
  data: {
    summary: OutcomeSummary;
    outcomes: RecommendationOutcome[];
    trends: OutcomeTrend[];
  };
}

// Record Outcome Measurement
// POST /api/v1/recommendations/{recommendationId}/outcome
interface RecordOutcomeRequest {
  actualImpacts: ActualImpact[];
  administratorFeedback: string;
  lessonsLearned?: string;
}
interface RecordOutcomeResponse {
  success: boolean;
  data: RecommendationOutcome;
}

// Get Recommendation Notifications
// GET /api/v1/recommendations/notifications?hospitalId={id}&userId={id}
interface GetRecommendationNotificationsResponse {
  success: boolean;
  data: {
    newRecommendations: number;
    urgentRecommendations: number;
    deferredExpiring: number;                    // Deferred recs about to expire
    outcomesReady: number;                       // Accepted recs ready for outcome measurement
  };
}

// Trigger Recommendation Generation (admin/system)
// POST /api/v1/recommendations/generate
interface TriggerRecommendationGenerationRequest {
  hospitalId: string;
  modules: HospitalModule[];
  forceRegenerate: boolean;
}
interface TriggerRecommendationGenerationResponse {
  success: boolean;
  data: {
    jobId: string;
    estimatedRecommendations: number;
  };
}

// --- BullMQ Job Definitions ---

interface RecommendationGenerationJob {
  name: 'generate-recommendations';
  data: {
    hospitalId: string;
    module: HospitalModule;
    predictiveModelOutputId: string;
    modelOutput: Record<string, unknown>;
  };
}

interface OutcomeEvaluationJob {
  name: 'evaluate-recommendation-outcome';
  data: {
    recommendationId: string;
    actionId: string;
    measurementWindowDays: number;
  };
}

interface LearningLoopJob {
  name: 'update-recommendation-learning-model';
  data: {
    hospitalId: string;
    outcomesBatch: RecommendationOutcome[];
  };
}

// --- Claude API Prompt Structures ---

interface ClaudePrescriptivePrompt {
  system: string; // Healthcare prescriptive analysis context + formatting rules
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  // Context includes:
  // - Predictive model output (forecasts, anomalies, trends)
  // - Historical hospital data (metrics, capacity, utilization)
  // - Current operational state (staffing levels, bed occupancy, supply levels)
  // - Cross-module impact weights from Neo4j
  // - Past recommendation outcomes (learning context)
  // - Hospital-specific constraints (budget, regulatory, staffing caps)
}
```

## Implementation Requirements

### Core Components

1. **RecommendationDashboard.tsx** - Main container rendering filter bar, recommendation list, and outcome summary. Server component fetches initial recommendations sorted by priority; delegates interaction to client children. Shows notification badge for new/urgent recommendations.

2. **RecommendationCard.tsx** - Client component rendering a single recommendation. Left border color indicates priority. Title, action summary, expected impacts list, confidence score, data basis, and action buttons. Compact view in list; expandable for detail.

3. **PriorityBadge.tsx** - Color-coded badge with label (URGENT/HIGH/MEDIUM/LOW). Urgent badge includes subtle pulse animation. Tooltip explains priority calculation factors.

4. **UrgencyIndicator.tsx** - Time-sensitive badge showing deadline or recommended action window (e.g., "Act within 5 days"). Red countdown for immediate urgency; amber for this-week; cerulean for this-month.

5. **ExpectedImpactList.tsx** - Renders bullet list of expected impacts with color-coded direction arrows (green up for positive, red down for negative). Each impact shows metric name, delta, and time-to-impact.

6. **RecommendationActions.tsx** - Three action buttons (Accept/Defer/Dismiss) + View Impact link. Accept styled as primary (teal gradient). Defer as secondary (outlined). Dismiss as ghost (muted). Each opens respective dialog.

7. **AcceptConfirmationDialog.tsx** - Modal with implementation notes textarea, target date picker, and confirmation button. Success redirects to accepted recommendations tracking view.

8. **DeferDialog.tsx** - Modal with predefined deferral periods (7d/14d/30d) and custom date picker. Optional reason text input. Warning if recommendation has urgency deadline.

9. **DismissDialog.tsx** - Modal with required dismiss reason radio buttons + optional comment textarea. Reason options: Not Applicable, Already Implemented, Disagree with Analysis, Insufficient Resources, Organizational Constraint, Other.

10. **RecommendationDetail.tsx** - Slide-in panel (desktop) or full-screen modal (mobile) showing complete recommendation with detailed reasoning, supporting data table, impact projection chart, simulation preview, and related recommendations.

11. **DetailReasoning.tsx** - Renders Claude-generated reasoning as markdown. Structured sections: Current Situation, Analysis, Recommendation Rationale, Risk Factors, Alternative Approaches.

12. **ImpactProjectionChart.tsx** - Line chart (Recharts) showing projected metric trajectory with and without recommendation implementation. Shaded confidence interval band. Current value, projected if no action, projected if recommendation accepted.

13. **OutcomeSummaryCards.tsx** - Four metric cards: Total Accepted, Success Rate, Average Impact ($), Average Accuracy. Color-coded positive/neutral/negative.

14. **OutcomeTrendChart.tsx** - Line + bar combo chart showing monthly acceptance count (bars) and success rate (line) over the last 12 months.

### Custom Hooks

1. **useRecommendations(hospitalId, filters)** - Fetches paginated recommendations with server-side filtering and sorting. Returns `{ recommendations, totalCount, newCount, isLoading, error, refresh }`. Polling every 60 seconds for new recommendations.

2. **useRecommendationDetail(recommendationId)** - Fetches single recommendation with related recommendations and simulation preview. Returns `{ recommendation, relatedRecs, simulationPreview, isLoading }`.

3. **useRecommendationActions(recommendationId)** - Accept, defer, and dismiss mutation functions. Returns `{ accept, defer, dismiss, isProcessing, error }`. Optimistic UI updates on action.

4. **useRecommendationOutcomes(hospitalId, dateRange)** - Fetches outcome summary, individual outcomes, and trends. Returns `{ summary, outcomes, trends, isLoading }`.

5. **useRecommendationFilters()** - Manages client-side filter state with URL query parameter synchronization. Returns `{ filters, setFilter, clearFilters, activeFilterCount }`.

6. **useRecommendationNotifications(hospitalId, userId)** - Polls notification counts every 30 seconds. Returns `{ newCount, urgentCount, deferredExpiringCount, outcomesReadyCount }`.

7. **useRecommendationLearning(hospitalId)** - Fetches learning loop metrics (acceptance rate trend, outcome accuracy trend). Returns `{ trends, isImproving, improvementRate }`.

### Utility Functions

1. **priority-calculator.ts** - `calculatePriorityScore(impacts, urgency, confidence, module)`: Weighted composite score (0-100). Factors: revenue impact (30%), patient safety (25%), cost savings (20%), operational efficiency (15%), compliance (10%). `classifyPriority(score)`: Maps score to level (urgent > 85, high > 65, medium > 40, low <= 40).

2. **outcome-tracker.ts** - `compareOutcome(predicted, actual)`: Calculates accuracy score and overall result (positive/neutral/negative). `calculateSuccessRate(outcomes)`: Returns rolling success rate. `computeROI(outcomes)`: Aggregates financial impact across accepted recommendations.

3. **recommendation-utils.ts** - `formatImpactDelta(impact)`, `formatUrgencyDeadline(urgency)`, `formatDataBasis(basis)`, `getModuleIcon(module)`, `sortRecommendations(recs, sortBy, sortOrder)`.

## Acceptance Criteria

### Functional Requirements

1. **Recommendation Generation**: System generates prescriptive recommendations from predictive model outputs for all five modules; recommendations include specific action steps, not just observations.
2. **Actionable Content**: Each recommendation contains title, action summary, numbered action steps, reasoning, expected impacts, confidence score, and data basis.
3. **Priority Ranking**: Recommendations sorted by composite priority score factoring revenue impact, patient safety, cost savings, operational efficiency, and compliance.
4. **Urgency Indicators**: Time-sensitive recommendations display urgency level and deadline; urgent recommendations trigger push notifications.
5. **Accept Flow**: Administrator can accept a recommendation with implementation notes and target date; accepted recommendations tracked in dedicated view.
6. **Defer Flow**: Administrator can defer a recommendation with selected period and optional reason; deferred recommendations resurface at expiry.
7. **Dismiss Flow**: Administrator can dismiss a recommendation with required rationale (from predefined categories + optional comment); dismissed recommendations archived.
8. **Rationale Tracking**: All accept/defer/dismiss actions logged with user, timestamp, and rationale in immutable audit trail.
9. **Impact Visualization**: "View Impact" button opens cross-module impact visualization (Story 11) pre-loaded with this recommendation's scenario.
10. **Outcome Tracking**: Accepted recommendations tracked against actual outcomes; predicted vs. actual comparison displayed after measurement window.
11. **Outcome Summary**: Dashboard shows overall success rate, average financial impact, and monthly outcome trends.
12. **Learning Loop**: System analyzes acceptance/dismissal patterns and outcome accuracy to improve future recommendation relevance (measurable quarter-over-quarter).
13. **Notification**: New urgent recommendations generate push notification; sidebar badge shows count of new/urgent recommendations.
14. **Related Recommendations**: Each recommendation detail shows related recommendations from the same or connected modules.

### Non-Functional Requirements

1. **Performance**: Recommendations generated within 15 seconds of predictive model output; recommendation list loads in < 2 seconds; actions (accept/defer/dismiss) respond in < 500ms.
2. **Reliability**: BullMQ recommendation generation survives worker restarts; failed generations retry 3 times; no duplicate recommendations for same prediction.
3. **Scalability**: Support up to 50 active recommendations per hospital; outcome evaluation scales with accepted recommendation count.
4. **Accessibility**: WCAG 2.1 AA compliant; action buttons keyboard-accessible (Accept=Enter, Defer=D, Dismiss=Backspace); screen reader announces priority and urgency.
5. **Security**: Recommendation actions audited; rationale data encrypted; hospital-scoped recommendations only.
6. **Data Integrity**: Recommendation-to-outcome linkage maintained; outcome measurements cannot be retroactively modified.

## Modified Files

```
app/
├── (dashboard)/
│   └── recommendations/
│       ├── page.tsx                              ⬜
│       ├── layout.tsx                            ⬜
│       ├── loading.tsx                           ⬜
│       ├── error.tsx                             ⬜
│       ├── [recommendationId]/page.tsx           ⬜
│       ├── accepted/page.tsx                     ⬜
│       ├── history/page.tsx                      ⬜
│       ├── outcomes/page.tsx                     ⬜
│       └── components/
│           ├── RecommendationDashboard.tsx        ⬜
│           ├── RecommendationFilters.tsx          ⬜
│           ├── RecommendationList.tsx             ⬜
│           ├── RecommendationCard.tsx             ⬜
│           ├── PriorityBadge.tsx                  ⬜
│           ├── UrgencyIndicator.tsx               ⬜
│           ├── ExpectedImpactList.tsx             ⬜
│           ├── RecommendationActions.tsx          ⬜
│           ├── AcceptConfirmationDialog.tsx       ⬜
│           ├── DeferDialog.tsx                    ⬜
│           ├── DismissDialog.tsx                  ⬜
│           ├── RecommendationDetail.tsx           ⬜
│           ├── DetailReasoning.tsx                ⬜
│           ├── SupportingDataTable.tsx            ⬜
│           ├── ImpactProjectionChart.tsx          ⬜
│           ├── SimulationPreview.tsx              ⬜
│           ├── RelatedRecommendations.tsx         ⬜
│           ├── OutcomeSummaryCards.tsx             ⬜
│           ├── OutcomeTrendChart.tsx              ⬜
│           ├── AcceptanceRateChart.tsx            ⬜
│           └── hooks/
│               ├── useRecommendations.ts          ⬜
│               ├── useRecommendationDetail.ts     ⬜
│               ├── useRecommendationActions.ts    ⬜
│               ├── useRecommendationOutcomes.ts   ⬜
│               ├── useRecommendationFilters.ts    ⬜
│               ├── useRecommendationNotifications.ts ⬜
│               └── useRecommendationLearning.ts   ⬜
├── lib/
│   ├── api/
│   │   ├── recommendations-api.ts                ⬜
│   │   ├── recommendation-actions-api.ts         ⬜
│   │   └── recommendation-outcomes-api.ts        ⬜
│   └── utils/
│       ├── recommendation-utils.ts               ⬜
│       ├── priority-calculator.ts                ⬜
│       └── outcome-tracker.ts                    ⬜
├── types/
│   ├── recommendation.types.ts                   ⬜
│   ├── recommendation-action.types.ts            ⬜
│   └── recommendation-outcome.types.ts           ⬜
└── services/
    └── recommendations/
        ├── RecommendationEngine.ts               ⬜
        ├── PredictiveModelAggregator.ts          ⬜
        ├── PrescriptiveAnalyzer.ts               ⬜
        ├── RecommendationPrioritizer.ts          ⬜
        ├── RecommendationNarrativeGenerator.ts   ⬜
        ├── OutcomeTracker.ts                     ⬜
        └── LearningLoopProcessor.ts              ⬜
```

## Implementation Status
**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Recommendation Engine Backend (Sprint 1-2)
- [ ] Define TypeScript interfaces for recommendations, actions, outcomes, priorities
- [ ] Implement `RecommendationEngine.ts` orchestrator receiving predictive model outputs
- [ ] Build `PredictiveModelAggregator.ts` to collect outputs from all five module prediction models
- [ ] Implement `PrescriptiveAnalyzer.ts` to convert predictive insights into specific action recommendations via Claude API
- [ ] Build `RecommendationPrioritizer.ts` with weighted composite scoring (revenue 30%, safety 25%, cost 20%, efficiency 15%, compliance 10%)
- [ ] Implement `RecommendationNarrativeGenerator.ts` with Claude API for reasoning, action steps, and expected outcome generation
- [ ] Create BullMQ jobs: `generate-recommendations`, `evaluate-recommendation-outcome`, `update-recommendation-learning-model`
- [ ] Create PostgreSQL migrations for `recommendations`, `recommendation_actions`, `recommendation_outcomes` tables
- [ ] Build deduplication logic to prevent duplicate recommendations for the same prediction
- [ ] Implement recommendation expiry logic for time-sensitive recommendations

### Phase 2: Outcome Tracking & Learning Loop (Sprint 3)
- [ ] Build `OutcomeTracker.ts` that compares predicted impacts against actual metrics after implementation
- [ ] Implement `LearningLoopProcessor.ts` that analyzes acceptance/dismissal patterns and outcome accuracy
- [ ] Create scheduled BullMQ job for outcome evaluation (runs daily, checks accepted recommendations past measurement window)
- [ ] Build learning model feedback loop: adjust priority weights and recommendation thresholds based on outcome data
- [ ] Implement outcome accuracy scoring algorithm (weighted metric-by-metric comparison)
- [ ] Create outcome notification: alert administrators when a measurement window is complete

### Phase 3: Frontend Dashboard & Card UI (Sprint 4-5)
- [ ] Build `RecommendationDashboard.tsx` main container with server-side initial data fetch
- [ ] Implement `RecommendationCard.tsx` with priority border, action summary, impact list, confidence, and action buttons
- [ ] Build `PriorityBadge.tsx` and `UrgencyIndicator.tsx` with color-coded indicators and animations
- [ ] Implement `RecommendationActions.tsx` with Accept/Defer/Dismiss button group
- [ ] Build `AcceptConfirmationDialog.tsx`, `DeferDialog.tsx`, `DismissDialog.tsx` modal dialogs
- [ ] Implement `RecommendationDetail.tsx` slide-in panel with reasoning, data, charts, related recommendations
- [ ] Build `DetailReasoning.tsx` markdown renderer with structured sections
- [ ] Implement `ImpactProjectionChart.tsx` with Recharts line chart and confidence interval band
- [ ] Build `OutcomeSummaryCards.tsx` and `OutcomeTrendChart.tsx` for outcome analytics view
- [ ] Implement `RecommendationFilters.tsx` with URL query parameter sync
- [ ] Build notification badge integration with sidebar icon
- [ ] Implement mobile swipe actions for accept/defer

### Phase 4: Polish, Testing & Deployment (Sprint 6)
- [ ] Write unit tests for `PrescriptiveAnalyzer`, `RecommendationPrioritizer`, `priority-calculator`, `OutcomeTracker`
- [ ] Write integration tests for end-to-end pipeline (prediction output -> recommendation generation -> accept -> outcome tracking)
- [ ] Write E2E tests (Playwright) for recommendation browse, accept flow, defer flow, dismiss flow, outcome review
- [ ] Performance testing: validate 15-second recommendation generation from model output
- [ ] Accessibility audit for action buttons, dialogs, card navigation, screen reader labels
- [ ] Security audit: rationale data encryption, audit trail completeness, hospital scoping
- [ ] User acceptance testing: 5 administrator sessions reviewing recommendation quality and actionability

## Dependencies

### Internal Dependencies
- **Predictive Models** (Stories 01-05): Staffing, bed allocation, supply chain, finance, and anomaly detection predictive model outputs
- **Story 06** (What-If Simulations): Validates recommended scenarios through simulation
- **Story 11** (Cross-Module Impact): Impact visualization for each recommendation's downstream effects
- **Story 09** (Data Ingestion): Validated data for accurate predictive model inputs
- **Story 08** (Data Quality Dashboard): Data quality scores used in confidence calculations
- **Authentication & RBAC**: `hospital_administrator` and `hospital_director` roles for recommendation actions
- **Notification Service**: Push/email notifications for urgent recommendations
- **Shared UI Components**: `MetricCard`, `Badge`, `Dialog`, `SlidePanel`, chart components

### External Dependencies
- **Claude API** (Anthropic): Prescriptive narrative generation, reasoning explanation, action step formulation
- **Recharts** (v2.x): Impact projection charts, outcome trend charts
- **BullMQ** (v5+): Recommendation generation, outcome evaluation, learning loop processing
- **Redis** (v7+): Recommendation caching, notification count caching, learning model state
- **date-fns**: Date manipulation for deferral periods, urgency deadlines, measurement windows

## Risk Assessment

### Technical Risks

1. **Recommendation Quality Below Threshold**
   - Impact: Critical
   - Likelihood: Medium
   - Mitigation: Human-in-the-loop validation for first 100 recommendations per hospital; A/B testing recommendation prompts; outcome-based feedback loop
   - Contingency: Add "Needs Review" intermediate state requiring senior administrator approval before surfacing

2. **Learning Loop Cold Start**
   - Impact: Medium
   - Likelihood: High
   - Mitigation: Seed with expert-defined priority weights and thresholds; use benchmarks from healthcare industry data; start with conservative (high-confidence-only) recommendations
   - Contingency: Manual priority adjustment by implementation consultants during first 90 days

3. **Outcome Attribution Complexity**
   - Impact: Medium
   - Likelihood: High
   - Mitigation: Clear measurement windows; control for external factors where possible; use relative change rather than absolute; administrator feedback as qualitative validation
   - Contingency: Mark outcome accuracy as "estimated" with clear methodology disclaimer

4. **Recommendation Fatigue (Too Many Recommendations)**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Limit to 10 active recommendations per hospital; group related recommendations; configurable notification thresholds
   - Contingency: "Focus Mode" showing only urgent + top-3 high-priority recommendations

### Business Risks

1. **Administrator Distrust of AI Recommendations**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Full transparency on reasoning, data, and confidence; show historical success rate; allow manual override without penalty; position as "decision support" not "decision maker"
   - Contingency: Offer "advisory" mode where recommendations are sent to implementation consultant first

2. **Liability for Acted-On Recommendations**
   - Impact: High
   - Likelihood: Low
   - Mitigation: Clear disclaimer on all recommendations ("Data-informed suggestion, not directive"); rationale tracking for audit; human approval required for all actions
   - Contingency: Legal review of recommendation language templates; insurance discussion

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
describe('RecommendationPrioritizer', () => {
  it('should rank patient safety impacts highest when scores are close', () => {});
  it('should calculate composite priority score correctly', () => {});
  it('should classify urgent correctly for score > 85', () => {});
  it('should deduplicate similar recommendations from different model runs', () => {});
});

describe('PrescriptiveAnalyzer', () => {
  it('should generate specific bed reallocation action from bed utilization prediction', () => {});
  it('should generate staffing adjustment from overtime trend prediction', () => {});
  it('should include numbered action steps in every recommendation', () => {});
  it('should calculate expected impacts with confidence intervals', () => {});
});

describe('OutcomeTracker', () => {
  it('should calculate accuracy score between predicted and actual impacts', () => {});
  it('should classify outcome as positive when majority of impacts improved', () => {});
  it('should handle partial data (not all metrics available at measurement time)', () => {});
});
```

### Integration Tests
```typescript
describe('Recommendation Pipeline', () => {
  it('should generate recommendations from predictive model output end-to-end', () => {});
  it('should accept recommendation and track outcome after measurement window', () => {});
  it('should defer recommendation and resurface at deferral expiry', () => {});
  it('should update learning model after outcome batch processing', () => {});
});
```

### E2E Tests (Playwright)
```typescript
test.describe('Recommendation Dashboard', () => {
  test('should display recommendations sorted by priority with correct badges', async ({ page }) => {});
  test('should accept recommendation with implementation notes', async ({ page }) => {});
  test('should defer recommendation with 7-day period', async ({ page }) => {});
  test('should dismiss recommendation with rationale', async ({ page }) => {});
  test('should navigate to impact visualization from recommendation', async ({ page }) => {});
  test('should display outcome summary with success rate', async ({ page }) => {});
});
```

## Performance Considerations

### Recommendation Generation
- BullMQ parallel processing: recommendations for different modules generated concurrently
- Claude API batching: group recommendations for same module in single API call where possible
- Redis caching of predictive model outputs to avoid re-fetching during recommendation generation
- Deduplication check in Redis before persisting to PostgreSQL

### Frontend Performance
- Server-side rendering for initial recommendation list (no client-side data fetch on first load)
- Optimistic updates for accept/defer/dismiss (update UI immediately, sync to server asynchronously)
- Lazy loading of recommendation detail panel (only fetch full data when expanded)
- Impact projection chart lazy imported (Recharts only loaded when detail panel opens)
- Notification polling debounced; switches to WebSocket if available

### Database Optimization
- PostgreSQL indexes on `recommendations(hospital_id, status, priority_score DESC)`
- PostgreSQL indexes on `recommendation_actions(recommendation_id, action_type)`
- Outcome evaluation queries use window functions for efficient metric comparison
- Learning loop processing batched monthly to reduce computation overhead

## Deployment Plan

### Development Phase
- Feature flag: `FEATURE_PRESCRIPTIVE_RECOMMENDATIONS` controls module visibility
- Mock recommendations seeded from static JSON fixtures for frontend development
- Claude API mock for deterministic recommendation narrative testing
- Seed 20 sample recommendations per demo hospital with varied priorities and modules

### Staging Phase
- End-to-end pipeline test: trigger predictive model -> generate recommendation -> accept -> track outcome
- Quality review: healthcare domain expert reviews 50 generated recommendations for actionability
- Load test: generate 100 recommendations per hospital concurrently
- Security audit: rationale data encryption, hospital scoping, audit trail integrity

### Production Phase
- Canary release to single pilot hospital with 10 recommendations
- Monitor recommendation quality (administrator feedback), action distribution, outcome accuracy
- Gradual rollout: 25% -> 50% -> 100% over 3 weeks (slower rollout due to trust-building requirement)
- Rollback trigger: administrator "not helpful" feedback > 50% or outcome accuracy < 50%
- Weekly recommendation quality review for first 8 weeks

## Monitoring & Analytics

### Performance Metrics
- Recommendation generation latency (model output -> recommendation available)
- Claude API token usage per recommendation generation
- Accept/defer/dismiss action response time
- Outcome evaluation job processing time

### Business Metrics
- Recommendations generated per module per week
- Administrator interaction rate (view, accept, defer, dismiss)
- Acceptance rate by module and priority level
- Outcome success rate (positive outcomes / total measured outcomes)
- Average financial impact of accepted recommendations
- Time to action (recommendation generated -> administrator takes action)
- Dismiss reason distribution (identifies systematic issues)

### Technical Metrics
- BullMQ recommendation generation job success/failure rate
- Claude API error rate for narrative generation
- Redis recommendation cache hit rate
- PostgreSQL query performance for recommendation list and outcome queries

### Alerting Rules
- Recommendation generation failure rate > 10% -> Critical alert
- No new recommendations generated in 48 hours for active hospital -> Warning alert
- Outcome success rate drops below 50% rolling 30 days -> Quality alert
- Dismiss rate exceeds 60% for any module -> Quality review trigger

## Documentation Requirements

### Technical Documentation
- Recommendation engine architecture diagram (predictive model output -> analysis -> prioritization -> narrative -> persist)
- Priority scoring methodology documentation (factor weights, thresholds, classification rules)
- Learning loop algorithm documentation (feedback signal processing, weight adjustment, convergence criteria)
- Claude API prompt templates for prescriptive recommendation generation
- Outcome tracking methodology (measurement windows, accuracy scoring, attribution approach)

### User Documentation
- Administrator Guide: understanding recommendations, taking actions, tracking outcomes
- Recommendation Priorities Guide: what urgent/high/medium/low means and recommended response times
- Outcome Review Guide: how to assess recommendation outcomes and provide feedback
- FAQ: "Can I undo an accepted recommendation?", "What happens if I dismiss all recommendations?", "How does the system improve over time?"

## Post-Launch Review

### Success Criteria
- >= 70% of accepted recommendations produce positive outcomes within 90 days
- >= 50% of administrators interact with recommendations weekly
- Acceptance rate >= 30% (recommendations acted upon, not just viewed)
- Recommendation generation within 15 seconds of model output
- Learning loop shows measurable improvement in acceptance rate quarter-over-quarter
- Zero liability incidents from acted-upon recommendations

### Retrospective Items
- Evaluate recommendation quality by module: identify which modules produce most/least actionable recommendations
- Review dismiss reasons to identify systemic gaps in recommendation logic
- Assess whether learning loop is converging toward better recommendations or needs manual recalibration
- Analyze time-to-action patterns to determine if urgency indicators are properly calibrated
- Gather administrator feedback on recommendation detail depth (too much/too little information)
- Evaluate Claude API cost per recommendation and explore caching/template strategies for common recommendation patterns
