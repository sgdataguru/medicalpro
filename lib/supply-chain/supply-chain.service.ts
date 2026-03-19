import type {
  InventoryItem,
  SupplyChainFilters,
  SupplyCategory,
  ProcurementRecommendation,
  ExpirationAlert,
  SupplyDemandForecast,
  CategoryForecast,
  DailyConsumptionForecast,
  ConsumptionAnomaly,
  ConsumptionTrendData,
} from './supply-chain.types';
import { calculateInventoryTotals, filterInventoryItems } from './supply-chain.utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// MOCK_INVENTORY — 20 realistic hospital supply items
// ---------------------------------------------------------------------------

const MOCK_INVENTORY: InventoryItem[] = [
  {
    itemId: 'inv-001',
    itemCode: 'DISP-SYR10',
    itemName: 'Syringe 10ml',
    category: 'DISPOSABLES',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    currentQuantity: 1200,
    unit: 'units',
    reorderPoint: 400,
    reorderQuantity: 2000,
    parLevel: 1500,
    dailyConsumptionRate: 80,
    weeklyConsumptionRate: 560,
    daysToStockout: 15,
    riskLevel: 'HEALTHY',
    unitCost: 0.35,
    totalValue: 420,
    supplierId: 'sup-medline',
    supplierName: 'Medline Industries',
    leadTimeDays: 3,
    minimumOrderQuantity: 500,
    lastOrderDate: daysAgo(10),
    lastReceivedDate: daysAgo(7),
    expirationDate: daysFromNow(540),
    daysToExpiration: 540,
    lotNumber: 'SYR-2025-0842',
    storageLocation: 'Central Supply Room A',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.08,
  },
  {
    itemId: 'inv-002',
    itemCode: 'MED-FENT50',
    itemName: 'Fentanyl 50mcg',
    category: 'MEDICATIONS',
    departmentId: 'dept-surg',
    departmentName: 'Surgery',
    currentQuantity: 48,
    unit: 'vials',
    reorderPoint: 40,
    reorderQuantity: 100,
    parLevel: 80,
    dailyConsumptionRate: 6,
    weeklyConsumptionRate: 42,
    daysToStockout: 8,
    riskLevel: 'WARNING',
    unitCost: 12.50,
    totalValue: 600,
    supplierId: 'sup-mckesson',
    supplierName: 'McKesson Pharmaceutical',
    leadTimeDays: 5,
    minimumOrderQuantity: 50,
    lastOrderDate: daysAgo(14),
    lastReceivedDate: daysAgo(9),
    expirationDate: daysFromNow(180),
    daysToExpiration: 180,
    lotNumber: 'FNT-2025-1190',
    storageLocation: 'Pharmacy Controlled Substance Vault',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.15,
  },
  {
    itemId: 'inv-003',
    itemCode: 'PPE-NITLG',
    itemName: 'Nitrile Gloves Large',
    category: 'PPE',
    departmentId: 'dept-all',
    departmentName: 'All Departments',
    currentQuantity: 240,
    unit: 'boxes',
    reorderPoint: 200,
    reorderQuantity: 500,
    parLevel: 600,
    dailyConsumptionRate: 150,
    weeklyConsumptionRate: 1050,
    daysToStockout: 1.6,
    riskLevel: 'CRITICAL',
    unitCost: 8.75,
    totalValue: 2100,
    supplierId: 'sup-cardinal',
    supplierName: 'Cardinal Health',
    leadTimeDays: 2,
    minimumOrderQuantity: 100,
    lastOrderDate: daysAgo(5),
    lastReceivedDate: daysAgo(3),
    expirationDate: daysFromNow(730),
    daysToExpiration: 730,
    lotNumber: 'NGL-2025-3341',
    storageLocation: 'Central Supply Room B',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.22,
  },
  {
    itemId: 'inv-004',
    itemCode: 'IMG-CTCON',
    itemName: 'CT Contrast Agent',
    category: 'IMAGING',
    departmentId: 'dept-rad',
    departmentName: 'Radiology',
    currentQuantity: 300,
    unit: 'bottles',
    reorderPoint: 100,
    reorderQuantity: 200,
    parLevel: 350,
    dailyConsumptionRate: 12,
    weeklyConsumptionRate: 84,
    daysToStockout: 25,
    riskLevel: 'HEALTHY',
    unitCost: 45.00,
    totalValue: 13500,
    supplierId: 'sup-ge-health',
    supplierName: 'GE Healthcare',
    leadTimeDays: 7,
    minimumOrderQuantity: 50,
    lastOrderDate: daysAgo(20),
    lastReceivedDate: daysAgo(13),
    expirationDate: daysFromNow(365),
    daysToExpiration: 365,
    lotNumber: 'CTC-2025-0217',
    storageLocation: 'Radiology Supply Cabinet',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.10,
  },
  {
    itemId: 'inv-005',
    itemCode: 'SURG-STPL',
    itemName: 'Surgical Stapler',
    category: 'SURGICAL',
    departmentId: 'dept-surg',
    departmentName: 'Surgery',
    currentQuantity: 85,
    unit: 'units',
    reorderPoint: 30,
    reorderQuantity: 60,
    parLevel: 100,
    dailyConsumptionRate: 3,
    weeklyConsumptionRate: 21,
    daysToStockout: 28,
    riskLevel: 'HEALTHY',
    unitCost: 125.00,
    totalValue: 10625,
    supplierId: 'sup-ethicon',
    supplierName: 'Ethicon (J&J)',
    leadTimeDays: 5,
    minimumOrderQuantity: 20,
    lastOrderDate: daysAgo(18),
    lastReceivedDate: daysAgo(13),
    expirationDate: daysFromNow(720),
    daysToExpiration: 720,
    lotNumber: 'SST-2025-0088',
    storageLocation: 'OR Supply Room 2',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.12,
  },
  {
    itemId: 'inv-006',
    itemCode: 'LAB-BGST',
    itemName: 'Blood Glucose Strips',
    category: 'LAB',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    currentQuantity: 500,
    unit: 'strips',
    reorderPoint: 400,
    reorderQuantity: 1000,
    parLevel: 800,
    dailyConsumptionRate: 45,
    weeklyConsumptionRate: 315,
    daysToStockout: 11,
    riskLevel: 'WARNING',
    unitCost: 0.85,
    totalValue: 425,
    supplierId: 'sup-abbott',
    supplierName: 'Abbott Laboratories',
    leadTimeDays: 4,
    minimumOrderQuantity: 500,
    lastOrderDate: daysAgo(12),
    lastReceivedDate: daysAgo(8),
    expirationDate: daysFromNow(210),
    daysToExpiration: 210,
    lotNumber: 'BGS-2025-4520',
    storageLocation: 'ICU Supply Station',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.14,
  },
  {
    itemId: 'inv-007',
    itemCode: 'EQUIP-IPMP',
    itemName: 'Infusion Pump Parts',
    category: 'EQUIPMENT',
    departmentId: 'dept-biomed',
    departmentName: 'Biomedical Engineering',
    currentQuantity: 12,
    unit: 'kits',
    reorderPoint: 5,
    reorderQuantity: 15,
    parLevel: 20,
    dailyConsumptionRate: 0.5,
    weeklyConsumptionRate: 3.5,
    daysToStockout: 24,
    riskLevel: 'HEALTHY',
    unitCost: 320.00,
    totalValue: 3840,
    supplierId: 'sup-baxter',
    supplierName: 'Baxter International',
    leadTimeDays: 14,
    minimumOrderQuantity: 5,
    lastOrderDate: daysAgo(30),
    lastReceivedDate: daysAgo(16),
    expirationDate: null,
    daysToExpiration: null,
    lotNumber: 'IPP-2025-0033',
    storageLocation: 'Biomedical Workshop',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.20,
  },
  {
    itemId: 'inv-008',
    itemCode: 'NUTR-ENTK',
    itemName: 'Enteral Nutrition Kit',
    category: 'NUTRITIONAL',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    currentQuantity: 60,
    unit: 'kits',
    reorderPoint: 50,
    reorderQuantity: 120,
    parLevel: 100,
    dailyConsumptionRate: 8,
    weeklyConsumptionRate: 56,
    daysToStockout: 7.5,
    riskLevel: 'WARNING',
    unitCost: 22.00,
    totalValue: 1320,
    supplierId: 'sup-nestle',
    supplierName: 'Nestle Health Science',
    leadTimeDays: 5,
    minimumOrderQuantity: 30,
    lastOrderDate: daysAgo(8),
    lastReceivedDate: daysAgo(3),
    expirationDate: daysFromNow(90),
    daysToExpiration: 90,
    lotNumber: 'ENK-2025-1102',
    storageLocation: 'Nutrition Services Room',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.11,
  },
  {
    itemId: 'inv-009',
    itemCode: 'MED-PROP200',
    itemName: 'Propofol 200mg',
    category: 'MEDICATIONS',
    departmentId: 'dept-surg',
    departmentName: 'Surgery',
    currentQuantity: 30,
    unit: 'vials',
    reorderPoint: 25,
    reorderQuantity: 80,
    parLevel: 60,
    dailyConsumptionRate: 4,
    weeklyConsumptionRate: 28,
    daysToStockout: 7.5,
    riskLevel: 'WARNING',
    unitCost: 18.00,
    totalValue: 540,
    supplierId: 'sup-fresenius',
    supplierName: 'Fresenius Kabi',
    leadTimeDays: 4,
    minimumOrderQuantity: 40,
    lastOrderDate: daysAgo(11),
    lastReceivedDate: daysAgo(7),
    expirationDate: daysFromNow(120),
    daysToExpiration: 120,
    lotNumber: 'PRO-2025-0741',
    storageLocation: 'Pharmacy Anesthesia Cabinet',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.18,
  },
  {
    itemId: 'inv-010',
    itemCode: 'PPE-N95',
    itemName: 'N95 Respirator',
    category: 'PPE',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    currentQuantity: 800,
    unit: 'masks',
    reorderPoint: 300,
    reorderQuantity: 1000,
    parLevel: 1200,
    dailyConsumptionRate: 40,
    weeklyConsumptionRate: 280,
    daysToStockout: 20,
    riskLevel: 'HEALTHY',
    unitCost: 2.50,
    totalValue: 2000,
    supplierId: 'sup-3m',
    supplierName: '3M Health Care',
    leadTimeDays: 5,
    minimumOrderQuantity: 200,
    lastOrderDate: daysAgo(15),
    lastReceivedDate: daysAgo(10),
    expirationDate: daysFromNow(1095),
    daysToExpiration: 1095,
    lotNumber: 'N95-2025-2201',
    storageLocation: 'PPE Storage Warehouse',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.09,
  },
  {
    itemId: 'inv-011',
    itemCode: 'DISP-GAZ44',
    itemName: 'Sterile Gauze 4x4',
    category: 'DISPOSABLES',
    departmentId: 'dept-surg',
    departmentName: 'Surgery',
    currentQuantity: 3000,
    unit: 'packs',
    reorderPoint: 1000,
    reorderQuantity: 5000,
    parLevel: 4000,
    dailyConsumptionRate: 100,
    weeklyConsumptionRate: 700,
    daysToStockout: 30,
    riskLevel: 'HEALTHY',
    unitCost: 0.60,
    totalValue: 1800,
    supplierId: 'sup-medline',
    supplierName: 'Medline Industries',
    leadTimeDays: 3,
    minimumOrderQuantity: 1000,
    lastOrderDate: daysAgo(6),
    lastReceivedDate: daysAgo(3),
    expirationDate: daysFromNow(900),
    daysToExpiration: 900,
    lotNumber: 'GAZ-2025-5508',
    storageLocation: 'Central Supply Room A',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.06,
  },
  {
    itemId: 'inv-012',
    itemCode: 'MED-VANC1G',
    itemName: 'Vancomycin 1g',
    category: 'MEDICATIONS',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    currentQuantity: 22,
    unit: 'vials',
    reorderPoint: 20,
    reorderQuantity: 60,
    parLevel: 40,
    dailyConsumptionRate: 3,
    weeklyConsumptionRate: 21,
    daysToStockout: 7.3,
    riskLevel: 'WARNING',
    unitCost: 28.00,
    totalValue: 616,
    supplierId: 'sup-pfizer',
    supplierName: 'Pfizer Inc.',
    leadTimeDays: 4,
    minimumOrderQuantity: 24,
    lastOrderDate: daysAgo(9),
    lastReceivedDate: daysAgo(5),
    expirationDate: daysFromNow(150),
    daysToExpiration: 150,
    lotNumber: 'VAN-2025-0399',
    storageLocation: 'Pharmacy Main',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.16,
  },
  {
    itemId: 'inv-013',
    itemCode: 'DISP-O2TUB',
    itemName: 'Oxygen Tubing',
    category: 'DISPOSABLES',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    currentQuantity: 400,
    unit: 'units',
    reorderPoint: 150,
    reorderQuantity: 500,
    parLevel: 500,
    dailyConsumptionRate: 25,
    weeklyConsumptionRate: 175,
    daysToStockout: 16,
    riskLevel: 'HEALTHY',
    unitCost: 3.20,
    totalValue: 1280,
    supplierId: 'sup-cardinal',
    supplierName: 'Cardinal Health',
    leadTimeDays: 3,
    minimumOrderQuantity: 100,
    lastOrderDate: daysAgo(7),
    lastReceivedDate: daysAgo(4),
    expirationDate: null,
    daysToExpiration: null,
    lotNumber: 'O2T-2025-1487',
    storageLocation: 'Respiratory Therapy Supply',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.07,
  },
  {
    itemId: 'inv-014',
    itemCode: 'SURG-SUT30',
    itemName: 'Suture Kit 3-0',
    category: 'SURGICAL',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    currentQuantity: 150,
    unit: 'kits',
    reorderPoint: 50,
    reorderQuantity: 200,
    parLevel: 200,
    dailyConsumptionRate: 12,
    weeklyConsumptionRate: 84,
    daysToStockout: 12.5,
    riskLevel: 'HEALTHY',
    unitCost: 15.00,
    totalValue: 2250,
    supplierId: 'sup-ethicon',
    supplierName: 'Ethicon (J&J)',
    leadTimeDays: 4,
    minimumOrderQuantity: 50,
    lastOrderDate: daysAgo(14),
    lastReceivedDate: daysAgo(10),
    expirationDate: daysFromNow(600),
    daysToExpiration: 600,
    lotNumber: 'SUT-2025-0622',
    storageLocation: 'ER Procedure Room Cabinet',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.13,
  },
  {
    itemId: 'inv-015',
    itemCode: 'IMG-USGEL',
    itemName: 'Ultrasound Gel',
    category: 'IMAGING',
    departmentId: 'dept-card',
    departmentName: 'Cardiology',
    currentQuantity: 45,
    unit: 'bottles',
    reorderPoint: 30,
    reorderQuantity: 60,
    parLevel: 60,
    dailyConsumptionRate: 5,
    weeklyConsumptionRate: 35,
    daysToStockout: 9,
    riskLevel: 'WARNING',
    unitCost: 6.50,
    totalValue: 292.5,
    supplierId: 'sup-parker',
    supplierName: 'Parker Laboratories',
    leadTimeDays: 3,
    minimumOrderQuantity: 24,
    lastOrderDate: daysAgo(16),
    lastReceivedDate: daysAgo(13),
    expirationDate: daysFromNow(270),
    daysToExpiration: 270,
    lotNumber: 'USG-2025-1830',
    storageLocation: 'Cardiology Echo Lab',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.09,
  },
  {
    itemId: 'inv-016',
    itemCode: 'DISP-IVC20',
    itemName: 'IV Catheter 20g',
    category: 'DISPOSABLES',
    departmentId: 'dept-er',
    departmentName: 'Emergency',
    currentQuantity: 600,
    unit: 'units',
    reorderPoint: 500,
    reorderQuantity: 1500,
    parLevel: 1200,
    dailyConsumptionRate: 85,
    weeklyConsumptionRate: 595,
    daysToStockout: 7,
    riskLevel: 'WARNING',
    unitCost: 1.80,
    totalValue: 1080,
    supplierId: 'sup-bd',
    supplierName: 'Becton Dickinson',
    leadTimeDays: 3,
    minimumOrderQuantity: 500,
    lastOrderDate: daysAgo(4),
    lastReceivedDate: daysAgo(1),
    expirationDate: daysFromNow(450),
    daysToExpiration: 450,
    lotNumber: 'IVC-2025-2910',
    storageLocation: 'ER Supply Station',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.17,
  },
  {
    itemId: 'inv-017',
    itemCode: 'LAB-HGBT',
    itemName: 'Hemoglobin Test Kit',
    category: 'LAB',
    departmentId: 'dept-path',
    departmentName: 'Pathology',
    currentQuantity: 200,
    unit: 'kits',
    reorderPoint: 150,
    reorderQuantity: 300,
    parLevel: 250,
    dailyConsumptionRate: 30,
    weeklyConsumptionRate: 210,
    daysToStockout: 6.7,
    riskLevel: 'WARNING',
    unitCost: 4.50,
    totalValue: 900,
    supplierId: 'sup-siemens',
    supplierName: 'Siemens Healthineers',
    leadTimeDays: 5,
    minimumOrderQuantity: 100,
    lastOrderDate: daysAgo(11),
    lastReceivedDate: daysAgo(6),
    expirationDate: daysFromNow(60),
    daysToExpiration: 60,
    lotNumber: 'HGB-2025-0998',
    storageLocation: 'Pathology Lab Supply',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.10,
  },
  {
    itemId: 'inv-018',
    itemCode: 'EQUIP-VCIR',
    itemName: 'Ventilator Circuit',
    category: 'EQUIPMENT',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    currentQuantity: 8,
    unit: 'sets',
    reorderPoint: 6,
    reorderQuantity: 20,
    parLevel: 15,
    dailyConsumptionRate: 1,
    weeklyConsumptionRate: 7,
    daysToStockout: 8,
    riskLevel: 'WARNING',
    unitCost: 85.00,
    totalValue: 680,
    supplierId: 'sup-hamilton',
    supplierName: 'Hamilton Medical',
    leadTimeDays: 7,
    minimumOrderQuantity: 10,
    lastOrderDate: daysAgo(21),
    lastReceivedDate: daysAgo(14),
    expirationDate: null,
    daysToExpiration: null,
    lotNumber: 'VCR-2025-0142',
    storageLocation: 'ICU Equipment Room',
    consumptionTrend: 'RISING',
    consumptionVariance: 0.25,
  },
  {
    itemId: 'inv-019',
    itemCode: 'NUTR-PARN',
    itemName: 'Parenteral Nutrition',
    category: 'NUTRITIONAL',
    departmentId: 'dept-onco',
    departmentName: 'Oncology',
    currentQuantity: 40,
    unit: 'bags',
    reorderPoint: 20,
    reorderQuantity: 60,
    parLevel: 50,
    dailyConsumptionRate: 3,
    weeklyConsumptionRate: 21,
    daysToStockout: 13.3,
    riskLevel: 'HEALTHY',
    unitCost: 75.00,
    totalValue: 3000,
    supplierId: 'sup-baxter',
    supplierName: 'Baxter International',
    leadTimeDays: 5,
    minimumOrderQuantity: 20,
    lastOrderDate: daysAgo(13),
    lastReceivedDate: daysAgo(8),
    expirationDate: daysFromNow(25),
    daysToExpiration: 25,
    lotNumber: 'TPN-2025-0453',
    storageLocation: 'Pharmacy Refrigerator 3',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.11,
  },
  {
    itemId: 'inv-020',
    itemCode: 'SURG-BCEM',
    itemName: 'Bone Cement',
    category: 'SURGICAL',
    departmentId: 'dept-ortho',
    departmentName: 'Orthopedics',
    currentQuantity: 18,
    unit: 'units',
    reorderPoint: 8,
    reorderQuantity: 24,
    parLevel: 25,
    dailyConsumptionRate: 0.8,
    weeklyConsumptionRate: 5.6,
    daysToStockout: 22.5,
    riskLevel: 'HEALTHY',
    unitCost: 210.00,
    totalValue: 3780,
    supplierId: 'sup-stryker',
    supplierName: 'Stryker Corporation',
    leadTimeDays: 7,
    minimumOrderQuantity: 6,
    lastOrderDate: daysAgo(25),
    lastReceivedDate: daysAgo(18),
    expirationDate: daysFromNow(480),
    daysToExpiration: 480,
    lotNumber: 'BCM-2025-0071',
    storageLocation: 'OR Supply Room 3',
    consumptionTrend: 'STABLE',
    consumptionVariance: 0.19,
  },
];

// ---------------------------------------------------------------------------
// MOCK_RECOMMENDATIONS — 4 procurement recommendations
// ---------------------------------------------------------------------------

const MOCK_RECOMMENDATIONS: ProcurementRecommendation[] = [
  {
    recommendationId: 'proc-001',
    priority: 'CRITICAL',
    type: 'REORDER',
    itemId: 'inv-003',
    itemCode: 'PPE-NITLG',
    itemName: 'Nitrile Gloves Large',
    category: 'PPE',
    description: 'Increase reorder point from 200 to 450 boxes and place emergency order immediately',
    rationale:
      'Current stock covers only 1.6 days at current consumption of 150 boxes/day. Lead time is 2 days — stockout is imminent. Consumption has risen 22% over the past 2 weeks due to flu season surge. Raising the reorder point prevents recurrence.',
    currentValue: 200,
    recommendedValue: 450,
    stockoutRiskReduction: {
      currentRisk: 0.85,
      projectedRisk: 0.10,
    },
    supplierInfo: {
      supplierId: 'sup-cardinal',
      supplierName: 'Cardinal Health',
      unitPrice: 8.75,
      leadTimeDays: 2,
      minimumOrderQuantity: 100,
    },
    suggestedOrderDetails: {
      quantity: 800,
      estimatedCost: 7000,
      estimatedDeliveryDate: daysFromNow(2),
    },
    costImpact: {
      currentAnnualCost: 478_125,
      projectedAnnualCost: 470_000,
      savings: 8_000,
      savingsPercentage: 0.017,
    },
    status: 'PENDING',
  },
  {
    recommendationId: 'proc-002',
    priority: 'HIGH',
    type: 'CONSOLIDATE_ORDERS',
    itemId: 'inv-001',
    itemCode: 'DISP-SYR10',
    itemName: 'Syringe 10ml',
    category: 'DISPOSABLES',
    description: 'Consolidate weekly syringe orders into a single monthly order of 10,000 units',
    rationale:
      'Currently placing 4 separate weekly orders of 2,000-2,500 units averaging $875 each. Consolidating to a monthly order qualifies for Medline\'s volume tier pricing at $0.31/unit (down from $0.35), with free freight on orders over 8,000 units. Reduces PO processing overhead by 75%.',
    currentValue: 400,
    recommendedValue: 800,
    stockoutRiskReduction: {
      currentRisk: 0.20,
      projectedRisk: 0.05,
    },
    supplierInfo: {
      supplierId: 'sup-medline',
      supplierName: 'Medline Industries',
      unitPrice: 0.31,
      leadTimeDays: 3,
      minimumOrderQuantity: 500,
    },
    suggestedOrderDetails: {
      quantity: 10000,
      estimatedCost: 3100,
      estimatedDeliveryDate: daysFromNow(3),
    },
    costImpact: {
      currentAnnualCost: 10_220,
      projectedAnnualCost: 8_994,
      savings: 1_226,
      savingsPercentage: 0.12,
    },
    status: 'PENDING',
  },
  {
    recommendationId: 'proc-003',
    priority: 'MEDIUM',
    type: 'SWITCH_SUPPLIER',
    itemId: 'inv-004',
    itemCode: 'IMG-CTCON',
    itemName: 'CT Contrast Agent',
    category: 'IMAGING',
    description: 'Switch CT Contrast Agent procurement to GPO-preferred supplier Bracco Diagnostics',
    rationale:
      'Current supplier GE Healthcare charges $45/bottle. GPO contract with Bracco Diagnostics offers equivalent iodinated contrast at $36.90/bottle — an 18% reduction. Bracco product is FDA-approved and clinically equivalent. Three peer hospitals in the network have switched with no adverse outcomes. Annual consumption of ~4,380 bottles.',
    currentValue: 100,
    recommendedValue: 100,
    stockoutRiskReduction: {
      currentRisk: 0.10,
      projectedRisk: 0.08,
    },
    supplierInfo: {
      supplierId: 'sup-bracco',
      supplierName: 'Bracco Diagnostics',
      unitPrice: 36.90,
      leadTimeDays: 7,
      minimumOrderQuantity: 50,
    },
    suggestedOrderDetails: {
      quantity: 200,
      estimatedCost: 7380,
      estimatedDeliveryDate: daysFromNow(7),
    },
    costImpact: {
      currentAnnualCost: 197_100,
      projectedAnnualCost: 161_622,
      savings: 35_478,
      savingsPercentage: 0.18,
    },
    status: 'PENDING',
  },
  {
    recommendationId: 'proc-004',
    priority: 'LOW',
    type: 'BULK_DISCOUNT',
    itemId: 'inv-011',
    itemCode: 'DISP-GAZ44',
    itemName: 'Sterile Gauze 4x4',
    category: 'DISPOSABLES',
    description: 'Negotiate quarterly bulk order of 25,000 packs of sterile gauze for 8% discount',
    rationale:
      'Annual consumption is approximately 36,500 packs. Current pricing at $0.60/pack with monthly orders of ~3,000. Medline offers $0.552/pack for quarterly commitments of 9,000+ packs. Storage capacity in Central Supply Room A can accommodate the larger deliveries. Estimated annual savings of $1,752.',
    currentValue: 1000,
    recommendedValue: 1500,
    stockoutRiskReduction: {
      currentRisk: 0.05,
      projectedRisk: 0.03,
    },
    supplierInfo: {
      supplierId: 'sup-medline',
      supplierName: 'Medline Industries',
      unitPrice: 0.552,
      leadTimeDays: 3,
      minimumOrderQuantity: 1000,
    },
    suggestedOrderDetails: {
      quantity: 9000,
      estimatedCost: 4968,
      estimatedDeliveryDate: daysFromNow(3),
    },
    costImpact: {
      currentAnnualCost: 21_900,
      projectedAnnualCost: 20_148,
      savings: 1_752,
      savingsPercentage: 0.08,
    },
    status: 'PENDING',
  },
];

// ---------------------------------------------------------------------------
// MOCK_EXPIRATION_ALERTS — 5 expiration alerts
// ---------------------------------------------------------------------------

const MOCK_EXPIRATION_ALERTS: ExpirationAlert[] = [
  {
    alertId: 'exp-001',
    itemId: 'inv-009',
    itemCode: 'MED-PROP200',
    itemName: 'Propofol 200mg',
    category: 'MEDICATIONS',
    lotNumber: 'PRO-2025-0741',
    expirationDate: daysFromNow(5),
    daysToExpiration: 5,
    quantity: 10,
    valueAtRisk: 180,
    severity: 'CRITICAL',
    storageLocation: 'Pharmacy Anesthesia Cabinet',
    departmentId: 'dept-surg',
    departmentName: 'Surgery',
    suggestedAction: 'TRANSFER',
    actionTaken: 'NONE',
  },
  {
    alertId: 'exp-002',
    itemId: 'inv-012',
    itemCode: 'MED-VANC1G',
    itemName: 'Vancomycin 1g',
    category: 'MEDICATIONS',
    lotNumber: 'VAN-2025-0388',
    expirationDate: daysFromNow(12),
    daysToExpiration: 12,
    quantity: 8,
    valueAtRisk: 224,
    severity: 'WARNING',
    storageLocation: 'Pharmacy Main',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    suggestedAction: 'USE_FIRST',
    actionTaken: 'NONE',
  },
  {
    alertId: 'exp-003',
    itemId: 'inv-019',
    itemCode: 'NUTR-PARN',
    itemName: 'Parenteral Nutrition',
    category: 'NUTRITIONAL',
    lotNumber: 'TPN-2025-0440',
    expirationDate: daysFromNow(18),
    daysToExpiration: 18,
    quantity: 15,
    valueAtRisk: 1125,
    severity: 'WARNING',
    storageLocation: 'Pharmacy Refrigerator 3',
    departmentId: 'dept-onco',
    departmentName: 'Oncology',
    suggestedAction: 'TRANSFER',
    actionTaken: 'NONE',
  },
  {
    alertId: 'exp-004',
    itemId: 'inv-006',
    itemCode: 'LAB-BGST',
    itemName: 'Blood Glucose Strips',
    category: 'LAB',
    lotNumber: 'BGS-2025-4499',
    expirationDate: daysFromNow(28),
    daysToExpiration: 28,
    quantity: 120,
    valueAtRisk: 102,
    severity: 'WARNING',
    storageLocation: 'ICU Supply Station',
    departmentId: 'dept-icu',
    departmentName: 'ICU',
    suggestedAction: 'USE_FIRST',
    actionTaken: 'NONE',
  },
  {
    alertId: 'exp-005',
    itemId: 'inv-017',
    itemCode: 'LAB-HGBT',
    itemName: 'Hemoglobin Test Kit',
    category: 'LAB',
    lotNumber: 'HGB-2025-0980',
    expirationDate: daysFromNow(45),
    daysToExpiration: 45,
    quantity: 50,
    valueAtRisk: 225,
    severity: 'INFO',
    storageLocation: 'Pathology Lab Supply',
    departmentId: 'dept-path',
    departmentName: 'Pathology',
    suggestedAction: 'USE_FIRST',
    actionTaken: 'NONE',
  },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

export async function fetchInventory(filters?: SupplyChainFilters) {
  await delay(350);

  const items = filters ? filterInventoryItems(MOCK_INVENTORY, filters) : MOCK_INVENTORY;
  const totals = calculateInventoryTotals(items);

  return {
    items,
    totals,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function fetchRecommendations() {
  await delay(300);

  const recommendations = [...MOCK_RECOMMENDATIONS];
  const summary = {
    total: recommendations.length,
    byPriority: {
      CRITICAL: recommendations.filter(r => r.priority === 'CRITICAL').length,
      HIGH: recommendations.filter(r => r.priority === 'HIGH').length,
      MEDIUM: recommendations.filter(r => r.priority === 'MEDIUM').length,
      LOW: recommendations.filter(r => r.priority === 'LOW').length,
    },
    totalPotentialSavings: recommendations.reduce((sum, r) => sum + r.costImpact.savings, 0),
    pendingCount: recommendations.filter(r => r.status === 'PENDING').length,
  };

  return { recommendations, summary };
}

export async function updateRecommendation(
  id: string,
  status: 'APPROVED' | 'ADJUSTED' | 'DISMISSED',
  adjustedQuantity?: number,
  dismissalReason?: string,
) {
  await delay(400);

  const rec = MOCK_RECOMMENDATIONS.find(r => r.recommendationId === id);
  if (!rec) throw new Error(`Recommendation ${id} not found`);

  const updated: ProcurementRecommendation = {
    ...rec,
    status,
    ...(adjustedQuantity !== undefined && { adjustedQuantity }),
    ...(dismissalReason !== undefined && { dismissalReason }),
  };

  return updated;
}

export async function fetchExpirationAlerts(windowDays?: number) {
  await delay(250);

  const window = windowDays ?? 90;
  const alerts = MOCK_EXPIRATION_ALERTS.filter(a => a.daysToExpiration <= window);

  const summary = {
    total: alerts.length,
    bySeverity: {
      CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
      WARNING: alerts.filter(a => a.severity === 'WARNING').length,
      INFO: alerts.filter(a => a.severity === 'INFO').length,
    },
    totalValueAtRisk: alerts.reduce((sum, a) => sum + a.valueAtRisk, 0),
    totalUnitsAtRisk: alerts.reduce((sum, a) => sum + a.quantity, 0),
  };

  return { alerts, summary };
}

export async function takeExpirationAction(
  id: string,
  action: 'USE_FIRST' | 'TRANSFER' | 'RETURN_TO_SUPPLIER' | 'DISPOSE',
  targetDepartmentId?: string,
) {
  await delay(400);

  const alert = MOCK_EXPIRATION_ALERTS.find(a => a.alertId === id);
  if (!alert) throw new Error(`Expiration alert ${id} not found`);

  const actionTakenMap: Record<string, 'PRIORITIZED' | 'TRANSFERRED' | 'RETURNED' | 'DISPOSED'> = {
    USE_FIRST: 'PRIORITIZED',
    TRANSFER: 'TRANSFERRED',
    RETURN_TO_SUPPLIER: 'RETURNED',
    DISPOSE: 'DISPOSED',
  };

  const updated: ExpirationAlert = {
    ...alert,
    suggestedAction: action,
    actionTaken: actionTakenMap[action],
  };

  return updated;
}

export async function runDemandForecast(
  categories: string[],
  horizonDays: number,
): Promise<SupplyDemandForecast> {
  await delay(1500);

  const now = new Date();

  const categoryForecasts: CategoryForecast[] = categories.map(category => {
    const categoryItems = MOCK_INVENTORY.filter(i => i.category === category);
    const baseDaily = categoryItems.reduce((s, i) => s + i.dailyConsumptionRate, 0);

    const dailyForecasts: DailyConsumptionForecast[] = Array.from({ length: horizonDays }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i + 1);

      const dayOfWeek = date.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 1.0;
      const trendFactor = 1 + i * 0.002;
      const noise = 1 + (Math.random() - 0.5) * 0.15;
      const predicted = Math.round(baseDaily * weekendFactor * trendFactor * noise * 10) / 10;

      return {
        date: date.toISOString().split('T')[0],
        predictedConsumption: predicted,
        confidenceInterval: {
          lower: Math.round(predicted * 0.85 * 10) / 10,
          upper: Math.round(predicted * 1.15 * 10) / 10,
        },
        driverFactors: {
          patientVolume: Math.round(80 + Math.random() * 40),
          scheduledProcedures: Math.round(10 + Math.random() * 15),
          seasonalFactor: weekendFactor * trendFactor,
        },
      };
    });

    return {
      category: category as SupplyCategory,
      dailyForecasts,
    };
  });

  // Collect anomalies
  const anomalies: ConsumptionAnomaly[] = [];
  let anomalyIdx = 0;
  categoryForecasts.forEach(cf => {
    const catItems = MOCK_INVENTORY.filter(i => i.category === cf.category);
    const baseline = catItems.reduce((s, i) => s + i.dailyConsumptionRate, 0);
    cf.dailyForecasts
      .filter(df => {
        const deviation = Math.abs(df.predictedConsumption - baseline) / baseline;
        return deviation > 0.06;
      })
      .slice(0, 2)
      .forEach(df => {
        const deviation = (df.predictedConsumption - baseline) / baseline;
        const item = catItems[0];
        anomalies.push({
          anomalyId: `anom-${++anomalyIdx}`,
          itemId: item?.itemId ?? 'unknown',
          itemName: item?.itemName ?? cf.category,
          detectedDate: df.date,
          type: deviation > 0 ? 'SPIKE' : 'DROP',
          severity: Math.abs(deviation) > 0.1 ? 'HIGH' : 'MEDIUM',
          description: `Unusual ${deviation > 0 ? 'spike' : 'drop'} in ${cf.category} demand — ${Math.abs(Math.round(deviation * 100))}% ${deviation > 0 ? 'above' : 'below'} baseline`,
          expectedValue: Math.round(baseline * 10) / 10,
          actualValue: df.predictedConsumption,
          deviationPercentage: Math.round(deviation * 1000) / 10,
        });
      });
  });

  return {
    forecastId: `fc-sc-${Date.now()}`,
    generatedAt: now.toISOString(),
    horizonDays,
    confidence: 0.82,
    modelVersion: '1.0.0',
    categoryForecasts,
    anomalies: anomalies.slice(0, 5),
  };
}

export async function fetchConsumptionTrends(
  categories: string[],
  period: '7d' | '14d' | '30d',
): Promise<{ trends: ConsumptionTrendData[]; anomalies: ConsumptionAnomaly[] }> {
  await delay(400);

  const days = period === '30d' ? 30 : period === '14d' ? 14 : 7;
  const now = new Date();

  const allAnomalies: ConsumptionAnomaly[] = [];
  let anomalyIdx = 0;

  const trends: ConsumptionTrendData[] = categories.map(category => {
    const categoryItems = MOCK_INVENTORY.filter(i => i.category === category);
    const baseDaily = categoryItems.reduce((s, i) => s + i.dailyConsumptionRate, 0);
    const avgUnitCost = categoryItems.length > 0
      ? categoryItems.reduce((s, i) => s + i.unitCost, 0) / categoryItems.length
      : 1;

    const dataPoints = Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));

      const dayOfWeek = date.getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.78 : 1.0;
      const noise = 1 + (Math.random() - 0.5) * 0.12;
      const actual = Math.round(baseDaily * weekendFactor * noise * 10) / 10;
      const predicted = Math.round(baseDaily * weekendFactor * 10) / 10;

      const deviation = Math.abs(actual - predicted) / predicted;
      if (deviation > 0.05) {
        const item = categoryItems[0];
        allAnomalies.push({
          anomalyId: `trend-anom-${++anomalyIdx}`,
          itemId: item?.itemId ?? 'unknown',
          itemName: item?.itemName ?? category,
          detectedDate: date.toISOString().split('T')[0],
          type: actual > predicted ? 'SPIKE' : 'DROP',
          severity: deviation > 0.08 ? 'HIGH' : 'MEDIUM',
          description: `${actual > predicted ? 'Higher' : 'Lower'} than expected ${category} consumption`,
          expectedValue: predicted,
          actualValue: actual,
          deviationPercentage: Math.round(deviation * 1000) / 10,
        });
      }

      return {
        date: date.toISOString().split('T')[0],
        actualConsumption: actual,
        predictedConsumption: predicted,
        cost: Math.round(actual * avgUnitCost * 100) / 100,
      };
    });

    return {
      category: category as SupplyCategory,
      dataPoints,
    };
  });

  return { trends, anomalies: allAnomalies.slice(0, 8) };
}
