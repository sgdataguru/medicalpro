// Hospital modules that generate recommendations
export type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

// Recommendation lifecycle statuses
export type RecommendationStatus = 'active' | 'accepted' | 'deferred' | 'dismissed' | 'expired';

// Priority levels
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

// Urgency levels
export type UrgencyLevel = 'immediate' | 'this_week' | 'this_month' | 'next_quarter';

// Dismiss reasons
export type DismissReason =
  | 'not_applicable'
  | 'already_implemented'
  | 'disagree_with_analysis'
  | 'insufficient_resources'
  | 'organizational_constraint'
  | 'other';

// Sort options
export type RecommendationSortField = 'priority' | 'date' | 'module' | 'confidence';
export type SortOrder = 'asc' | 'desc';

// Outcome result
export type OutcomeResult = 'positive' | 'neutral' | 'negative';

// Impact direction
export type ImpactDirection = 'positive' | 'negative' | 'neutral';

// Priority factor
export interface PriorityFactor {
  name: string;
  weight: number;
  value: number;
}

// Recommendation priority
export interface RecommendationPriority {
  level: PriorityLevel;
  score: number;
  factors: PriorityFactor[];
}

// Urgency info
export interface RecommendationUrgency {
  level: UrgencyLevel;
  reason: string;
  deadlineDate: string | null;
}

// Action step
export interface ActionStep {
  stepNumber: number;
  description: string;
  responsible: string;
  estimatedDuration: string;
  dependencies: string[];
}

// Expected impact
export interface ExpectedImpact {
  metricName: string;
  displayName: string;
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  unit: string;
  timeToImpact: string;
  confidence: number;
  direction: ImpactDirection;
}

// Data basis
export interface DataBasis {
  timeframeDays: number;
  recordCount: number;
  modules: HospitalModule[];
  dataQualityScore: number;
  modelAccuracy: number;
  lastDataUpdateAt: string;
}

// Action taken on a recommendation
export interface RecommendationAction {
  id: string;
  recommendationId: string;
  actionType: 'accept' | 'defer' | 'dismiss';
  implementationNotes: string | null;
  targetImplementationDate: string | null;
  deferUntilDate: string | null;
  deferReason: string | null;
  dismissReason: DismissReason | null;
  dismissComment: string | null;
  actionBy: string;
  actionAt: string;
  outcome: RecommendationOutcome | null;
}

// Actual impact measurement
export interface ActualImpact {
  metricName: string;
  displayName: string;
  baselineValue: number;
  actualValue: number;
  delta: number;
  deltaPercentage: number;
  unit: string;
}

// Tracked outcome
export interface RecommendationOutcome {
  id: string;
  recommendationId: string;
  actionId: string;
  predictedImpacts: ExpectedImpact[];
  actualImpacts: ActualImpact[];
  overallResult: OutcomeResult;
  accuracyScore: number;
  implementedAt: string;
  measuredAt: string;
  measurementWindowDays: number;
  administratorFeedback: string | null;
  lessonsLearned: string | null;
}

// Main recommendation
export interface Recommendation {
  id: string;
  hospitalId: string;
  module: HospitalModule;
  status: RecommendationStatus;
  priority: RecommendationPriority;
  urgency: RecommendationUrgency;
  title: string;
  actionSummary: string;
  detailedReasoning: string;
  specificActions: ActionStep[];
  expectedImpacts: ExpectedImpact[];
  confidenceScore: number;
  dataBasis: DataBasis;
  predictiveModelId: string;
  relatedRecommendationIds: string[];
  generatedAt: string;
  expiresAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  action: RecommendationAction | null;
}

// Filter state
export interface RecommendationFilterState {
  priority: PriorityLevel[];
  modules: HospitalModule[];
  status: RecommendationStatus[];
  dateRange: { from: string; to: string } | null;
  sortBy: RecommendationSortField;
  sortOrder: SortOrder;
}

// Page state
export interface RecommendationPageState {
  recommendations: Recommendation[];
  totalCount: number;
  newCount: number;
  isLoading: boolean;
  error: string | null;
  filters: RecommendationFilterState;
  selectedRecommendation: Recommendation | null;
  isDetailOpen: boolean;
  relatedRecommendations: Recommendation[];
  simulationPreview: SimulationPreviewData | null;
  isProcessing: boolean;
  pendingAction: {
    recommendationId: string;
    actionType: 'accept' | 'defer' | 'dismiss';
  } | null;
}

// Outcome summary
export interface OutcomeSummary {
  totalAccepted: number;
  positiveOutcomes: number;
  neutralOutcomes: number;
  negativeOutcomes: number;
  successRate: number;
  averageImpactDollars: number;
  averageAccuracyScore: number;
}

// Outcome trend
export interface OutcomeTrend {
  month: string;
  acceptedCount: number;
  successRate: number;
  averageImpact: number;
}

// Simulation preview
export interface SimulationPreviewData {
  simulationId: string;
  summary: string;
  keyMetrics: { name: string; value: number; unit: string }[];
}

// Reducer action types
export type RecommendationReducerAction =
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'UPDATE_RECOMMENDATION'; payload: Partial<Recommendation> & { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<RecommendationFilterState> }
  | { type: 'SET_SELECTED'; payload: Recommendation | null }
  | { type: 'SET_DETAIL_OPEN'; payload: boolean }
  | { type: 'SET_RELATED'; payload: Recommendation[] }
  | { type: 'SET_SIMULATION_PREVIEW'; payload: SimulationPreviewData | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PENDING_ACTION'; payload: RecommendationPageState['pendingAction'] }
  | { type: 'SET_COUNTS'; payload: { totalCount: number; newCount: number } };
