import type {
  DepartmentOccupancy, BedDemandForecast, ReallocationRecommendation,
  CapacityAlert, OccupancyTrendSeries, BedAllocationFilters,
} from './bed-allocation.types';
import { calculateOccupancyTotals } from './bed-allocation.utils';

// Simulated delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MOCK_DEPARTMENTS: DepartmentOccupancy[] = [
  {
    departmentId: 'dept-icu', departmentName: 'ICU',
    wards: [{ wardId: 'w-icu-a', wardName: 'ICU Ward A', wardType: 'ICU', totalBeds: 24, occupiedBeds: 22, availableBeds: 2, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.917, averagePatientAcuity: 4.2 }],
    totalBeds: 24, occupiedBeds: 22, availableBeds: 2, occupancyRate: 0.917,
    trend: 'RISING', trendPercentage: 3.2, monthlyRevenue: 1_200_000, revenuePerBedDay: 1818, averageLengthOfStay: 5.2,
  },
  {
    departmentId: 'dept-er', departmentName: 'Emergency',
    wards: [{ wardId: 'w-er-main', wardName: 'ER Main', wardType: 'EMERGENCY', totalBeds: 40, occupiedBeds: 38, availableBeds: 2, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.95, averagePatientAcuity: 3.8 }],
    totalBeds: 40, occupiedBeds: 38, availableBeds: 2, occupancyRate: 0.95,
    trend: 'RISING', trendPercentage: 5.1, monthlyRevenue: 890_000, revenuePerBedDay: 781, averageLengthOfStay: 1.8,
  },
  {
    departmentId: 'dept-surg', departmentName: 'Surgery',
    wards: [{ wardId: 'w-surg-b', wardName: 'Surgical Ward B', wardType: 'SURGICAL', totalBeds: 32, occupiedBeds: 21, availableBeds: 11, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.656, averagePatientAcuity: 3.1 }],
    totalBeds: 32, occupiedBeds: 21, availableBeds: 11, occupancyRate: 0.656,
    trend: 'STABLE', trendPercentage: 0.3, monthlyRevenue: 650_000, revenuePerBedDay: 1032, averageLengthOfStay: 3.4,
  },
  {
    departmentId: 'dept-onco', departmentName: 'Oncology',
    wards: [{ wardId: 'w-onco-c', wardName: 'Oncology Ward C', wardType: 'MEDICAL', totalBeds: 28, occupiedBeds: 18, availableBeds: 10, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.643, averagePatientAcuity: 3.5 }],
    totalBeds: 28, occupiedBeds: 18, availableBeds: 10, occupancyRate: 0.643,
    trend: 'DECLINING', trendPercentage: -1.5, monthlyRevenue: 420_000, revenuePerBedDay: 778, averageLengthOfStay: 6.1,
  },
  {
    departmentId: 'dept-peds', departmentName: 'Pediatrics',
    wards: [{ wardId: 'w-peds-d', wardName: 'Pediatrics Ward D', wardType: 'PEDIATRIC', totalBeds: 20, occupiedBeds: 14, availableBeds: 6, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.7, averagePatientAcuity: 2.6 }],
    totalBeds: 20, occupiedBeds: 14, availableBeds: 6, occupancyRate: 0.7,
    trend: 'STABLE', trendPercentage: -0.2, monthlyRevenue: 310_000, revenuePerBedDay: 738, averageLengthOfStay: 2.9,
  },
  {
    departmentId: 'dept-card', departmentName: 'Cardiology',
    wards: [{ wardId: 'w-card-e', wardName: 'Cardiac Ward E', wardType: 'MEDICAL', totalBeds: 30, occupiedBeds: 26, availableBeds: 4, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.867, averagePatientAcuity: 3.9 }],
    totalBeds: 30, occupiedBeds: 26, availableBeds: 4, occupancyRate: 0.867,
    trend: 'RISING', trendPercentage: 2.4, monthlyRevenue: 980_000, revenuePerBedDay: 1256, averageLengthOfStay: 4.1,
  },
  {
    departmentId: 'dept-ortho', departmentName: 'Orthopedics',
    wards: [{ wardId: 'w-ortho-f', wardName: 'Ortho Ward F', wardType: 'SURGICAL', totalBeds: 26, occupiedBeds: 19, availableBeds: 7, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.731, averagePatientAcuity: 2.8 }],
    totalBeds: 26, occupiedBeds: 19, availableBeds: 7, occupancyRate: 0.731,
    trend: 'STABLE', trendPercentage: 0.8, monthlyRevenue: 520_000, revenuePerBedDay: 912, averageLengthOfStay: 3.7,
  },
  {
    departmentId: 'dept-maternity', departmentName: 'Maternity',
    wards: [{ wardId: 'w-mat-g', wardName: 'Maternity Wing G', wardType: 'MATERNITY', totalBeds: 22, occupiedBeds: 17, availableBeds: 5, reservedBeds: 0, maintenanceBeds: 0, occupancyRate: 0.773, averagePatientAcuity: 2.0 }],
    totalBeds: 22, occupiedBeds: 17, availableBeds: 5, occupancyRate: 0.773,
    trend: 'STABLE', trendPercentage: 0.1, monthlyRevenue: 380_000, revenuePerBedDay: 745, averageLengthOfStay: 2.5,
  },
];

const MOCK_RECOMMENDATIONS: ReallocationRecommendation[] = [
  {
    recommendationId: 'rec-001', priority: 'CRITICAL', type: 'TRANSFER_BEDS',
    sourceDepartmentId: 'dept-onco', sourceDepartmentName: 'Oncology',
    sourceWardId: 'w-onco-c', sourceWardName: 'Oncology Ward C',
    targetDepartmentId: 'dept-icu', targetDepartmentName: 'ICU',
    targetWardId: 'w-icu-a', targetWardName: 'ICU Ward A',
    bedCount: 4, description: 'Transfer 4 beds from Oncology Ward C to ICU Ward A',
    rationale: 'ICU occupancy at 91.7% with rising trend. Oncology utilization declining at 64.3%. ICU revenue per bed-day is 2.3x higher than Oncology.',
    revenueImpact: { monthly: 85_000, annual: 1_020_000, revenuePerBedDayDelta: 1040 },
    waitTimeImpact: { currentAvgMinutes: 142, projectedAvgMinutes: 98, reductionPercentage: 31 },
    throughputImpact: { currentDailyDischarges: 4.6, projectedDailyDischarges: 5.8, improvementPercentage: 26 },
    constraints: ['Requires ICU-certified nursing staff for new beds', 'Equipment transfer needed within 72 hours'],
    status: 'PENDING',
  },
  {
    recommendationId: 'rec-002', priority: 'HIGH', type: 'ADD_OVERFLOW',
    sourceDepartmentId: 'dept-surg', sourceDepartmentName: 'Surgery',
    sourceWardId: 'w-surg-b', sourceWardName: 'Surgical Ward B',
    targetDepartmentId: 'dept-er', targetDepartmentName: 'Emergency',
    targetWardId: 'w-er-main', targetWardName: 'ER Main',
    bedCount: 2, description: 'Add 2 overflow beds to ER from Surgical Ward B during peak hours (10am-10pm)',
    rationale: 'ER at 95% occupancy with continued rising trend. Surgery has 34% availability. Peak ER demand occurs during daytime hours.',
    revenueImpact: { monthly: 42_000, annual: 504_000, revenuePerBedDayDelta: 700 },
    waitTimeImpact: { currentAvgMinutes: 87, projectedAvgMinutes: 62, reductionPercentage: 29 },
    throughputImpact: { currentDailyDischarges: 28, projectedDailyDischarges: 32, improvementPercentage: 14 },
    constraints: ['Only during peak hours 10am-10pm', 'Requires ER-trained staff assignment'],
    status: 'PENDING',
  },
  {
    recommendationId: 'rec-003', priority: 'MEDIUM', type: 'TRANSFER_BEDS',
    sourceDepartmentId: 'dept-peds', sourceDepartmentName: 'Pediatrics',
    sourceWardId: 'w-peds-d', sourceWardName: 'Pediatrics Ward D',
    targetDepartmentId: 'dept-card', targetDepartmentName: 'Cardiology',
    targetWardId: 'w-card-e', targetWardName: 'Cardiac Ward E',
    bedCount: 3, description: 'Transfer 3 beds from Pediatrics to Cardiology',
    rationale: 'Cardiology at 86.7% and rising. Pediatrics stable at 70% with seasonal low expected. Cardiology revenue per bed is 70% higher.',
    revenueImpact: { monthly: 38_000, annual: 456_000, revenuePerBedDayDelta: 518 },
    waitTimeImpact: { currentAvgMinutes: 65, projectedAvgMinutes: 48, reductionPercentage: 26 },
    throughputImpact: { currentDailyDischarges: 6.3, projectedDailyDischarges: 7.1, improvementPercentage: 13 },
    constraints: ['Monitor pediatric seasonal demand before implementing'],
    status: 'PENDING',
  },
];

const MOCK_ALERTS: CapacityAlert[] = [
  {
    alertId: 'alert-001', departmentId: 'dept-er', departmentName: 'Emergency',
    severity: 'CRITICAL', type: 'OVER_CAPACITY',
    message: 'Emergency department projected to exceed 100% capacity within 6 hours',
    projectedDate: new Date(Date.now() + 6 * 3600_000).toISOString(),
    hoursUntilEvent: 6, currentOccupancyRate: 0.95, projectedOccupancyRate: 1.02,
    recommendedAction: 'Activate overflow beds from Surgery or divert non-critical patients',
    acknowledged: false,
  },
  {
    alertId: 'alert-002', departmentId: 'dept-icu', departmentName: 'ICU',
    severity: 'WARNING', type: 'NEAR_CAPACITY',
    message: 'ICU approaching 95% capacity threshold within 18 hours',
    projectedDate: new Date(Date.now() + 18 * 3600_000).toISOString(),
    hoursUntilEvent: 18, currentOccupancyRate: 0.917, projectedOccupancyRate: 0.958,
    recommendedAction: 'Review discharge readiness for current ICU patients; prepare step-down transfers',
    acknowledged: false,
  },
  {
    alertId: 'alert-003', departmentId: 'dept-onco', departmentName: 'Oncology',
    severity: 'INFO', type: 'BELOW_THRESHOLD',
    message: 'Oncology occupancy below 65% target threshold — beds available for reallocation',
    projectedDate: new Date(Date.now() + 48 * 3600_000).toISOString(),
    hoursUntilEvent: 48, currentOccupancyRate: 0.643, projectedOccupancyRate: 0.59,
    recommendedAction: 'Consider temporary reallocation of 4-6 beds to high-demand departments',
    acknowledged: false,
  },
];

function generateTrendData(departmentId: string, departmentName: string, baseRate: number, days: number): OccupancyTrendSeries {
  const dataPoints: { timestamp: string; occupancyRate: number; occupiedBeds: number; totalBeds: number }[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = (Math.sin(i * 0.5) * 0.05) + (Math.random() - 0.5) * 0.03;
    const rate = Math.max(0.3, Math.min(1.0, baseRate + variation));
    const totalBeds = 30;
    dataPoints.push({
      timestamp: date.toISOString().split('T')[0],
      occupancyRate: Math.round(rate * 1000) / 1000,
      occupiedBeds: Math.round(totalBeds * rate),
      totalBeds,
    });
  }
  return { departmentId, departmentName, dataPoints };
}

export async function fetchOccupancyData(_filters?: BedAllocationFilters) {
  await delay(300);
  const departments = MOCK_DEPARTMENTS;
  return { departments, totals: calculateOccupancyTotals(departments), asOf: new Date().toISOString() };
}

export async function fetchOccupancyTrends(filters?: BedAllocationFilters) {
  await delay(400);
  const days = filters?.timePeriod === '30d' ? 30 : filters?.timePeriod === '14d' ? 14 : 7;
  const trends: OccupancyTrendSeries[] = MOCK_DEPARTMENTS.map(d =>
    generateTrendData(d.departmentId, d.departmentName, d.occupancyRate, days)
  );
  return { trends };
}

export async function runForecast(_departmentIds: string[], horizonDays: number) {
  await delay(2000);
  const now = new Date();
  const departmentForecasts: { departmentId: string; departmentName: string; dailyForecasts: import('./bed-allocation.types').DailyBedForecast[] }[] =
    MOCK_DEPARTMENTS.slice(0, 4).map(d => ({
      departmentId: d.departmentId, departmentName: d.departmentName,
      dailyForecasts: Array.from({ length: horizonDays }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() + i + 1);
        const baseRate = d.occupancyRate + (d.trend === 'RISING' ? 0.01 * i : d.trend === 'DECLINING' ? -0.008 * i : 0);
        const rate = Math.max(0.3, Math.min(1.05, baseRate + (Math.random() - 0.5) * 0.04));
        return {
          date: date.toISOString().split('T')[0],
          predictedAdmissions: Math.round(d.totalBeds * 0.15 + Math.random() * 3),
          predictedDischarges: Math.round(d.totalBeds * 0.13 + Math.random() * 3),
          predictedOccupancy: Math.round(d.totalBeds * rate),
          predictedOccupancyRate: Math.round(rate * 1000) / 1000,
          confidenceInterval: { lower: Math.max(0, rate - 0.08), upper: Math.min(1.0, rate + 0.08) },
          isOverCapacity: rate > 0.95, isBelowThreshold: rate < 0.6, scheduledProcedures: Math.round(Math.random() * 5),
        };
      }),
    }));
  const allRates = departmentForecasts.flatMap(df => df.dailyForecasts.map(f => ({ date: f.date, rate: f.predictedOccupancyRate })));
  const peak = allRates.reduce((a, b) => (b.rate > a.rate ? b : a), allRates[0]);
  const trough = allRates.reduce((a, b) => (b.rate < a.rate ? b : a), allRates[0]);
  const forecast: BedDemandForecast = {
    forecastId: `fc-${Date.now()}`, generatedAt: now.toISOString(), horizonDays, confidence: 0.84,
    modelVersion: '1.2.0', departmentForecasts,
    peakOccupancyDate: peak.date, peakOccupancyRate: peak.rate,
    troughOccupancyDate: trough.date, troughOccupancyRate: trough.rate,
  };
  return forecast;
}

export async function fetchRecommendations() {
  await delay(300);
  return { recommendations: MOCK_RECOMMENDATIONS };
}

export async function updateRecommendation(id: string, status: 'APPROVED' | 'REJECTED', note?: string) {
  await delay(500);
  const rec = MOCK_RECOMMENDATIONS.find(r => r.recommendationId === id);
  if (!rec) throw new Error('Recommendation not found');
  return { ...rec, status, ...(status === 'APPROVED' ? { approvalNote: note } : { rejectionReason: note }) };
}

export async function fetchCapacityAlerts() {
  await delay(200);
  return { alerts: MOCK_ALERTS };
}

export async function acknowledgeAlert(id: string) {
  await delay(300);
  const alert = MOCK_ALERTS.find(a => a.alertId === id);
  if (!alert) throw new Error('Alert not found');
  return { ...alert, acknowledged: true };
}
