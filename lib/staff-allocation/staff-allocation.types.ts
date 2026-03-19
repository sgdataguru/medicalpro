export type StaffRole = 'RN' | 'CNA' | 'MD' | 'PA' | 'NP' | 'TECH' | 'ADMIN';
export type ShiftType = 'DAY' | 'EVENING' | 'NIGHT';
export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationType = 'ADD_STAFF' | 'REASSIGN' | 'REDUCE' | 'SHIFT_SWAP';
export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'APPLIED';
export type PredictionJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
export type GapSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface StaffAllocationFilters {
  departmentIds: string[];
  roles: StaffRole[];
  shifts: ShiftType[];
  dateRange: { start: string; end: string };
}

export interface RoleStaffing {
  role: StaffRole;
  assigned: number;
  required: number;
  available: number;
  overtimeHours: number;
  costPerHour: number;
}

export interface ShiftStaffing {
  shiftType: ShiftType;
  shiftStart: string;
  shiftEnd: string;
  staffByRole: RoleStaffing[];
  totalAssigned: number;
  totalRequired: number;
  patientCount: number;
  nurseToPatientRatio: number;
  regulatoryRatioLimit: number;
  isCompliant: boolean;
}

export interface DepartmentStaffingSummary {
  departmentId: string;
  departmentName: string;
  shifts: ShiftStaffing[];
  totalOnDuty: number;
  totalRequired: number;
  coveragePercentage: number;
}

export interface ShiftPrediction {
  shiftType: ShiftType;
  predictedDemand: number;
  currentAssigned: number;
  gap: number;
  confidence: number;
}

export interface DepartmentPrediction {
  departmentId: string;
  departmentName: string;
  predictedPatientVolume: number;
  shifts: ShiftPrediction[];
}

export interface StaffingPrediction {
  predictionId: string;
  generatedAt: string;
  horizonHours: number;
  confidence: number;
  modelVersion: string;
  departmentPredictions: DepartmentPrediction[];
}

export interface StaffingRecommendation {
  recommendationId: string;
  priority: RecommendationPriority;
  type: RecommendationType;
  departmentId: string;
  departmentName: string;
  shiftType: ShiftType;
  role: StaffRole;
  description: string;
  currentValue: number;
  recommendedValue: number;
  delta: number;
  projectedOvertimeSavings: number;
  projectedCoverageImprovement: number;
  ratioImpact: { before: number; after: number };
  constraints: string[];
  status: RecommendationStatus;
  rejectionReason?: string;
}

export interface OvertimeCostProjection {
  departmentId: string;
  departmentName: string;
  currentOvertimeCost: number;
  projectedOvertimeCost: number;
  savings: number;
  savingsPercentage: number;
  period: string;
}

export interface CoverageGap {
  gapId: string;
  departmentId: string;
  departmentName: string;
  shiftType: ShiftType;
  date: string;
  severity: GapSeverity;
  staffShortfall: number;
  role: StaffRole;
  hoursUntilShift: number;
}

export interface StaffingTotals {
  totalOnDuty: number;
  totalRequired: number;
  overallCoverage: number;
  departmentCount: number;
}

export interface StaffAllocationState {
  filters: StaffAllocationFilters;
  currentStaffing: DepartmentStaffingSummary[];
  predictions: StaffingPrediction | null;
  recommendations: StaffingRecommendation[];
  predictionJobStatus: PredictionJobStatus;
  compareMode: boolean;
  totals: StaffingTotals;
  overtimeProjections: OvertimeCostProjection[];
  coverageGaps: CoverageGap[];
  loading: boolean;
  error: string | null;
}

// --- Reducer Actions ---

export type StaffAllocationReducerAction =
  | { type: 'SET_DEPARTMENTS'; payload: DepartmentStaffingSummary[] }
  | { type: 'SET_TOTALS'; payload: StaffingTotals }
  | { type: 'SET_PREDICTION'; payload: StaffingPrediction | null }
  | { type: 'SET_RECOMMENDATIONS'; payload: StaffingRecommendation[] }
  | { type: 'UPDATE_RECOMMENDATION'; payload: StaffingRecommendation }
  | { type: 'SET_OVERTIME_PROJECTIONS'; payload: OvertimeCostProjection[] }
  | { type: 'SET_COVERAGE_GAPS'; payload: CoverageGap[] }
  | { type: 'SET_FILTERS'; payload: Partial<StaffAllocationFilters> }
  | { type: 'SET_PREDICTION_STATUS'; payload: PredictionJobStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COMPARE_MODE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
