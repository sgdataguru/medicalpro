import { addDays, format } from 'date-fns';
import type {
  DepartmentStaffingSummary,
  StaffingPrediction,
  StaffingRecommendation,
  OvertimeCostProjection,
  CoverageGap,
  StaffingTotals,
  ShiftStaffing,
  RoleStaffing,
} from './staff-allocation.types';

// --- Mock Department Data ---

const DEPARTMENTS = [
  { id: 'DEPT-001', name: 'Emergency', ratio: 4 },
  { id: 'DEPT-002', name: 'ICU', ratio: 2 },
  { id: 'DEPT-003', name: 'Surgery', ratio: 3 },
  { id: 'DEPT-004', name: 'Oncology', ratio: 5 },
  { id: 'DEPT-005', name: 'Pediatrics', ratio: 4 },
  { id: 'DEPT-006', name: 'Cardiology', ratio: 4 },
  { id: 'DEPT-007', name: 'Orthopedics', ratio: 5 },
  { id: 'DEPT-008', name: 'Neurology', ratio: 4 },
  { id: 'DEPT-009', name: 'General Ward', ratio: 6 },
  { id: 'DEPT-010', name: 'Maternity', ratio: 4 },
  { id: 'DEPT-011', name: 'Radiology', ratio: 6 },
  { id: 'DEPT-012', name: 'Rehabilitation', ratio: 6 },
];

function buildShift(
  type: 'DAY' | 'EVENING' | 'NIGHT',
  assigned: number,
  required: number,
  patients: number,
  ratioLimit: number,
): ShiftStaffing {
  const starts = { DAY: '07:00', EVENING: '15:00', NIGHT: '23:00' };
  const ends = { DAY: '15:00', EVENING: '23:00', NIGHT: '07:00' };
  const rnAssigned = Math.round(assigned * 0.5);
  const rnRequired = Math.round(required * 0.5);
  const cnaAssigned = Math.round(assigned * 0.25);
  const cnaRequired = Math.round(required * 0.25);
  const otherAssigned = assigned - rnAssigned - cnaAssigned;
  const otherRequired = required - rnRequired - cnaRequired;

  const staffByRole: RoleStaffing[] = [
    { role: 'RN', assigned: rnAssigned, required: rnRequired, available: rnRequired + 2, overtimeHours: rnAssigned > rnRequired ? (rnAssigned - rnRequired) * 4 : 0, costPerHour: 52 },
    { role: 'CNA', assigned: cnaAssigned, required: cnaRequired, available: cnaRequired + 1, overtimeHours: 0, costPerHour: 28 },
    { role: 'TECH', assigned: otherAssigned, required: otherRequired, available: otherRequired + 1, overtimeHours: 0, costPerHour: 35 },
  ];

  const ratio = patients > 0 ? patients / rnAssigned : 0;
  return {
    shiftType: type,
    shiftStart: starts[type],
    shiftEnd: ends[type],
    staffByRole,
    totalAssigned: assigned,
    totalRequired: required,
    patientCount: patients,
    nurseToPatientRatio: ratio,
    regulatoryRatioLimit: ratioLimit,
    isCompliant: ratio <= ratioLimit,
  };
}

const MOCK_DEPARTMENTS: DepartmentStaffingSummary[] = [
  {
    departmentId: 'DEPT-001', departmentName: 'Emergency',
    shifts: [buildShift('DAY', 42, 45, 78, 4), buildShift('EVENING', 38, 42, 72, 4), buildShift('NIGHT', 28, 32, 48, 4)],
    totalOnDuty: 108, totalRequired: 119, coveragePercentage: 90.8,
  },
  {
    departmentId: 'DEPT-002', departmentName: 'ICU',
    shifts: [buildShift('DAY', 24, 24, 22, 2), buildShift('EVENING', 22, 24, 20, 2), buildShift('NIGHT', 20, 22, 18, 2)],
    totalOnDuty: 66, totalRequired: 70, coveragePercentage: 94.3,
  },
  {
    departmentId: 'DEPT-003', departmentName: 'Surgery',
    shifts: [buildShift('DAY', 36, 38, 55, 3), buildShift('EVENING', 28, 30, 40, 3), buildShift('NIGHT', 14, 16, 20, 3)],
    totalOnDuty: 78, totalRequired: 84, coveragePercentage: 92.9,
  },
  {
    departmentId: 'DEPT-004', departmentName: 'Oncology',
    shifts: [buildShift('DAY', 18, 20, 42, 5), buildShift('EVENING', 14, 16, 36, 5), buildShift('NIGHT', 10, 12, 28, 5)],
    totalOnDuty: 42, totalRequired: 48, coveragePercentage: 87.5,
  },
  {
    departmentId: 'DEPT-005', departmentName: 'Pediatrics',
    shifts: [buildShift('DAY', 20, 20, 34, 4), buildShift('EVENING', 16, 18, 30, 4), buildShift('NIGHT', 12, 14, 22, 4)],
    totalOnDuty: 48, totalRequired: 52, coveragePercentage: 92.3,
  },
  {
    departmentId: 'DEPT-006', departmentName: 'Cardiology',
    shifts: [buildShift('DAY', 16, 18, 32, 4), buildShift('EVENING', 14, 16, 28, 4), buildShift('NIGHT', 10, 10, 18, 4)],
    totalOnDuty: 40, totalRequired: 44, coveragePercentage: 90.9,
  },
  {
    departmentId: 'DEPT-007', departmentName: 'Orthopedics',
    shifts: [buildShift('DAY', 14, 14, 32, 5), buildShift('EVENING', 10, 12, 24, 5), buildShift('NIGHT', 8, 8, 16, 5)],
    totalOnDuty: 32, totalRequired: 34, coveragePercentage: 94.1,
  },
  {
    departmentId: 'DEPT-008', departmentName: 'Neurology',
    shifts: [buildShift('DAY', 12, 14, 24, 4), buildShift('EVENING', 10, 12, 20, 4), buildShift('NIGHT', 8, 10, 14, 4)],
    totalOnDuty: 30, totalRequired: 36, coveragePercentage: 83.3,
  },
  {
    departmentId: 'DEPT-009', departmentName: 'General Ward',
    shifts: [buildShift('DAY', 22, 22, 62, 6), buildShift('EVENING', 18, 20, 56, 6), buildShift('NIGHT', 14, 16, 40, 6)],
    totalOnDuty: 54, totalRequired: 58, coveragePercentage: 93.1,
  },
  {
    departmentId: 'DEPT-010', departmentName: 'Maternity',
    shifts: [buildShift('DAY', 14, 16, 24, 4), buildShift('EVENING', 12, 14, 22, 4), buildShift('NIGHT', 10, 10, 16, 4)],
    totalOnDuty: 36, totalRequired: 40, coveragePercentage: 90.0,
  },
  {
    departmentId: 'DEPT-011', departmentName: 'Radiology',
    shifts: [buildShift('DAY', 10, 10, 28, 6), buildShift('EVENING', 6, 8, 18, 6), buildShift('NIGHT', 4, 4, 8, 6)],
    totalOnDuty: 20, totalRequired: 22, coveragePercentage: 90.9,
  },
  {
    departmentId: 'DEPT-012', departmentName: 'Rehabilitation',
    shifts: [buildShift('DAY', 12, 12, 34, 6), buildShift('EVENING', 8, 10, 24, 6), buildShift('NIGHT', 4, 4, 10, 6)],
    totalOnDuty: 24, totalRequired: 26, coveragePercentage: 92.3,
  },
];

// --- Mock Prediction ---

const now = new Date();

const MOCK_PREDICTION: StaffingPrediction = {
  predictionId: 'PRED-2026-0312',
  generatedAt: now.toISOString(),
  horizonHours: 72,
  confidence: 0.87,
  modelVersion: 'v2.4.1',
  departmentPredictions: DEPARTMENTS.map((dept) => ({
    departmentId: dept.id,
    departmentName: dept.name,
    predictedPatientVolume: Math.round(30 + Math.random() * 60),
    shifts: [
      { shiftType: 'DAY' as const, predictedDemand: Math.round(14 + Math.random() * 30), currentAssigned: Math.round(12 + Math.random() * 28), gap: Math.round(Math.random() * 6 - 2), confidence: 0.82 + Math.random() * 0.15 },
      { shiftType: 'EVENING' as const, predictedDemand: Math.round(10 + Math.random() * 26), currentAssigned: Math.round(8 + Math.random() * 24), gap: Math.round(Math.random() * 8 - 2), confidence: 0.78 + Math.random() * 0.18 },
      { shiftType: 'NIGHT' as const, predictedDemand: Math.round(6 + Math.random() * 20), currentAssigned: Math.round(5 + Math.random() * 18), gap: Math.round(Math.random() * 6 - 1), confidence: 0.75 + Math.random() * 0.2 },
    ],
  })),
};

// --- Mock Recommendations ---

const MOCK_RECOMMENDATIONS: StaffingRecommendation[] = [
  {
    recommendationId: 'REC-SA-001', priority: 'CRITICAL', type: 'ADD_STAFF',
    departmentId: 'DEPT-001', departmentName: 'Emergency', shiftType: 'NIGHT', role: 'RN',
    description: 'Add 2 Registered Nurses to Emergency Night Shift to meet patient surge projections and maintain compliance.',
    currentValue: 14, recommendedValue: 16, delta: 2,
    projectedOvertimeSavings: 2400, projectedCoverageImprovement: 6.3,
    ratioImpact: { before: 3.4, after: 3.0 },
    constraints: ['Regulatory ratio limit: 1:4', 'Projected patient surge: +12% overnight'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-002', priority: 'HIGH', type: 'REASSIGN',
    departmentId: 'DEPT-004', departmentName: 'Oncology', shiftType: 'DAY', role: 'CNA',
    description: 'Reassign 1 CNA from Orthopedics Day Shift to Oncology Day Shift to balance workload.',
    currentValue: 5, recommendedValue: 6, delta: 1,
    projectedOvertimeSavings: 840, projectedCoverageImprovement: 4.2,
    ratioImpact: { before: 8.4, after: 7.0 },
    constraints: ['Orthopedics has 2 surplus CNAs this week', 'Oncology census trending up 8%'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-003', priority: 'HIGH', type: 'ADD_STAFF',
    departmentId: 'DEPT-008', departmentName: 'Neurology', shiftType: 'EVENING', role: 'RN',
    description: 'Add 1 RN to Neurology Evening Shift — current ratio exceeds regulatory limit.',
    currentValue: 5, recommendedValue: 6, delta: 1,
    projectedOvertimeSavings: 1560, projectedCoverageImprovement: 8.3,
    ratioImpact: { before: 4.0, after: 3.3 },
    constraints: ['Regulatory ratio limit: 1:4', 'Current ratio at limit boundary'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-004', priority: 'MEDIUM', type: 'SHIFT_SWAP',
    departmentId: 'DEPT-005', departmentName: 'Pediatrics', shiftType: 'NIGHT', role: 'RN',
    description: 'Swap 1 RN from Pediatrics Night to Evening shift to cover projected gap.',
    currentValue: 6, recommendedValue: 5, delta: -1,
    projectedOvertimeSavings: 620, projectedCoverageImprovement: 2.1,
    ratioImpact: { before: 3.7, after: 4.4 },
    constraints: ['Evening shift gap more critical than night', 'Night census dropping by 15%'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-005', priority: 'MEDIUM', type: 'REDUCE',
    departmentId: 'DEPT-007', departmentName: 'Orthopedics', shiftType: 'DAY', role: 'CNA',
    description: 'Reduce 1 CNA from Orthopedics Day Shift — census below threshold for current staffing.',
    currentValue: 4, recommendedValue: 3, delta: -1,
    projectedOvertimeSavings: 448, projectedCoverageImprovement: 0,
    ratioImpact: { before: 5.3, after: 5.3 },
    constraints: ['Census 18% below weekly average', 'Freed CNA can support Oncology reassignment'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-006', priority: 'LOW', type: 'REASSIGN',
    departmentId: 'DEPT-009', departmentName: 'General Ward', shiftType: 'EVENING', role: 'TECH',
    description: 'Reassign 1 Technician from Radiology Evening to General Ward Evening — utilization imbalance.',
    currentValue: 4, recommendedValue: 5, delta: 1,
    projectedOvertimeSavings: 280, projectedCoverageImprovement: 1.5,
    ratioImpact: { before: 14.0, after: 11.2 },
    constraints: ['Radiology evening volume -22%', 'General Ward tech utilization at 112%'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-007', priority: 'CRITICAL', type: 'ADD_STAFF',
    departmentId: 'DEPT-002', departmentName: 'ICU', shiftType: 'NIGHT', role: 'RN',
    description: 'Add 1 RN to ICU Night Shift — projected census increase will breach 1:2 ratio compliance.',
    currentValue: 10, recommendedValue: 11, delta: 1,
    projectedOvertimeSavings: 1920, projectedCoverageImprovement: 4.5,
    ratioImpact: { before: 1.8, after: 1.6 },
    constraints: ['Regulatory ratio limit: 1:2', 'Projected 3 new admissions overnight'],
    status: 'PENDING',
  },
  {
    recommendationId: 'REC-SA-008', priority: 'LOW', type: 'SHIFT_SWAP',
    departmentId: 'DEPT-010', departmentName: 'Maternity', shiftType: 'DAY', role: 'RN',
    description: 'Consider moving 1 RN from Maternity Day to Evening — evening deliveries trending up.',
    currentValue: 7, recommendedValue: 6, delta: -1,
    projectedOvertimeSavings: 360, projectedCoverageImprovement: 3.1,
    ratioImpact: { before: 3.4, after: 4.0 },
    constraints: ['Evening delivery rate +18% this month', 'Day shift adequately covered at 6 RNs'],
    status: 'PENDING',
  },
];

// --- Mock Overtime Projections ---

const MOCK_OVERTIME_PROJECTIONS: OvertimeCostProjection[] = [
  { departmentId: 'DEPT-001', departmentName: 'Emergency', currentOvertimeCost: 18400, projectedOvertimeCost: 12200, savings: 6200, savingsPercentage: 33.7, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-002', departmentName: 'ICU', currentOvertimeCost: 14200, projectedOvertimeCost: 9800, savings: 4400, savingsPercentage: 31.0, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-003', departmentName: 'Surgery', currentOvertimeCost: 9800, projectedOvertimeCost: 7200, savings: 2600, savingsPercentage: 26.5, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-004', departmentName: 'Oncology', currentOvertimeCost: 6400, projectedOvertimeCost: 4100, savings: 2300, savingsPercentage: 35.9, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-005', departmentName: 'Pediatrics', currentOvertimeCost: 5200, projectedOvertimeCost: 3800, savings: 1400, savingsPercentage: 26.9, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-006', departmentName: 'Cardiology', currentOvertimeCost: 4800, projectedOvertimeCost: 3600, savings: 1200, savingsPercentage: 25.0, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-008', departmentName: 'Neurology', currentOvertimeCost: 7600, projectedOvertimeCost: 4900, savings: 2700, savingsPercentage: 35.5, period: '2026-03 Week 12' },
  { departmentId: 'DEPT-009', departmentName: 'General Ward', currentOvertimeCost: 4200, projectedOvertimeCost: 3400, savings: 800, savingsPercentage: 19.0, period: '2026-03 Week 12' },
];

// --- Mock Coverage Gaps ---

const MOCK_COVERAGE_GAPS: CoverageGap[] = [
  { gapId: 'GAP-001', departmentId: 'DEPT-001', departmentName: 'Emergency', shiftType: 'NIGHT', date: format(addDays(now, 1), 'yyyy-MM-dd'), severity: 'CRITICAL', staffShortfall: 4, role: 'RN', hoursUntilShift: 18 },
  { gapId: 'GAP-002', departmentId: 'DEPT-002', departmentName: 'ICU', shiftType: 'NIGHT', date: format(addDays(now, 1), 'yyyy-MM-dd'), severity: 'CRITICAL', staffShortfall: 2, role: 'RN', hoursUntilShift: 18 },
  { gapId: 'GAP-003', departmentId: 'DEPT-008', departmentName: 'Neurology', shiftType: 'EVENING', date: format(addDays(now, 0), 'yyyy-MM-dd'), severity: 'WARNING', staffShortfall: 2, role: 'RN', hoursUntilShift: 6 },
  { gapId: 'GAP-004', departmentId: 'DEPT-004', departmentName: 'Oncology', shiftType: 'DAY', date: format(addDays(now, 2), 'yyyy-MM-dd'), severity: 'WARNING', staffShortfall: 2, role: 'CNA', hoursUntilShift: 38 },
  { gapId: 'GAP-005', departmentId: 'DEPT-005', departmentName: 'Pediatrics', shiftType: 'EVENING', date: format(addDays(now, 2), 'yyyy-MM-dd'), severity: 'INFO', staffShortfall: 2, role: 'RN', hoursUntilShift: 46 },
  { gapId: 'GAP-006', departmentId: 'DEPT-010', departmentName: 'Maternity', shiftType: 'EVENING', date: format(addDays(now, 3), 'yyyy-MM-dd'), severity: 'INFO', staffShortfall: 1, role: 'RN', hoursUntilShift: 70 },
];

// --- Service Functions ---

export async function fetchCurrentStaffing(): Promise<{
  departments: DepartmentStaffingSummary[];
  totals: StaffingTotals;
}> {
  await new Promise((r) => setTimeout(r, 800));
  const departments = MOCK_DEPARTMENTS;
  const totalOnDuty = departments.reduce((s, d) => s + d.totalOnDuty, 0);
  const totalRequired = departments.reduce((s, d) => s + d.totalRequired, 0);
  return {
    departments,
    totals: {
      totalOnDuty,
      totalRequired,
      overallCoverage: Math.round((totalOnDuty / totalRequired) * 1000) / 10,
      departmentCount: departments.length,
    },
  };
}

export async function runPrediction(): Promise<StaffingPrediction> {
  // Simulate prediction job processing time
  await new Promise((r) => setTimeout(r, 3000));
  return MOCK_PREDICTION;
}

export async function fetchRecommendations(): Promise<{
  recommendations: StaffingRecommendation[];
  summary: { totalRecommendations: number; criticalCount: number; projectedTotalSavings: number; projectedCoverageImprovement: number };
}> {
  await new Promise((r) => setTimeout(r, 600));
  const recs = MOCK_RECOMMENDATIONS;
  return {
    recommendations: recs,
    summary: {
      totalRecommendations: recs.length,
      criticalCount: recs.filter((r) => r.priority === 'CRITICAL').length,
      projectedTotalSavings: recs.reduce((s, r) => s + r.projectedOvertimeSavings, 0),
      projectedCoverageImprovement: Math.round(recs.reduce((s, r) => s + r.projectedCoverageImprovement, 0) * 10) / 10,
    },
  };
}

export async function updateRecommendation(
  id: string,
  status: 'ACCEPTED' | 'REJECTED',
  rejectionReason?: string,
): Promise<StaffingRecommendation> {
  await new Promise((r) => setTimeout(r, 400));
  const rec = MOCK_RECOMMENDATIONS.find((r) => r.recommendationId === id);
  if (!rec) throw new Error(`Recommendation ${id} not found`);
  return { ...rec, status, rejectionReason };
}

export async function fetchOvertimeProjections(): Promise<{
  projections: OvertimeCostProjection[];
  totalCurrentCost: number;
  totalProjectedCost: number;
  totalSavings: number;
}> {
  await new Promise((r) => setTimeout(r, 500));
  const projections = MOCK_OVERTIME_PROJECTIONS;
  return {
    projections,
    totalCurrentCost: projections.reduce((s, p) => s + p.currentOvertimeCost, 0),
    totalProjectedCost: projections.reduce((s, p) => s + p.projectedOvertimeCost, 0),
    totalSavings: projections.reduce((s, p) => s + p.savings, 0),
  };
}

export async function fetchCoverageGaps(): Promise<{
  gaps: CoverageGap[];
  summary: { criticalGaps: number; warningGaps: number; earliestGap: string };
}> {
  await new Promise((r) => setTimeout(r, 500));
  const gaps = MOCK_COVERAGE_GAPS;
  return {
    gaps,
    summary: {
      criticalGaps: gaps.filter((g) => g.severity === 'CRITICAL').length,
      warningGaps: gaps.filter((g) => g.severity === 'WARNING').length,
      earliestGap: gaps.length > 0 ? `${gaps[0].hoursUntilShift}h` : 'None',
    },
  };
}
