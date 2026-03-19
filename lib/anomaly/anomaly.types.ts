// Severity levels
export type AnomalySeverity = 'critical' | 'warning' | 'informational';

// Status lifecycle
export type AnomalyStatus = 'active' | 'acknowledged' | 'investigating' | 'dismissed' | 'resolved';

// Hospital modules
export type HospitalModule = 'staffing' | 'bed-allocation' | 'supply-chain' | 'finance' | 'cross-module';

// Trigger operators
export type TriggerOperator = 'gt' | 'lt' | 'eq' | 'ne' | 'deviation' | 'threshold';

// Operational risk level
export type OperationalRisk = 'low' | 'medium' | 'high';

// Audit action types
export type AuditAction = 'created' | 'acknowledged' | 'investigation_started' | 'note_added' | 'dismissed' | 'resolved' | 'escalated';

// Sort options
export type AnomalySortField = 'detectedAt' | 'severity' | 'module';
export type SortOrder = 'asc' | 'desc';

// Trend period
export type TrendPeriod = '7d' | '30d' | '90d' | '1y';
export type TrendGranularity = 'hourly' | 'daily' | 'weekly';

// Investigation priority
export type InvestigationPriority = 'low' | 'medium' | 'high';

// Trigger
export interface AnomalyTrigger {
  field: string;
  operator: TriggerOperator;
  expectedValue: string | number;
  actualValue: string | number;
  dataSource: string;
  recordId: string;
}

// Context with AI analysis
export interface AnomalyContext {
  summary: string;
  rootCauseHypothesis: string;
  recommendedActions: string[];
  relatedAnomalyIds: string[];
  impactAssessment: {
    affectedPatients: number;
    financialImpact: number | null;
    operationalRisk: OperationalRisk;
  };
}

// Audit trail entry
export interface AnomalyAuditEntry {
  id: string;
  anomalyId: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  reason?: string;
}

// Main anomaly alert
export interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  module: HospitalModule;
  detectedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  triggeredBy: AnomalyTrigger[];
  affectedModules: HospitalModule[];
  context: AnomalyContext;
  assignedTo: string | null;
  auditTrail: AnomalyAuditEntry[];
}

// Filter state
export interface AnomalyFilterState {
  modules: HospitalModule[];
  severities: AnomalySeverity[];
  statuses: AnomalyStatus[];
  dateRange: { start: string; end: string };
  searchQuery: string;
  sortBy: AnomalySortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

// Stats
export interface AnomalyStats {
  critical: number;
  warning: number;
  informational: number;
  resolved: number;
  meanTimeToAcknowledge: number;
  meanTimeToResolve: number;
  anomaliesLast24h: number;
  anomaliesLast7d: number;
}

// Trend data
export interface AnomalyTrendDataPoint {
  date: string;
  critical: number;
  warning: number;
  informational: number;
  total: number;
}

// Investigation note
export interface InvestigationNote {
  id: string;
  anomalyId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Anomaly pattern
export interface AnomalyPattern {
  patternId: string;
  title: string;
  description: string;
  occurrenceCount: number;
  lastOccurrence: string;
  severity: AnomalySeverity;
  module: HospitalModule;
  avgFrequencyDays: number;
  relatedAnomalyIds: string[];
}

// Reducer action types
export type AnomalyAction =
  | { type: 'SET_ALERTS'; payload: AnomalyAlert[] }
  | { type: 'APPEND_ALERTS'; payload: AnomalyAlert[] }
  | { type: 'ADD_ALERT'; payload: AnomalyAlert }
  | { type: 'UPDATE_ALERT'; payload: Partial<AnomalyAlert> & { id: string } }
  | { type: 'SET_ACTIVE_ALERT'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<AnomalyFilterState> }
  | { type: 'SET_STATS'; payload: AnomalyStats }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REALTIME_CONNECTED'; payload: boolean }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'RESET_UNREAD' };

// Global state
export interface AnomalyGlobalState {
  alerts: AnomalyAlert[];
  activeAlertId: string | null;
  filters: AnomalyFilterState;
  stats: AnomalyStats;
  loading: boolean;
  realtimeConnected: boolean;
  unreadCount: number;
  hasMore: boolean;
}
