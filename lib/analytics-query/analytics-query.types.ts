// Hospital modules
export type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

// Query intent categories
export type QueryIntent =
  | 'explain_trend'
  | 'current_status'
  | 'compare'
  | 'forecast'
  | 'recommend'
  | 'drill_down'
  | 'anomaly_inquiry'
  | 'cross_module_impact';

// Query input method
export type InputMethod = 'text' | 'voice';

// Confidence levels
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Feedback rating
export type FeedbackRating = 'helpful' | 'not_helpful';

// Visualization types
export type VisualizationType = 'line_chart' | 'bar_chart' | 'pie_chart' | 'data_table' | 'trend_line' | 'gauge';

// Guardrail flag severity
export type GuardrailSeverity = 'info' | 'warning' | 'critical';

// Guardrail flag types
export type GuardrailType =
  | 'clinical_advice_blocked'
  | 'low_data_quality'
  | 'incomplete_data'
  | 'hallucination_risk'
  | 'scope_limitation';

// Entity types extracted from queries
export type EntityType = 'department' | 'ward' | 'staff_role' | 'metric' | 'time_period' | 'procedure' | 'cost_center';

// Time granularity
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

// Natural language query
export interface NLQuery {
  id: string;
  hospitalId: string;
  userId: string;
  questionText: string;
  inputMethod: InputMethod;
  conversationId: string | null;
  parentQueryId: string | null;
  submittedAt: string;
}

// Extracted entity from query
export interface ExtractedEntity {
  type: EntityType;
  value: string;
  normalizedValue: string;
  confidence: number;
}

// Query timeframe
export interface QueryTimeframe {
  type: 'absolute' | 'relative' | 'comparison';
  start: string;
  end: string;
  comparisonPeriod: { start: string; end: string } | null;
  granularity: TimeGranularity;
}

// Confidence score
export interface ConfidenceScore {
  overall: number;
  dataCompleteness: number;
  queryInterpretation: number;
  answerGrounding: number;
  level: ConfidenceLevel;
  explanation: string;
}

// Data source citation
export interface DataSourceCitation {
  module: HospitalModule;
  tableName: string;
  timeframeUsed: string;
  recordCount: number;
  dataQualityScore: number;
  description: string;
}

// Guardrail flag
export interface GuardrailFlag {
  type: GuardrailType;
  message: string;
  severity: GuardrailSeverity;
}

// Chart data point
export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  timestamp?: string;
}

// Table data
export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  highlightRows?: number[];
}

// Chart config
export interface ChartConfig {
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisType: 'category' | 'time';
  currency: boolean;
  percentage: boolean;
  showTrendLine: boolean;
  showDataLabels: boolean;
  colors: string[];
}

// Visualization spec
export interface VisualizationSpec {
  id: string;
  type: VisualizationType;
  title: string;
  data: ChartDataPoint[] | TableData;
  config: ChartConfig;
}

// Complete query response
export interface NLQueryResponse {
  id: string;
  queryId: string;
  answerText: string;
  confidence: ConfidenceScore;
  visualizations: VisualizationSpec[];
  dataSources: DataSourceCitation[];
  followUpSuggestions: string[];
  processingTimeMs: number;
  guardrailFlags: GuardrailFlag[];
}

// Query feedback
export interface QueryFeedback {
  rating: FeedbackRating;
  comment: string | null;
  submittedAt: string;
}

// Conversation turn
export interface ConversationTurn {
  queryId: string;
  questionText: string;
  response: NLQueryResponse;
  feedback: QueryFeedback | null;
  timestamp: string;
}

// Conversation
export interface Conversation {
  id: string;
  hospitalId: string;
  userId: string;
  title: string;
  turns: ConversationTurn[];
  createdAt: string;
  lastActivityAt: string;
  isSaved: boolean;
}

// Saved query
export interface SavedQuery {
  id: string;
  hospitalId: string;
  userId: string;
  questionText: string;
  label: string;
  tags: string[];
  lastRunAt: string;
  runCount: number;
}

// SSE streaming event types
export type StreamEventType =
  | 'text_delta'
  | 'visualization'
  | 'source_citation'
  | 'confidence'
  | 'follow_up'
  | 'guardrail'
  | 'done';

export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  spec?: VisualizationSpec;
  citation?: DataSourceCitation;
  score?: ConfidenceScore;
  suggestions?: string[];
  flag?: GuardrailFlag;
  response?: NLQueryResponse;
}

// Page state
export interface NLQueryPageState {
  currentInput: string;
  isSubmitting: boolean;
  isStreaming: boolean;
  streamedText: string;
  error: string | null;
  currentResponse: NLQueryResponse | null;
  activeConversation: Conversation | null;
  turns: ConversationTurn[];
  suggestions: string[];
  suggestionsLoading: boolean;
}

// Reducer action types
export type NLQueryReducerAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'APPEND_STREAM_TEXT'; payload: string }
  | { type: 'SET_STREAM_TEXT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESPONSE'; payload: NLQueryResponse | null }
  | { type: 'SET_CONVERSATION'; payload: Conversation | null }
  | { type: 'ADD_TURN'; payload: ConversationTurn }
  | { type: 'SET_TURNS'; payload: ConversationTurn[] }
  | { type: 'SET_SUGGESTIONS'; payload: string[] }
  | { type: 'SET_SUGGESTIONS_LOADING'; payload: boolean }
  | { type: 'RESET_QUERY' };
