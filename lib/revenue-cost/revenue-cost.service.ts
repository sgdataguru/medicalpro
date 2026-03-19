import type {
  FinancialSummary,
  RevenueComponent,
  CostComponent,
  VarianceRecord,
  FinancialDriverAnalysis,
  FinancialNarrative,
  DepartmentFinancialSummary,
  FinancialFilters,
  AnalysisJobStatus,
} from './revenue-cost.types';

import { sortVariancesByImpact } from './revenue-cost.utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SUMMARY: FinancialSummary = {
  periodLabel: 'FY 2025-2026 Q3',
  totalRevenue: 142_300_000,
  totalCost: 130_400_000,
  netIncome: 11_900_000,
  netMarginPercentage: 8.4,
  revenueYoYChange: 8_300_000,
  revenueYoYPercentage: 6.2,
  costYoYChange: 10_900_000,
  costYoYPercentage: 9.1,
  revenueBudgetVariance: 2_900_000,
  revenueBudgetVariancePercentage: 2.1,
  costBudgetVariance: 5_800_000,
  costBudgetVariancePercentage: 4.8,
  marginTrend: [
    { month: 'Apr 2025', marginPercentage: 8.1 },
    { month: 'May 2025', marginPercentage: 8.3 },
    { month: 'Jun 2025', marginPercentage: 8.2 },
    { month: 'Jul 2025', marginPercentage: 8.5 },
    { month: 'Aug 2025', marginPercentage: 8.4 },
    { month: 'Sep 2025', marginPercentage: 8.6 },
    { month: 'Oct 2025', marginPercentage: 8.3 },
    { month: 'Nov 2025', marginPercentage: 8.7 },
    { month: 'Dec 2025', marginPercentage: 8.8 },
    { month: 'Jan 2026', marginPercentage: 8.4 },
    { month: 'Feb 2026', marginPercentage: 8.2 },
    { month: 'Mar 2026', marginPercentage: 8.4 },
  ],
  comparisonPeriodLabel: 'FY 2024-2025 Q3',
};

const MOCK_REVENUE_COMPONENTS: RevenueComponent[] = [
  {
    componentId: 'rev-surgical',
    name: 'Surgical Services',
    category: 'SURGICAL',
    departmentId: 'dept-surgery',
    departmentName: 'Surgery',
    currentAmount: 48_300_000,
    comparisonAmount: 43_500_000,
    delta: 4_800_000,
    deltaPercentage: 11.0,
    contributionPercentage: 33.9,
    isPositive: true,
  },
  {
    componentId: 'rev-inpatient',
    name: 'Inpatient Services',
    category: 'INPATIENT',
    departmentId: 'dept-inpatient',
    departmentName: 'Inpatient',
    currentAmount: 32_100_000,
    comparisonAmount: 30_800_000,
    delta: 1_300_000,
    deltaPercentage: 4.2,
    contributionPercentage: 22.6,
    isPositive: true,
  },
  {
    componentId: 'rev-outpatient',
    name: 'Outpatient Services',
    category: 'OUTPATIENT',
    departmentId: 'dept-outpatient',
    departmentName: 'Outpatient',
    currentAmount: 24_500_000,
    comparisonAmount: 23_800_000,
    delta: 700_000,
    deltaPercentage: 2.9,
    contributionPercentage: 17.2,
    isPositive: true,
  },
  {
    componentId: 'rev-emergency',
    name: 'Emergency Department',
    category: 'EMERGENCY',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    currentAmount: 15_200_000,
    comparisonAmount: 13_700_000,
    delta: 1_500_000,
    deltaPercentage: 10.9,
    contributionPercentage: 10.7,
    isPositive: true,
  },
  {
    componentId: 'rev-imaging',
    name: 'Imaging & Radiology',
    category: 'IMAGING',
    departmentId: 'dept-radiology',
    departmentName: 'Radiology',
    currentAmount: 9_800_000,
    comparisonAmount: 8_900_000,
    delta: 900_000,
    deltaPercentage: 10.1,
    contributionPercentage: 6.9,
    isPositive: true,
  },
  {
    componentId: 'rev-pharmacy',
    name: 'Pharmacy Revenue',
    category: 'PHARMACY',
    departmentId: 'dept-pharmacy',
    departmentName: 'Pharmacy',
    currentAmount: 12_100_000,
    comparisonAmount: 13_400_000,
    delta: -1_300_000,
    deltaPercentage: -9.7,
    contributionPercentage: 8.5,
    isPositive: false,
  },
  {
    componentId: 'rev-laboratory',
    name: 'Laboratory Services',
    category: 'LABORATORY',
    departmentId: 'dept-lab',
    departmentName: 'Laboratory',
    currentAmount: 6_400_000,
    comparisonAmount: 7_100_000,
    delta: -700_000,
    deltaPercentage: -9.9,
    contributionPercentage: 4.5,
    isPositive: false,
  },
  {
    componentId: 'rev-rehab',
    name: 'Rehabilitation Services',
    category: 'REHABILITATION',
    departmentId: 'dept-rehab',
    departmentName: 'Rehabilitation',
    currentAmount: 3_900_000,
    comparisonAmount: 3_500_000,
    delta: 400_000,
    deltaPercentage: 11.4,
    contributionPercentage: 2.7,
    isPositive: true,
  },
];

const MOCK_COST_COMPONENTS: CostComponent[] = [
  {
    componentId: 'cost-staffing',
    name: 'Staffing & Labor',
    category: 'STAFFING',
    currentAmount: 68_200_000,
    comparisonAmount: 62_500_000,
    delta: 5_700_000,
    deltaPercentage: 9.1,
    percentageOfTotal: 52.3,
    trend: 'RISING',
    trendPercentage: 9.1,
    budgetAmount: 64_000_000,
    budgetVariance: 4_200_000,
    budgetVariancePercentage: 6.6,
  },
  {
    componentId: 'cost-supplies',
    name: 'Medical Supplies',
    category: 'SUPPLIES',
    currentAmount: 31_500_000,
    comparisonAmount: 29_100_000,
    delta: 2_400_000,
    deltaPercentage: 8.2,
    percentageOfTotal: 24.2,
    trend: 'RISING',
    trendPercentage: 8.2,
    budgetAmount: 30_200_000,
    budgetVariance: 1_300_000,
    budgetVariancePercentage: 4.3,
  },
  {
    componentId: 'cost-equipment',
    name: 'Equipment & Technology',
    category: 'EQUIPMENT',
    currentAmount: 15_200_000,
    comparisonAmount: 13_800_000,
    delta: 1_400_000,
    deltaPercentage: 10.1,
    percentageOfTotal: 11.7,
    trend: 'RISING',
    trendPercentage: 10.1,
    budgetAmount: 13_500_000,
    budgetVariance: 1_700_000,
    budgetVariancePercentage: 12.6,
  },
  {
    componentId: 'cost-overhead',
    name: 'Administrative Overhead',
    category: 'OVERHEAD',
    currentAmount: 15_500_000,
    comparisonAmount: 14_800_000,
    delta: 700_000,
    deltaPercentage: 4.7,
    percentageOfTotal: 11.9,
    trend: 'STABLE',
    trendPercentage: 4.7,
    budgetAmount: 15_000_000,
    budgetVariance: 500_000,
    budgetVariancePercentage: 3.3,
  },
  {
    componentId: 'cost-pharma',
    name: 'Pharmaceuticals',
    category: 'PHARMACEUTICALS',
    currentAmount: 10_800_000,
    comparisonAmount: 9_900_000,
    delta: 900_000,
    deltaPercentage: 9.1,
    percentageOfTotal: 8.3,
    trend: 'RISING',
    trendPercentage: 9.1,
    budgetAmount: 10_200_000,
    budgetVariance: 600_000,
    budgetVariancePercentage: 5.9,
  },
  {
    componentId: 'cost-facilities',
    name: 'Facilities & Maintenance',
    category: 'FACILITIES',
    currentAmount: 5_200_000,
    comparisonAmount: 5_000_000,
    delta: 200_000,
    deltaPercentage: 4.0,
    percentageOfTotal: 4.0,
    trend: 'STABLE',
    trendPercentage: 4.0,
    budgetAmount: 5_100_000,
    budgetVariance: 100_000,
    budgetVariancePercentage: 2.0,
  },
  {
    componentId: 'cost-insurance',
    name: 'Insurance & Other',
    category: 'INSURANCE',
    currentAmount: 4_000_000,
    comparisonAmount: 3_800_000,
    delta: 200_000,
    deltaPercentage: 5.3,
    percentageOfTotal: 3.1,
    trend: 'STABLE',
    trendPercentage: 5.3,
    budgetAmount: 3_900_000,
    budgetVariance: 100_000,
    budgetVariancePercentage: 2.6,
  },
];

const MOCK_VARIANCES: VarianceRecord[] = [
  {
    varianceId: 'var-001',
    lineItem: 'ER Nursing',
    lineItemCode: 'STAFF-ER-NUR',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    category: 'STAFFING',
    type: 'COST',
    actualAmount: 8_200_000,
    budgetAmount: 6_800_000,
    priorYearAmount: 6_500_000,
    varianceToBudget: 1_400_000,
    varianceToBudgetPercentage: 20.6,
    varianceToPriorYear: 1_700_000,
    varianceToPriorYearPercentage: 26.2,
    severity: 'CRITICAL',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: 'Increased patient volume and nurse overtime due to regional ER closures.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 620_000 },
      { month: 'May 2025', amount: 640_000 },
      { month: 'Jun 2025', amount: 660_000 },
      { month: 'Jul 2025', amount: 680_000 },
      { month: 'Aug 2025', amount: 700_000 },
      { month: 'Sep 2025', amount: 710_000 },
      { month: 'Oct 2025', amount: 690_000 },
      { month: 'Nov 2025', amount: 720_000 },
      { month: 'Dec 2025', amount: 730_000 },
      { month: 'Jan 2026', amount: 700_000 },
      { month: 'Feb 2026', amount: 680_000 },
      { month: 'Mar 2026', amount: 670_000 },
    ],
  },
  {
    varianceId: 'var-002',
    lineItem: 'ICU Agency Staffing',
    lineItemCode: 'STAFF-ICU-AGN',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    category: 'STAFFING',
    type: 'COST',
    actualAmount: 2_100_000,
    budgetAmount: 1_100_000,
    priorYearAmount: 900_000,
    varianceToBudget: 1_000_000,
    varianceToBudgetPercentage: 89.1,
    varianceToPriorYear: 1_200_000,
    varianceToPriorYearPercentage: 133.3,
    severity: 'CRITICAL',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: 'National nursing shortage driving reliance on travel nurses at premium rates.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 140_000 },
      { month: 'May 2025', amount: 155_000 },
      { month: 'Jun 2025', amount: 160_000 },
      { month: 'Jul 2025', amount: 175_000 },
      { month: 'Aug 2025', amount: 185_000 },
      { month: 'Sep 2025', amount: 195_000 },
      { month: 'Oct 2025', amount: 190_000 },
      { month: 'Nov 2025', amount: 200_000 },
      { month: 'Dec 2025', amount: 195_000 },
      { month: 'Jan 2026', amount: 180_000 },
      { month: 'Feb 2026', amount: 170_000 },
      { month: 'Mar 2026', amount: 155_000 },
    ],
  },
  {
    varianceId: 'var-003',
    lineItem: 'Surgical Revenue',
    lineItemCode: 'REV-SURG-TOT',
    departmentId: 'dept-surgery',
    departmentName: 'Surgery',
    category: 'SURGICAL',
    type: 'REVENUE',
    actualAmount: 48_300_000,
    budgetAmount: 43_500_000,
    priorYearAmount: 43_500_000,
    varianceToBudget: 4_800_000,
    varianceToBudgetPercentage: 11.0,
    varianceToPriorYear: 4_800_000,
    varianceToPriorYearPercentage: 11.0,
    severity: 'SIGNIFICANT',
    direction: 'FAVORABLE',
    flagged: false,
    rootCauseNotes: 'New orthopedic wing driving higher surgical volume; robotic-assisted procedures up 35%.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 3_800_000 },
      { month: 'May 2025', amount: 3_900_000 },
      { month: 'Jun 2025', amount: 3_850_000 },
      { month: 'Jul 2025', amount: 4_100_000 },
      { month: 'Aug 2025', amount: 4_050_000 },
      { month: 'Sep 2025', amount: 4_200_000 },
      { month: 'Oct 2025', amount: 4_000_000 },
      { month: 'Nov 2025', amount: 4_150_000 },
      { month: 'Dec 2025', amount: 4_250_000 },
      { month: 'Jan 2026', amount: 4_100_000 },
      { month: 'Feb 2026', amount: 3_950_000 },
      { month: 'Mar 2026', amount: 3_950_000 },
    ],
  },
  {
    varianceId: 'var-004',
    lineItem: 'Pharmacy Revenue',
    lineItemCode: 'REV-PHAR-TOT',
    departmentId: 'dept-pharmacy',
    departmentName: 'Pharmacy',
    category: 'PHARMACY',
    type: 'REVENUE',
    actualAmount: 12_100_000,
    budgetAmount: 13_400_000,
    priorYearAmount: 13_400_000,
    varianceToBudget: -1_300_000,
    varianceToBudgetPercentage: -9.7,
    varianceToPriorYear: -1_300_000,
    varianceToPriorYearPercentage: -9.7,
    severity: 'MODERATE',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: '340B program changes and payer mix shift reducing pharmacy margins.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 1_100_000 },
      { month: 'May 2025', amount: 1_080_000 },
      { month: 'Jun 2025', amount: 1_050_000 },
      { month: 'Jul 2025', amount: 1_020_000 },
      { month: 'Aug 2025', amount: 1_000_000 },
      { month: 'Sep 2025', amount: 980_000 },
      { month: 'Oct 2025', amount: 990_000 },
      { month: 'Nov 2025', amount: 1_010_000 },
      { month: 'Dec 2025', amount: 1_000_000 },
      { month: 'Jan 2026', amount: 970_000 },
      { month: 'Feb 2026', amount: 960_000 },
      { month: 'Mar 2026', amount: 940_000 },
    ],
  },
  {
    varianceId: 'var-005',
    lineItem: 'Imaging Revenue',
    lineItemCode: 'REV-IMG-TOT',
    departmentId: 'dept-radiology',
    departmentName: 'Radiology',
    category: 'IMAGING',
    type: 'REVENUE',
    actualAmount: 9_800_000,
    budgetAmount: 8_900_000,
    priorYearAmount: 8_900_000,
    varianceToBudget: 900_000,
    varianceToBudgetPercentage: 10.1,
    varianceToPriorYear: 900_000,
    varianceToPriorYearPercentage: 10.1,
    severity: 'SIGNIFICANT',
    direction: 'FAVORABLE',
    flagged: false,
    rootCauseNotes: 'New MRI unit and expanded outpatient imaging hours increasing throughput.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 780_000 },
      { month: 'May 2025', amount: 790_000 },
      { month: 'Jun 2025', amount: 800_000 },
      { month: 'Jul 2025', amount: 820_000 },
      { month: 'Aug 2025', amount: 830_000 },
      { month: 'Sep 2025', amount: 850_000 },
      { month: 'Oct 2025', amount: 820_000 },
      { month: 'Nov 2025', amount: 840_000 },
      { month: 'Dec 2025', amount: 830_000 },
      { month: 'Jan 2026', amount: 810_000 },
      { month: 'Feb 2026', amount: 800_000 },
      { month: 'Mar 2026', amount: 830_000 },
    ],
  },
  {
    varianceId: 'var-006',
    lineItem: 'Equipment Lease',
    lineItemCode: 'EQUIP-LEASE-TOT',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    category: 'EQUIPMENT',
    type: 'COST',
    actualAmount: 3_200_000,
    budgetAmount: 2_700_000,
    priorYearAmount: 2_500_000,
    varianceToBudget: 500_000,
    varianceToBudgetPercentage: 18.5,
    varianceToPriorYear: 700_000,
    varianceToPriorYearPercentage: 28.0,
    severity: 'SIGNIFICANT',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: 'Unbudgeted CT scanner replacement and robotic surgery system lease escalation.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 250_000 },
      { month: 'May 2025', amount: 255_000 },
      { month: 'Jun 2025', amount: 260_000 },
      { month: 'Jul 2025', amount: 270_000 },
      { month: 'Aug 2025', amount: 275_000 },
      { month: 'Sep 2025', amount: 280_000 },
      { month: 'Oct 2025', amount: 270_000 },
      { month: 'Nov 2025', amount: 275_000 },
      { month: 'Dec 2025', amount: 270_000 },
      { month: 'Jan 2026', amount: 265_000 },
      { month: 'Feb 2026', amount: 260_000 },
      { month: 'Mar 2026', amount: 270_000 },
    ],
  },
  {
    varianceId: 'var-007',
    lineItem: 'Supply Chain',
    lineItemCode: 'SUP-CHAIN-TOT',
    departmentId: 'dept-supply',
    departmentName: 'Supply Chain',
    category: 'SUPPLIES',
    type: 'COST',
    actualAmount: 31_500_000,
    budgetAmount: 30_200_000,
    priorYearAmount: 29_100_000,
    varianceToBudget: 1_300_000,
    varianceToBudgetPercentage: 4.3,
    varianceToPriorYear: 2_400_000,
    varianceToPriorYearPercentage: 8.2,
    severity: 'MINOR',
    direction: 'UNFAVORABLE',
    flagged: false,
    rootCauseNotes: 'General supply cost inflation; partially offset by GPO renegotiations.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 2_550_000 },
      { month: 'May 2025', amount: 2_580_000 },
      { month: 'Jun 2025', amount: 2_600_000 },
      { month: 'Jul 2025', amount: 2_650_000 },
      { month: 'Aug 2025', amount: 2_680_000 },
      { month: 'Sep 2025', amount: 2_700_000 },
      { month: 'Oct 2025', amount: 2_640_000 },
      { month: 'Nov 2025', amount: 2_660_000 },
      { month: 'Dec 2025', amount: 2_650_000 },
      { month: 'Jan 2026', amount: 2_620_000 },
      { month: 'Feb 2026', amount: 2_580_000 },
      { month: 'Mar 2026', amount: 2_590_000 },
    ],
  },
  {
    varianceId: 'var-008',
    lineItem: 'Outpatient Revenue',
    lineItemCode: 'REV-OPT-TOT',
    departmentId: 'dept-outpatient',
    departmentName: 'Outpatient',
    category: 'OUTPATIENT',
    type: 'REVENUE',
    actualAmount: 24_500_000,
    budgetAmount: 23_800_000,
    priorYearAmount: 23_800_000,
    varianceToBudget: 700_000,
    varianceToBudgetPercentage: 2.9,
    varianceToPriorYear: 700_000,
    varianceToPriorYearPercentage: 2.9,
    severity: 'MINOR',
    direction: 'FAVORABLE',
    flagged: false,
    rootCauseNotes: 'Steady volume growth from expanded clinic hours and telehealth integration.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 1_980_000 },
      { month: 'May 2025', amount: 2_000_000 },
      { month: 'Jun 2025', amount: 2_020_000 },
      { month: 'Jul 2025', amount: 2_050_000 },
      { month: 'Aug 2025', amount: 2_080_000 },
      { month: 'Sep 2025', amount: 2_100_000 },
      { month: 'Oct 2025', amount: 2_050_000 },
      { month: 'Nov 2025', amount: 2_060_000 },
      { month: 'Dec 2025', amount: 2_040_000 },
      { month: 'Jan 2026', amount: 2_020_000 },
      { month: 'Feb 2026', amount: 2_000_000 },
      { month: 'Mar 2026', amount: 2_100_000 },
    ],
  },
  {
    varianceId: 'var-009',
    lineItem: 'IT Infrastructure',
    lineItemCode: 'EQUIP-IT-INF',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    category: 'EQUIPMENT',
    type: 'COST',
    actualAmount: 1_800_000,
    budgetAmount: 1_500_000,
    priorYearAmount: 1_200_000,
    varianceToBudget: 300_000,
    varianceToBudgetPercentage: 20.0,
    varianceToPriorYear: 600_000,
    varianceToPriorYearPercentage: 50.0,
    severity: 'CRITICAL',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: 'Cybersecurity upgrades mandated after compliance audit; EHR migration costs.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 130_000 },
      { month: 'May 2025', amount: 135_000 },
      { month: 'Jun 2025', amount: 140_000 },
      { month: 'Jul 2025', amount: 150_000 },
      { month: 'Aug 2025', amount: 160_000 },
      { month: 'Sep 2025', amount: 170_000 },
      { month: 'Oct 2025', amount: 165_000 },
      { month: 'Nov 2025', amount: 155_000 },
      { month: 'Dec 2025', amount: 150_000 },
      { month: 'Jan 2026', amount: 155_000 },
      { month: 'Feb 2026', amount: 145_000 },
      { month: 'Mar 2026', amount: 145_000 },
    ],
  },
  {
    varianceId: 'var-010',
    lineItem: 'Lab Revenue',
    lineItemCode: 'REV-LAB-TOT',
    departmentId: 'dept-lab',
    departmentName: 'Laboratory',
    category: 'LABORATORY',
    type: 'REVENUE',
    actualAmount: 6_400_000,
    budgetAmount: 7_100_000,
    priorYearAmount: 7_100_000,
    varianceToBudget: -700_000,
    varianceToBudgetPercentage: -9.9,
    varianceToPriorYear: -700_000,
    varianceToPriorYearPercentage: -9.9,
    severity: 'MODERATE',
    direction: 'UNFAVORABLE',
    flagged: true,
    rootCauseNotes: 'Reference lab migration displacing internal test volume; payer rate cuts.',
    monthlyTrend: [
      { month: 'Apr 2025', amount: 570_000 },
      { month: 'May 2025', amount: 560_000 },
      { month: 'Jun 2025', amount: 550_000 },
      { month: 'Jul 2025', amount: 540_000 },
      { month: 'Aug 2025', amount: 530_000 },
      { month: 'Sep 2025', amount: 520_000 },
      { month: 'Oct 2025', amount: 530_000 },
      { month: 'Nov 2025', amount: 525_000 },
      { month: 'Dec 2025', amount: 520_000 },
      { month: 'Jan 2026', amount: 515_000 },
      { month: 'Feb 2026', amount: 510_000 },
      { month: 'Mar 2026', amount: 525_000 },
    ],
  },
];

const MOCK_DRIVER_ANALYSIS: FinancialDriverAnalysis = {
  analysisId: 'analysis-001',
  generatedAt: '2026-03-19T08:00:00Z',
  modelVersion: '2.4.1',
  confidence: 0.91,
  revenueDrivers: [
    {
      driverId: 'rd-001',
      rank: 1,
      name: 'Surgical Volume Growth',
      category: 'Volume',
      departmentId: 'dept-surgery',
      departmentName: 'Surgery',
      impactAmount: 4_800_000,
      impactPercentage: 3.4,
      direction: 'INCREASE',
      confidence: 0.95,
      description:
        'Surgical case volume increased 18% driven by the new orthopedic wing and expanded robotic-assisted procedures.',
      supportingDataPoints: [
        { metric: 'Surgical Cases', value: '4,280', context: 'Up from 3,620 prior year' },
        { metric: 'Avg Case Revenue', value: '$11,285', context: 'Stable vs. prior year' },
        { metric: 'Robotic Procedures', value: '680', context: 'Up 35% from 504' },
      ],
      relatedVarianceIds: ['var-003'],
    },
    {
      driverId: 'rd-002',
      rank: 2,
      name: 'Outpatient Imaging Expansion',
      category: 'Volume',
      departmentId: 'dept-radiology',
      departmentName: 'Radiology',
      impactAmount: 2_100_000,
      impactPercentage: 1.5,
      direction: 'INCREASE',
      confidence: 0.91,
      description:
        'New MRI unit and extended outpatient imaging hours added capacity, increasing scan volume by 22%.',
      supportingDataPoints: [
        { metric: 'MRI Scans', value: '8,450', context: 'Up from 6,920 prior year' },
        { metric: 'CT Scans', value: '12,100', context: 'Up 12% from 10,800' },
        { metric: 'Outpatient Hours', value: '14 hrs/day', context: 'Up from 10 hrs/day' },
      ],
      relatedVarianceIds: ['var-005'],
    },
    {
      driverId: 'rd-003',
      rank: 3,
      name: 'ER Volume Increase',
      category: 'Volume',
      departmentId: 'dept-er',
      departmentName: 'Emergency',
      impactAmount: 1_500_000,
      impactPercentage: 1.1,
      direction: 'INCREASE',
      confidence: 0.88,
      description:
        'Regional ER closures redirected patient flow, increasing ER visits by 14%.',
      supportingDataPoints: [
        { metric: 'ER Visits', value: '48,200', context: 'Up from 42,300 prior year' },
        { metric: 'Avg Revenue/Visit', value: '$315', context: 'Stable vs. prior year' },
        { metric: 'Admission Rate', value: '28%', context: 'Up from 25%' },
      ],
      relatedVarianceIds: ['var-001'],
    },
    {
      driverId: 'rd-004',
      rank: 4,
      name: 'Inpatient Average Daily Rate',
      category: 'Rate',
      departmentId: 'dept-inpatient',
      departmentName: 'Inpatient',
      impactAmount: 1_200_000,
      impactPercentage: 0.8,
      direction: 'INCREASE',
      confidence: 0.85,
      description:
        'Payer contract renegotiations and case-mix index improvement lifted inpatient daily rates by 3.8%.',
      supportingDataPoints: [
        { metric: 'Avg Daily Rate', value: '$2,840', context: 'Up from $2,735 prior year' },
        { metric: 'Case Mix Index', value: '1.62', context: 'Up from 1.55' },
        { metric: 'Patient Days', value: '11,300', context: 'Stable vs. prior year' },
      ],
      relatedVarianceIds: [],
    },
    {
      driverId: 'rd-005',
      rank: 5,
      name: 'Lab Volume Recovery',
      category: 'Volume',
      departmentId: 'dept-lab',
      departmentName: 'Laboratory',
      impactAmount: 700_000,
      impactPercentage: 0.5,
      direction: 'DECREASE',
      confidence: 0.82,
      description:
        'Reference lab migration displaced internal test volume; partially offset by new point-of-care testing.',
      supportingDataPoints: [
        { metric: 'Internal Tests', value: '185,000', context: 'Down from 210,000 prior year' },
        { metric: 'POC Tests', value: '24,000', context: 'New service line' },
        { metric: 'Revenue/Test', value: '$28', context: 'Down from $30 due to payer mix' },
      ],
      relatedVarianceIds: ['var-010'],
    },
  ],
  costDrivers: [
    {
      driverId: 'cd-001',
      rank: 1,
      name: 'Overtime & Agency Staffing',
      category: 'Labor',
      departmentId: 'dept-hr',
      departmentName: 'Human Resources',
      impactAmount: 3_200_000,
      impactPercentage: 2.5,
      direction: 'INCREASE',
      confidence: 0.94,
      description:
        'Overtime hours up 28% and agency nurse usage doubled, driven by national staffing shortages and higher patient volumes.',
      supportingDataPoints: [
        { metric: 'Overtime Hours', value: '62,400', context: 'Up from 48,800 prior year' },
        { metric: 'Agency FTEs', value: '45', context: 'Up from 22 prior year' },
        { metric: 'Agency Premium', value: '2.1x', context: 'Up from 1.8x base rate' },
      ],
      relatedVarianceIds: ['var-001', 'var-002'],
    },
    {
      driverId: 'cd-002',
      rank: 2,
      name: 'Equipment Upgrades & Replacements',
      category: 'Capital',
      departmentId: 'dept-ops',
      departmentName: 'Operations',
      impactAmount: 1_800_000,
      impactPercentage: 1.4,
      direction: 'INCREASE',
      confidence: 0.90,
      description:
        'Unplanned CT scanner replacement and robotic surgery system lease escalation added $1.8M above budget.',
      supportingDataPoints: [
        { metric: 'CT Replacement', value: '$850K', context: 'Unbudgeted emergency replacement' },
        { metric: 'Robotic Lease', value: '$420K/yr', context: 'Up from $310K/yr' },
        { metric: 'Maintenance Contracts', value: '$530K', context: 'New extended warranties' },
      ],
      relatedVarianceIds: ['var-006'],
    },
    {
      driverId: 'cd-003',
      rank: 3,
      name: 'Nursing Travel Contracts',
      category: 'Labor',
      departmentId: 'dept-icu',
      departmentName: 'ICU',
      impactAmount: 1_400_000,
      impactPercentage: 1.1,
      direction: 'INCREASE',
      confidence: 0.88,
      description:
        'ICU travel nurse contracts at premium rates, filling 45 open positions in a competitive labor market.',
      supportingDataPoints: [
        { metric: 'Travel Nurses', value: '38', context: 'Up from 15 prior year' },
        { metric: 'Avg Weekly Rate', value: '$3,200', context: 'Up from $2,600' },
        { metric: 'Contract Duration', value: '13 weeks avg', context: 'Higher turnover' },
      ],
      relatedVarianceIds: ['var-002'],
    },
    {
      driverId: 'cd-004',
      rank: 4,
      name: 'Pharmaceutical Price Increases',
      category: 'Supply',
      departmentId: 'dept-pharmacy',
      departmentName: 'Pharmacy',
      impactAmount: 1_100_000,
      impactPercentage: 0.8,
      direction: 'INCREASE',
      confidence: 0.86,
      description:
        'Branded drug price increases averaging 8.5% and 340B contract changes reduced pharmacy margin.',
      supportingDataPoints: [
        { metric: 'Brand Drug Spend', value: '$6.2M', context: 'Up from $5.7M' },
        { metric: 'Generic Substitution', value: '82%', context: 'Stable vs. prior year' },
        { metric: '340B Savings', value: '$1.8M', context: 'Down from $2.1M' },
      ],
      relatedVarianceIds: ['var-004'],
    },
    {
      driverId: 'cd-005',
      rank: 5,
      name: 'IT Infrastructure & Cybersecurity',
      category: 'Technology',
      departmentId: 'dept-it',
      departmentName: 'Information Technology',
      impactAmount: 800_000,
      impactPercentage: 0.6,
      direction: 'INCREASE',
      confidence: 0.83,
      description:
        'Mandatory cybersecurity upgrades after compliance audit and ongoing EHR migration costs.',
      supportingDataPoints: [
        { metric: 'Cybersecurity Spend', value: '$420K', context: 'Mandated by audit findings' },
        { metric: 'EHR Migration', value: '$280K', context: 'Phase 2 of 3-year plan' },
        { metric: 'Cloud Hosting', value: '$100K', context: 'New disaster recovery environment' },
      ],
      relatedVarianceIds: ['var-009'],
    },
  ],
};

const MOCK_NARRATIVE: FinancialNarrative = {
  narrativeId: 'narrative-001',
  generatedAt: '2026-03-19T08:00:00Z',
  summary:
    'Revenue increased 6.2% YoY to $142.3M, driven primarily by surgical volume (+$4.8M) and outpatient imaging (+$2.1M). However, staffing costs rose 9.1%, exceeding budget by $5.8M, largely due to overtime in Emergency (+$1.4M) and agency nursing in ICU (+$980K).',
  fullAnalysis:
    'The hospital system achieved total revenue of $142.3M in FY 2025-2026 Q3, representing a 6.2% year-over-year increase (+$8.3M). This growth was primarily fueled by two major drivers: surgical services revenue surged 11.0% to $48.3M following the opening of the new orthopedic wing and adoption of robotic-assisted procedures, while imaging and radiology grew 10.1% to $9.8M after the installation of a new MRI unit and expansion of outpatient imaging hours. Emergency department revenue also contributed meaningfully with a 10.9% increase to $15.2M, driven by regional ER closures redirecting patient volume.\n\nOn the cost side, total expenditures reached $130.4M, a 9.1% increase that outpaced revenue growth and narrowed the net margin to 8.4%. The most significant cost pressure came from staffing and labor, which rose to $68.2M (52.3% of total costs) and exceeded budget by $4.2M. Two critical variances stand out: ER nursing costs overran budget by 20.6% ($1.4M) due to overtime demands from higher patient volumes, and ICU agency staffing nearly doubled its budget (+89.1%) as the national nursing shortage forced reliance on premium-rate travel nurses. Equipment costs also presented a significant variance with an unbudgeted CT scanner replacement and robotic surgery system lease escalation.\n\nDespite the cost pressures, the hospital maintained a positive net income of $11.9M with revenue beating budget by 2.1% ($2.9M). Key areas requiring management attention include the unsustainable reliance on agency staffing ($2.1M vs. $1.1M budget), declining pharmacy revenue from 340B program changes (-$1.3M vs. budget), and accelerating IT infrastructure costs driven by mandatory cybersecurity upgrades. The margin trend has remained stable in the 8.1-8.8% range across the twelve-month period, suggesting the cost increases have been partially absorbed by revenue growth.',
  keyInsights: [
    {
      insight:
        'Agency staffing costs in ICU are 89% over budget ($2.1M vs. $1.1M) and represent the single largest percentage variance. Developing a permanent recruitment pipeline could save $800K-$1M annually.',
      severity: 'HIGH',
      actionable: true,
    },
    {
      insight:
        'Surgical revenue is the strongest growth driver at +$4.8M (+11%), with robotic-assisted procedures up 35%. This validates the capital investment in the orthopedic wing and robotic systems.',
      severity: 'MEDIUM',
      actionable: false,
    },
    {
      insight:
        'Pharmacy revenue declined 9.7% due to 340B program changes and payer mix shifts. A comprehensive pharmacy benefit review and 340B optimization initiative should be prioritized.',
      severity: 'HIGH',
      actionable: true,
    },
    {
      insight:
        'ER volume increased 14% from regional closures, but nursing overtime has pushed costs 20.6% over budget. Cross-training and float pool expansion could reduce premium labor dependency.',
      severity: 'HIGH',
      actionable: true,
    },
    {
      insight:
        'Net margin has remained stable between 8.1-8.8% despite cost pressures, indicating effective revenue growth is offsetting rising expenses in the near term.',
      severity: 'LOW',
      actionable: false,
    },
  ],
  dataPointsUsed: 1_247,
  modelVersion: '2.4.1',
};

const MOCK_DEPARTMENT_SUMMARIES: DepartmentFinancialSummary[] = [
  {
    departmentId: 'dept-surgery',
    departmentName: 'Surgery',
    revenue: 48_300_000,
    cost: 28_500_000,
    netIncome: 19_800_000,
    marginPercentage: 41.0,
    revenueYoYChange: 11.0,
    costYoYChange: 7.2,
    topRevenueSource: 'Orthopedic Procedures',
    topCostCategory: 'Surgeon Compensation',
    headcount: 185,
    revenuePerEmployee: 261_081,
  },
  {
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    revenue: 18_500_000,
    cost: 22_100_000,
    netIncome: -3_600_000,
    marginPercentage: -19.5,
    revenueYoYChange: 5.8,
    costYoYChange: 14.2,
    topRevenueSource: 'Critical Care Days',
    topCostCategory: 'Agency Nursing',
    headcount: 210,
    revenuePerEmployee: 88_095,
  },
  {
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    revenue: 15_200_000,
    cost: 14_800_000,
    netIncome: 400_000,
    marginPercentage: 2.6,
    revenueYoYChange: 10.9,
    costYoYChange: 12.5,
    topRevenueSource: 'ER Visits',
    topCostCategory: 'Nursing Overtime',
    headcount: 165,
    revenuePerEmployee: 92_121,
  },
  {
    departmentId: 'dept-oncology',
    departmentName: 'Oncology',
    revenue: 12_800_000,
    cost: 10_200_000,
    netIncome: 2_600_000,
    marginPercentage: 20.3,
    revenueYoYChange: 4.5,
    costYoYChange: 3.8,
    topRevenueSource: 'Chemotherapy Infusions',
    topCostCategory: 'Pharmaceuticals',
    headcount: 95,
    revenuePerEmployee: 134_737,
  },
  {
    departmentId: 'dept-cardiology',
    departmentName: 'Cardiology',
    revenue: 14_200_000,
    cost: 11_500_000,
    netIncome: 2_700_000,
    marginPercentage: 19.0,
    revenueYoYChange: 6.1,
    costYoYChange: 5.4,
    topRevenueSource: 'Catheterization Lab',
    topCostCategory: 'Equipment Leases',
    headcount: 110,
    revenuePerEmployee: 129_091,
  },
  {
    departmentId: 'dept-radiology',
    departmentName: 'Radiology',
    revenue: 9_800_000,
    cost: 6_100_000,
    netIncome: 3_700_000,
    marginPercentage: 37.8,
    revenueYoYChange: 10.1,
    costYoYChange: 8.5,
    topRevenueSource: 'MRI & CT Imaging',
    topCostCategory: 'Equipment Maintenance',
    headcount: 72,
    revenuePerEmployee: 136_111,
  },
  {
    departmentId: 'dept-pediatrics',
    departmentName: 'Pediatrics',
    revenue: 8_900_000,
    cost: 7_800_000,
    netIncome: 1_100_000,
    marginPercentage: 12.4,
    revenueYoYChange: 3.2,
    costYoYChange: 4.1,
    topRevenueSource: 'NICU Services',
    topCostCategory: 'Nursing Staff',
    headcount: 88,
    revenuePerEmployee: 101_136,
  },
  {
    departmentId: 'dept-orthopedics',
    departmentName: 'Orthopedics',
    revenue: 11_400_000,
    cost: 8_200_000,
    netIncome: 3_200_000,
    marginPercentage: 28.1,
    revenueYoYChange: 15.2,
    costYoYChange: 9.8,
    topRevenueSource: 'Joint Replacements',
    topCostCategory: 'Implant Supplies',
    headcount: 78,
    revenuePerEmployee: 146_154,
  },
];

// ─── Analysis Job Tracking ────────────────────────────────────────────────────

const analysisJobs = new Map<
  string,
  { status: AnalysisJobStatus; startedAt: number }
>();

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch the high-level financial summary for the current period.
 * Returns summary KPIs, department summaries, and data freshness timestamp.
 */
export async function fetchFinancialSummary(
  _filters?: Partial<FinancialFilters>
): Promise<{
  summary: FinancialSummary;
  departmentSummaries: DepartmentFinancialSummary[];
  dataFreshness: string;
}> {
  await delay(600);

  return {
    summary: { ...MOCK_SUMMARY },
    departmentSummaries: MOCK_DEPARTMENT_SUMMARIES.map((d) => ({ ...d })),
    dataFreshness: new Date().toISOString(),
  };
}

/**
 * Fetch the revenue breakdown by component.
 * Returns individual revenue components along with totals and deltas.
 */
export async function fetchRevenueBreakdown(
  _filters?: Partial<FinancialFilters>
): Promise<{
  components: RevenueComponent[];
  totalCurrent: number;
  totalComparison: number;
  totalDelta: number;
}> {
  await delay(500);

  const components = MOCK_REVENUE_COMPONENTS.map((c) => ({ ...c }));
  const totalCurrent = components.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalComparison = components.reduce((sum, c) => sum + c.comparisonAmount, 0);

  return {
    components,
    totalCurrent,
    totalComparison,
    totalDelta: totalCurrent - totalComparison,
  };
}

/**
 * Fetch the cost breakdown by component.
 * Returns individual cost components along with totals and budget variance.
 */
export async function fetchCostBreakdown(
  _filters?: Partial<FinancialFilters>
): Promise<{
  components: CostComponent[];
  totalCost: number;
  totalBudget: number;
  budgetVariance: number;
}> {
  await delay(500);

  const components = MOCK_COST_COMPONENTS.map((c) => ({ ...c }));
  const totalCost = components.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalBudget = components.reduce((sum, c) => sum + (c.budgetAmount ?? 0), 0);

  return {
    components,
    totalCost,
    totalBudget,
    budgetVariance: totalCost - totalBudget,
  };
}

/**
 * Fetch variance records with optional pagination.
 * Returns sorted variances, a summary of counts by severity, and pagination info.
 */
export async function fetchVariances(
  _filters?: Partial<FinancialFilters>,
  page: number = 1,
  pageSize: number = 15
): Promise<{
  variances: VarianceRecord[];
  summary: {
    totalCount: number;
    criticalCount: number;
    significantCount: number;
    moderateCount: number;
    minorCount: number;
    favorableCount: number;
    unfavorableCount: number;
  };
  pagination: { page: number; pageSize: number; totalPages: number; totalItems: number };
}> {
  await delay(450);

  const sorted = sortVariancesByImpact(MOCK_VARIANCES);
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageItems = sorted.slice(startIndex, startIndex + pageSize);

  return {
    variances: pageItems.map((v) => ({ ...v, monthlyTrend: v.monthlyTrend.map((t) => ({ ...t })) })),
    summary: {
      totalCount: totalItems,
      criticalCount: sorted.filter((v) => v.severity === 'CRITICAL').length,
      significantCount: sorted.filter((v) => v.severity === 'SIGNIFICANT').length,
      moderateCount: sorted.filter((v) => v.severity === 'MODERATE').length,
      minorCount: sorted.filter((v) => v.severity === 'MINOR').length,
      favorableCount: sorted.filter((v) => v.direction === 'FAVORABLE').length,
      unfavorableCount: sorted.filter((v) => v.direction === 'UNFAVORABLE').length,
    },
    pagination: {
      page,
      pageSize,
      totalPages,
      totalItems,
    },
  };
}

/**
 * Kick off an asynchronous financial analysis job.
 * Returns a job ID and initial queued status. The job will simulate
 * transitioning through processing to completion after a short delay.
 */
export async function runFinancialAnalysis(
  _filters?: Partial<FinancialFilters>
): Promise<{ jobId: string; status: AnalysisJobStatus }> {
  await delay(300);

  const jobId = `job-${generateId()}`;
  analysisJobs.set(jobId, { status: 'queued', startedAt: Date.now() });

  // Simulate job progression: queued -> processing -> completed
  setTimeout(() => {
    const job = analysisJobs.get(jobId);
    if (job) {
      job.status = 'processing';
    }
  }, 1_500);

  setTimeout(() => {
    const job = analysisJobs.get(jobId);
    if (job) {
      job.status = 'completed';
    }
  }, 4_000);

  return { jobId, status: 'queued' };
}

/**
 * Fetch the result of a previously started analysis job.
 * Returns drivers and narrative once the job has completed,
 * or the current status if still in progress.
 */
export async function fetchAnalysisResult(
  jobId: string
): Promise<{
  drivers: FinancialDriverAnalysis | null;
  narrative: FinancialNarrative | null;
  status: AnalysisJobStatus;
}> {
  await delay(300);

  const job = analysisJobs.get(jobId);

  if (!job) {
    return { drivers: null, narrative: null, status: 'failed' };
  }

  if (job.status === 'completed') {
    return {
      drivers: { ...MOCK_DRIVER_ANALYSIS },
      narrative: { ...MOCK_NARRATIVE },
      status: 'completed',
    };
  }

  return {
    drivers: null,
    narrative: null,
    status: job.status,
  };
}

/**
 * Fetch detailed financials for a specific department.
 * Returns department summary, revenue and cost line items, and a 12-month trend.
 */
export async function fetchDepartmentDetail(
  departmentId: string,
  _filters?: Partial<FinancialFilters>
): Promise<{
  department: DepartmentFinancialSummary | null;
  revenueLines: RevenueComponent[];
  costLines: CostComponent[];
  monthlyTrend: { month: string; revenue: number; cost: number; margin: number }[];
}> {
  await delay(500);

  const department = MOCK_DEPARTMENT_SUMMARIES.find((d) => d.departmentId === departmentId) ?? null;

  if (!department) {
    return { department: null, revenueLines: [], costLines: [], monthlyTrend: [] };
  }

  // Build department-specific revenue lines from matching components
  const revenueLines = MOCK_REVENUE_COMPONENTS.filter(
    (c) => c.departmentId === departmentId
  ).map((c) => ({ ...c }));

  // Build department-specific cost lines (subset of department's total cost)
  const costLines: CostComponent[] = [
    {
      componentId: `${departmentId}-staffing`,
      name: 'Staffing',
      category: 'STAFFING',
      departmentId,
      departmentName: department.departmentName,
      currentAmount: Math.round(department.cost * 0.55),
      comparisonAmount: Math.round(department.cost * 0.55 * 0.92),
      delta: Math.round(department.cost * 0.55 * 0.08),
      deltaPercentage: 8.7,
      percentageOfTotal: 55.0,
      trend: 'RISING',
      trendPercentage: 8.7,
      budgetAmount: Math.round(department.cost * 0.52),
      budgetVariance: Math.round(department.cost * 0.03),
      budgetVariancePercentage: 5.8,
    },
    {
      componentId: `${departmentId}-supplies`,
      name: 'Supplies',
      category: 'SUPPLIES',
      departmentId,
      departmentName: department.departmentName,
      currentAmount: Math.round(department.cost * 0.25),
      comparisonAmount: Math.round(department.cost * 0.25 * 0.94),
      delta: Math.round(department.cost * 0.25 * 0.06),
      deltaPercentage: 6.4,
      percentageOfTotal: 25.0,
      trend: 'RISING',
      trendPercentage: 6.4,
      budgetAmount: Math.round(department.cost * 0.24),
      budgetVariance: Math.round(department.cost * 0.01),
      budgetVariancePercentage: 4.2,
    },
    {
      componentId: `${departmentId}-overhead`,
      name: 'Overhead & Other',
      category: 'OVERHEAD',
      departmentId,
      departmentName: department.departmentName,
      currentAmount: Math.round(department.cost * 0.20),
      comparisonAmount: Math.round(department.cost * 0.20 * 0.96),
      delta: Math.round(department.cost * 0.20 * 0.04),
      deltaPercentage: 4.2,
      percentageOfTotal: 20.0,
      trend: 'STABLE',
      trendPercentage: 4.2,
      budgetAmount: Math.round(department.cost * 0.19),
      budgetVariance: Math.round(department.cost * 0.01),
      budgetVariancePercentage: 5.3,
    },
  ];

  // Generate a 12-month trend for the department
  const months = [
    'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025',
    'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025',
    'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026',
  ];

  const baseMonthlyRevenue = department.revenue / 12;
  const baseMonthlyCost = department.cost / 12;

  const monthlyTrend = months.map((month, index) => {
    // Apply small seasonal variation
    const seasonalFactor = 1 + (Math.sin((index / 12) * Math.PI * 2) * 0.05);
    const revenue = Math.round(baseMonthlyRevenue * seasonalFactor);
    const cost = Math.round(baseMonthlyCost * (1 + (index * 0.003)));
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

    return {
      month,
      revenue,
      cost,
      margin: Math.round(margin * 10) / 10,
    };
  });

  return {
    department: { ...department },
    revenueLines,
    costLines,
    monthlyTrend,
  };
}
