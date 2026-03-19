export type WardType = 'ICU' | 'EMERGENCY' | 'SURGICAL' | 'MEDICAL' | 'PEDIATRIC' | 'MATERNITY' | 'PSYCHIATRIC' | 'STEPDOWN' | 'REHAB';
export type BedStatus = 'OCCUPIED' | 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE' | 'BLOCKED';
export type OccupancyTrend = 'RISING' | 'STABLE' | 'DECLINING';
export type ReallocationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ReallocationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
export type RecommendationType = 'TRANSFER_BEDS' | 'ADD_OVERFLOW' | 'CONVERT_WARD' | 'TEMPORARY_EXPANSION';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertType = 'OVER_CAPACITY' | 'NEAR_CAPACITY' | 'BELOW_THRESHOLD' | 'SURGE_PREDICTED';
export type ForecastJobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
export type TimePeriod = '7d' | '14d' | '30d';

export interface BedAllocationFilters {
  departmentIds: string[];
  wardIds: string[];
  timePeriod: TimePeriod;
}

export interface WardOccupancy {
  wardId: string;
  wardName: string;
  wardType: WardType;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  averagePatientAcuity: number;
}

export interface DepartmentOccupancy {
  departmentId: string;
  departmentName: string;
  wards: WardOccupancy[];
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  trend: OccupancyTrend;
  trendPercentage: number;
  monthlyRevenue: number;
  revenuePerBedDay: number;
  averageLengthOfStay: number;
}

export interface DailyBedForecast {
  date: string;
  predictedAdmissions: number;
  predictedDischarges: number;
  predictedOccupancy: number;
  predictedOccupancyRate: number;
  confidenceInterval: { lower: number; upper: number };
  isOverCapacity: boolean;
  isBelowThreshold: boolean;
  scheduledProcedures: number;
}

export interface DepartmentForecast {
  departmentId: string;
  departmentName: string;
  dailyForecasts: DailyBedForecast[];
}

export interface BedDemandForecast {
  forecastId: string;
  generatedAt: string;
  horizonDays: number;
  confidence: number;
  modelVersion: string;
  departmentForecasts: DepartmentForecast[];
  peakOccupancyDate: string;
  peakOccupancyRate: number;
  troughOccupancyDate: string;
  troughOccupancyRate: number;
}

export interface ReallocationRecommendation {
  recommendationId: string;
  priority: ReallocationPriority;
  type: RecommendationType;
  sourceDepartmentId: string;
  sourceDepartmentName: string;
  sourceWardId: string;
  sourceWardName: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  targetWardId: string;
  targetWardName: string;
  bedCount: number;
  description: string;
  rationale: string;
  revenueImpact: { monthly: number; annual: number; revenuePerBedDayDelta: number };
  waitTimeImpact: { currentAvgMinutes: number; projectedAvgMinutes: number; reductionPercentage: number };
  throughputImpact: { currentDailyDischarges: number; projectedDailyDischarges: number; improvementPercentage: number };
  constraints: string[];
  status: ReallocationStatus;
  approvalNote?: string;
  rejectionReason?: string;
}

export interface CapacityAlert {
  alertId: string;
  departmentId: string;
  departmentName: string;
  wardId?: string;
  wardName?: string;
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  projectedDate: string;
  hoursUntilEvent: number;
  currentOccupancyRate: number;
  projectedOccupancyRate: number;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface OccupancyTrendDataPoint {
  timestamp: string;
  occupancyRate: number;
  occupiedBeds: number;
  totalBeds: number;
}

export interface OccupancyTrendSeries {
  departmentId: string;
  departmentName: string;
  dataPoints: OccupancyTrendDataPoint[];
}

export interface BedAllocationState {
  filters: BedAllocationFilters;
  occupancy: DepartmentOccupancy[];
  forecast: BedDemandForecast | null;
  recommendations: ReallocationRecommendation[];
  capacityAlerts: CapacityAlert[];
  forecastJobStatus: ForecastJobStatus;
  totals: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    overallOccupancyRate: number;
  };
}
