import type {
  AnomalyAlert,
  AnomalyStats,
  AnomalyTrendDataPoint,
  AnomalyPattern,
  InvestigationNote,
  AnomalyFilterState,
} from './anomaly.types';
import { format, subDays, subHours, subMinutes } from 'date-fns';

const now = new Date();

const MOCK_ALERTS: AnomalyAlert[] = [
  {
    id: 'ANM-001',
    title: 'Patient DOB after admission date',
    description: 'Patient record P-4821 has date of birth (2025-03-01) recorded after admission date (2024-12-15). Data quality issue detected in staffing module patient records.',
    severity: 'critical',
    status: 'active',
    module: 'staffing',
    detectedAt: subMinutes(now, 2).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'patient.date_of_birth', operator: 'gt', expectedValue: '< admission_date', actualValue: '2025-03-01', dataSource: 'staffing.patient_records', recordId: 'P-4821' },
      { field: 'patient.admission_date', operator: 'lt', expectedValue: '> date_of_birth', actualValue: '2024-12-15', dataSource: 'staffing.patient_records', recordId: 'P-4821' },
    ],
    affectedModules: ['staffing', 'bed-allocation'],
    context: {
      summary: 'Patient record P-4821 has DOB 2025-03-01 but admission date 2024-12-15. This is a data entry error that affects patient age calculations, staffing ratio compliance, and bed allocation algorithms.',
      rootCauseHypothesis: 'Likely manual data entry error during patient registration. The year 2025 was entered instead of 1925 or similar birth year.',
      recommendedActions: ['Verify patient DOB with admissions department', 'Correct the record in the source system', 'Re-run affected staffing ratio calculations'],
      relatedAnomalyIds: ['ANM-008'],
      impactAssessment: { affectedPatients: 1, financialImpact: null, operationalRisk: 'medium' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-001', anomalyId: 'ANM-001', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subMinutes(now, 2).toISOString(), metadata: { detectionRule: 'DOB_AFTER_ADMISSION' } }],
  },
  {
    id: 'ANM-002',
    title: 'Emergency department overtime spike +40%',
    description: 'Overtime hours in the Emergency Department have increased 40% over the rolling 7-day average. Current weekly overtime: 284 hours vs. 203 hours average.',
    severity: 'critical',
    status: 'active',
    module: 'finance',
    detectedAt: subMinutes(now, 15).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'department.overtime_hours', operator: 'deviation', expectedValue: 203, actualValue: 284, dataSource: 'staffing.overtime_records', recordId: 'DEPT-ER-W03' },
      { field: 'department.overtime_cost', operator: 'threshold', expectedValue: 42000, actualValue: 58800, dataSource: 'finance.labor_costs', recordId: 'LC-ER-W03' },
    ],
    affectedModules: ['finance', 'staffing'],
    context: {
      summary: 'Emergency Department overtime has spiked 40% above the 7-day rolling average, translating to an additional $16,800 in weekly labor costs. This coincides with a 22% increase in ER patient volume.',
      rootCauseHypothesis: 'Seasonal flu surge has driven higher patient volumes in the ER. Current staffing levels are insufficient, forcing existing staff into overtime. Two nursing positions remain unfilled.',
      recommendedActions: ['Review ER staffing levels against current patient volume', 'Consider temporary agency nursing to reduce overtime dependency', 'Evaluate cost-benefit of adding a night shift nurse'],
      relatedAnomalyIds: ['ANM-005'],
      impactAssessment: { affectedPatients: 0, financialImpact: 16800, operationalRisk: 'high' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-002', anomalyId: 'ANM-002', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subMinutes(now, 15).toISOString(), metadata: { detectionRule: 'OVERTIME_DEVIATION' } }],
  },
  {
    id: 'ANM-003',
    title: 'Bed turnover time exceeds threshold in ICU',
    description: 'Average bed turnover time in ICU has increased to 6.8 hours, exceeding the 4-hour target by 70%. This impacts bed availability and downstream admissions.',
    severity: 'warning',
    status: 'acknowledged',
    module: 'bed-allocation',
    detectedAt: subHours(now, 1).toISOString(),
    acknowledgedAt: subMinutes(now, 30).toISOString(),
    resolvedAt: null,
    triggeredBy: [
      { field: 'ward.avg_turnover_hours', operator: 'gt', expectedValue: 4, actualValue: 6.8, dataSource: 'beds.turnover_metrics', recordId: 'WARD-ICU-D12' },
    ],
    affectedModules: ['bed-allocation'],
    context: {
      summary: 'ICU bed turnover time has risen to 6.8 hours, 70% above the 4-hour target. This is causing downstream delays in surgical admissions and ER transfers to ICU.',
      rootCauseHypothesis: 'Environmental services staffing gap during the 7AM-3PM shift is delaying bed cleaning. Two EVS staff members are on leave, and replacements have not been assigned.',
      recommendedActions: ['Assign temporary EVS staff to ICU during peak turnover hours', 'Review discharge planning process for bottlenecks', 'Coordinate with surgical scheduling to adjust admission timing'],
      relatedAnomalyIds: [],
      impactAssessment: { affectedPatients: 12, financialImpact: 8400, operationalRisk: 'medium' },
    },
    assignedTo: 'USR-042',
    auditTrail: [
      { id: 'AUD-003', anomalyId: 'ANM-003', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 1).toISOString(), metadata: { detectionRule: 'TURNOVER_THRESHOLD' } },
      { id: 'AUD-004', anomalyId: 'ANM-003', action: 'acknowledged', actorId: 'USR-042', actorName: 'Dr. Sarah Chen', timestamp: subMinutes(now, 30).toISOString(), metadata: {} },
    ],
  },
  {
    id: 'ANM-004',
    title: 'Surgical supply reorder frequency anomaly',
    description: 'Sterile surgical kits reorder frequency has increased from bi-weekly to every 4 days over the past 3 weeks. Consumption rate 2.5x above baseline.',
    severity: 'warning',
    status: 'investigating',
    module: 'supply-chain',
    detectedAt: subHours(now, 3).toISOString(),
    acknowledgedAt: subHours(now, 2).toISOString(),
    resolvedAt: null,
    triggeredBy: [
      { field: 'item.reorder_frequency_days', operator: 'lt', expectedValue: 14, actualValue: 4, dataSource: 'supply_chain.reorder_history', recordId: 'SKU-SSK-001' },
      { field: 'item.consumption_rate', operator: 'deviation', expectedValue: 120, actualValue: 300, dataSource: 'supply_chain.consumption', recordId: 'SKU-SSK-001' },
    ],
    affectedModules: ['supply-chain', 'finance'],
    context: {
      summary: 'Sterile surgical kit consumption has spiked 2.5x above normal, driving reorders every 4 days instead of bi-weekly. This represents approximately $45,000 in additional monthly supply costs.',
      rootCauseHypothesis: 'Increased surgical volume from the new orthopedic surgery program launched 3 weeks ago. Additionally, a recent supplier quality issue caused a batch recall, depleting buffer stock.',
      recommendedActions: ['Adjust par levels for surgical kits to match new surgical volume', 'Negotiate volume discount with supplier given increased demand', 'Review if batch recall stock has been fully replenished'],
      relatedAnomalyIds: ['ANM-007'],
      impactAssessment: { affectedPatients: 0, financialImpact: 45000, operationalRisk: 'medium' },
    },
    assignedTo: 'USR-015',
    auditTrail: [
      { id: 'AUD-005', anomalyId: 'ANM-004', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 3).toISOString(), metadata: { detectionRule: 'REORDER_FREQUENCY_DEVIATION' } },
      { id: 'AUD-006', anomalyId: 'ANM-004', action: 'acknowledged', actorId: 'USR-015', actorName: 'Mark Johnson', timestamp: subHours(now, 2).toISOString(), metadata: {} },
      { id: 'AUD-007', anomalyId: 'ANM-004', action: 'investigation_started', actorId: 'USR-015', actorName: 'Mark Johnson', timestamp: subHours(now, 1.5).toISOString(), metadata: { priority: 'high' } },
    ],
  },
  {
    id: 'ANM-005',
    title: 'ER patient volume 22% above forecast',
    description: 'Emergency department patient arrivals are 22% above the predicted volume for this week. Current: 487 patients vs. forecast: 399 patients.',
    severity: 'warning',
    status: 'active',
    module: 'bed-allocation',
    detectedAt: subHours(now, 4).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'department.patient_volume', operator: 'deviation', expectedValue: 399, actualValue: 487, dataSource: 'beds.admission_data', recordId: 'DEPT-ER-W03' },
    ],
    affectedModules: ['bed-allocation', 'staffing', 'supply-chain'],
    context: {
      summary: 'ER patient volume is 22% above forecast this week (487 vs. 399). This is straining bed availability, staff workload, and supply consumption across the department.',
      rootCauseHypothesis: 'Regional flu outbreak combined with a multi-vehicle accident on I-95 contributed to the volume spike. Surrounding community clinics have reduced hours this week.',
      recommendedActions: ['Activate surge capacity protocols', 'Coordinate with bed allocation for additional ER overflow beds', 'Alert supply chain to increase ER consumables par levels'],
      relatedAnomalyIds: ['ANM-002'],
      impactAssessment: { affectedPatients: 88, financialImpact: 32000, operationalRisk: 'high' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-008', anomalyId: 'ANM-005', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 4).toISOString(), metadata: { detectionRule: 'VOLUME_DEVIATION' } }],
  },
  {
    id: 'ANM-006',
    title: 'Revenue per bed-day decline in Cardiology',
    description: 'Revenue per bed-day in Cardiology has dropped 15% over the past month, from $2,840 to $2,414. This is below the department break-even threshold.',
    severity: 'warning',
    status: 'active',
    module: 'finance',
    detectedAt: subHours(now, 6).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'department.revenue_per_bed_day', operator: 'lt', expectedValue: 2500, actualValue: 2414, dataSource: 'finance.revenue_metrics', recordId: 'DEPT-CARD-M01' },
    ],
    affectedModules: ['finance', 'bed-allocation'],
    context: {
      summary: 'Cardiology revenue per bed-day has fallen 15% to $2,414, below the $2,500 break-even threshold. If this trend continues, the department will miss its Q1 revenue target by approximately $380,000.',
      rootCauseHypothesis: 'Shift in payer mix: more Medicaid patients (lower reimbursement) replacing commercial insurance patients. Additionally, claim denial rate for cardiac procedures increased from 3% to 8%.',
      recommendedActions: ['Review payer mix trends and adjust marketing strategy', 'Audit recent claim denials for cardiac procedures', 'Evaluate pricing for elective cardiac procedures'],
      relatedAnomalyIds: [],
      impactAssessment: { affectedPatients: 0, financialImpact: 380000, operationalRisk: 'high' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-009', anomalyId: 'ANM-006', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 6).toISOString(), metadata: { detectionRule: 'REVENUE_THRESHOLD' } }],
  },
  {
    id: 'ANM-007',
    title: 'PPE inventory below safety stock level',
    description: 'N95 respirator inventory has dropped to 340 units, 32% below the safety stock level of 500. Current burn rate suggests stockout in 3.2 days.',
    severity: 'critical',
    status: 'active',
    module: 'supply-chain',
    detectedAt: subHours(now, 8).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'item.current_stock', operator: 'lt', expectedValue: 500, actualValue: 340, dataSource: 'supply_chain.inventory', recordId: 'SKU-N95-003' },
      { field: 'item.days_to_stockout', operator: 'lt', expectedValue: 7, actualValue: 3.2, dataSource: 'supply_chain.forecast', recordId: 'SKU-N95-003' },
    ],
    affectedModules: ['supply-chain', 'staffing'],
    context: {
      summary: 'N95 respirator stock is critically low at 340 units (32% below safety stock of 500). At current consumption rate of 106 units/day, stockout occurs in approximately 3.2 days.',
      rootCauseHypothesis: 'Increased respiratory isolation cases combined with a delayed supplier shipment (expected 3 days ago, still in transit). Secondary supplier has minimum order quantity that exceeds current budget allocation.',
      recommendedActions: ['Place emergency order with secondary supplier', 'Implement N95 conservation protocols for non-critical areas', 'Escalate delayed shipment with primary supplier'],
      relatedAnomalyIds: ['ANM-004'],
      impactAssessment: { affectedPatients: 0, financialImpact: 12000, operationalRisk: 'high' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-010', anomalyId: 'ANM-007', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 8).toISOString(), metadata: { detectionRule: 'SAFETY_STOCK_BREACH' } }],
  },
  {
    id: 'ANM-008',
    title: 'Duplicate patient records detected',
    description: 'Three pairs of potentially duplicate patient records detected in the last 24 hours. Records share identical name, DOB, and phone number but different MRNs.',
    severity: 'informational',
    status: 'active',
    module: 'cross-module',
    detectedAt: subHours(now, 12).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'patient.duplicate_score', operator: 'gt', expectedValue: 0.85, actualValue: 0.96, dataSource: 'cross_module.patient_dedup', recordId: 'DUP-BATCH-024' },
    ],
    affectedModules: ['staffing', 'bed-allocation', 'finance'],
    context: {
      summary: 'Three pairs of potential duplicate patient records identified with 96% match confidence. Duplicates may cause billing errors, medication history gaps, and inaccurate census counts.',
      rootCauseHypothesis: 'Patients re-registered at different entry points (ER vs. outpatient clinic) without prior record lookup. System lacked real-time duplicate check at registration.',
      recommendedActions: ['Review and merge confirmed duplicate records', 'Enable real-time duplicate detection at all registration points', 'Audit billing records for the affected patient pairs'],
      relatedAnomalyIds: ['ANM-001'],
      impactAssessment: { affectedPatients: 6, financialImpact: null, operationalRisk: 'low' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-011', anomalyId: 'ANM-008', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 12).toISOString(), metadata: { detectionRule: 'DUPLICATE_DETECTION' } }],
  },
  {
    id: 'ANM-009',
    title: 'Nurse-to-patient ratio violation in Pediatrics',
    description: 'Pediatric ward night shift nurse-to-patient ratio has exceeded 1:6 (currently 1:8), violating state regulatory requirements.',
    severity: 'critical',
    status: 'acknowledged',
    module: 'staffing',
    detectedAt: subHours(now, 14).toISOString(),
    acknowledgedAt: subHours(now, 13).toISOString(),
    resolvedAt: null,
    triggeredBy: [
      { field: 'ward.nurse_patient_ratio', operator: 'gt', expectedValue: 6, actualValue: 8, dataSource: 'staffing.shift_assignments', recordId: 'SHIFT-PED-N-014' },
    ],
    affectedModules: ['staffing'],
    context: {
      summary: 'Pediatric night shift has 1:8 nurse-to-patient ratio, exceeding the state-mandated maximum of 1:6. This represents a regulatory compliance violation that must be addressed within the current shift.',
      rootCauseHypothesis: 'Two nurses called out sick, and the float pool was already depleted from covering ER surge. Charge nurse was unable to find replacements within the 4-hour notice window.',
      recommendedActions: ['Immediately assign float pool nurse or supervisor to pediatrics', 'Notify nursing director of staffing emergency', 'Document the violation and corrective action for compliance reporting'],
      relatedAnomalyIds: ['ANM-002'],
      impactAssessment: { affectedPatients: 16, financialImpact: 25000, operationalRisk: 'high' },
    },
    assignedTo: 'USR-028',
    auditTrail: [
      { id: 'AUD-012', anomalyId: 'ANM-009', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 14).toISOString(), metadata: { detectionRule: 'RATIO_VIOLATION' } },
      { id: 'AUD-013', anomalyId: 'ANM-009', action: 'acknowledged', actorId: 'USR-028', actorName: 'Nurse Director Kim', timestamp: subHours(now, 13).toISOString(), metadata: {} },
    ],
  },
  {
    id: 'ANM-010',
    title: 'Medical waste disposal cost increase',
    description: 'Monthly medical waste disposal costs have increased 28% compared to the 6-month average. Current month: $34,200 vs. average: $26,700.',
    severity: 'informational',
    status: 'active',
    module: 'finance',
    detectedAt: subDays(now, 1).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    triggeredBy: [
      { field: 'department.waste_disposal_cost', operator: 'deviation', expectedValue: 26700, actualValue: 34200, dataSource: 'finance.operational_costs', recordId: 'COST-WASTE-M01' },
    ],
    affectedModules: ['finance', 'supply-chain'],
    context: {
      summary: 'Medical waste disposal costs have risen 28% above the 6-month average, adding $7,500 to monthly operational costs. The increase correlates with higher surgical volume and new infectious disease protocols.',
      rootCauseHypothesis: 'New infectious disease isolation protocols require more frequent waste disposal pickups. Additionally, the orthopedic surgery program generates more biomedical waste per procedure than estimated.',
      recommendedActions: ['Review waste segregation practices for optimization opportunities', 'Renegotiate waste disposal contract given higher volumes', 'Assess if new protocols allow any waste stream reclassification'],
      relatedAnomalyIds: [],
      impactAssessment: { affectedPatients: 0, financialImpact: 90000, operationalRisk: 'low' },
    },
    assignedTo: null,
    auditTrail: [{ id: 'AUD-014', anomalyId: 'ANM-010', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subDays(now, 1).toISOString(), metadata: { detectionRule: 'COST_DEVIATION' } }],
  },
  {
    id: 'ANM-011',
    title: 'Operating room utilization drop in Block B',
    description: 'OR Block B utilization has dropped from 82% to 61% over the past two weeks, significantly below the 75% target.',
    severity: 'informational',
    status: 'dismissed',
    module: 'bed-allocation',
    detectedAt: subDays(now, 2).toISOString(),
    acknowledgedAt: subDays(now, 2).toISOString(),
    resolvedAt: null,
    triggeredBy: [
      { field: 'or_block.utilization_rate', operator: 'lt', expectedValue: 0.75, actualValue: 0.61, dataSource: 'beds.or_utilization', recordId: 'OR-BLOCK-B-W02' },
    ],
    affectedModules: ['bed-allocation', 'finance'],
    context: {
      summary: 'OR Block B utilization has declined 21 percentage points over two weeks. This represents approximately $120,000 in lost potential revenue per week from unused surgical capacity.',
      rootCauseHypothesis: 'Two senior surgeons are on conference leave simultaneously, and their scheduled procedures were not backfilled. Scheduling system did not flag the concurrent absence conflict.',
      recommendedActions: ['Backfill OR Block B slots with waitlisted elective procedures', 'Implement surgeon absence alerting in scheduling system', 'Review OR block allocation policy for absence coverage'],
      relatedAnomalyIds: [],
      impactAssessment: { affectedPatients: 0, financialImpact: 120000, operationalRisk: 'low' },
    },
    assignedTo: null,
    auditTrail: [
      { id: 'AUD-015', anomalyId: 'ANM-011', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subDays(now, 2).toISOString(), metadata: { detectionRule: 'UTILIZATION_THRESHOLD' } },
      { id: 'AUD-016', anomalyId: 'ANM-011', action: 'dismissed', actorId: 'USR-050', actorName: 'Admin Williams', timestamp: subDays(now, 2).toISOString(), metadata: {}, reason: 'Expected drop due to scheduled surgeon conference leave. Will self-resolve when surgeons return next week.' },
    ],
  },
  {
    id: 'ANM-012',
    title: 'Cross-module cascade: staffing shortage affecting bed availability',
    description: 'Staffing shortage in ICU nursing has caused 4 ICU beds to be marked unavailable, creating a cascade effect on surgical scheduling and ER admission flow.',
    severity: 'critical',
    status: 'investigating',
    module: 'cross-module',
    detectedAt: subHours(now, 2).toISOString(),
    acknowledgedAt: subHours(now, 1.5).toISOString(),
    resolvedAt: null,
    triggeredBy: [
      { field: 'ward.available_beds', operator: 'lt', expectedValue: 12, actualValue: 8, dataSource: 'beds.availability', recordId: 'WARD-ICU-D12' },
      { field: 'ward.staffing_gap', operator: 'gt', expectedValue: 0, actualValue: 3, dataSource: 'staffing.assignments', recordId: 'SHIFT-ICU-D-012' },
    ],
    affectedModules: ['staffing', 'bed-allocation', 'finance'],
    context: {
      summary: 'ICU staffing shortage (3 nurses below minimum) has forced 4 beds offline, reducing ICU capacity by 33%. This is delaying 2 scheduled surgeries and 3 ER-to-ICU transfers, with an estimated revenue impact of $48,000/day.',
      rootCauseHypothesis: 'Combination of sick calls, unfilled positions, and float pool exhaustion from ER surge. The staffing shortage directly caused bed closures per safety protocols requiring minimum nurse-to-bed ratios.',
      recommendedActions: ['Activate critical staffing protocols for ICU', 'Contact agency nursing for immediate coverage', 'Coordinate with surgical scheduling to defer non-urgent cases', 'Open ICU overflow beds in step-down unit with appropriate staffing'],
      relatedAnomalyIds: ['ANM-002', 'ANM-003', 'ANM-005', 'ANM-009'],
      impactAssessment: { affectedPatients: 5, financialImpact: 48000, operationalRisk: 'high' },
    },
    assignedTo: 'USR-001',
    auditTrail: [
      { id: 'AUD-017', anomalyId: 'ANM-012', action: 'created', actorId: 'SYSTEM', actorName: 'Anomaly Detector', timestamp: subHours(now, 2).toISOString(), metadata: { detectionRule: 'CROSS_MODULE_CASCADE' } },
      { id: 'AUD-018', anomalyId: 'ANM-012', action: 'acknowledged', actorId: 'USR-001', actorName: 'Admin Director', timestamp: subHours(now, 1.5).toISOString(), metadata: {} },
      { id: 'AUD-019', anomalyId: 'ANM-012', action: 'investigation_started', actorId: 'USR-001', actorName: 'Admin Director', timestamp: subHours(now, 1).toISOString(), metadata: { priority: 'high' } },
    ],
  },
];

const MOCK_STATS: AnomalyStats = {
  critical: 4,
  warning: 3,
  informational: 3,
  resolved: 156,
  meanTimeToAcknowledge: 24,
  meanTimeToResolve: 18.5,
  anomaliesLast24h: 8,
  anomaliesLast7d: 39,
};

function generateTrendData(days: number): AnomalyTrendDataPoint[] {
  const data: AnomalyTrendDataPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = format(subDays(now, i), 'yyyy-MM-dd');
    const critical = Math.floor(Math.random() * 3) + (i < 7 ? 2 : 0);
    const warning = Math.floor(Math.random() * 5) + 2;
    const informational = Math.floor(Math.random() * 8) + 3;
    data.push({
      date,
      critical,
      warning,
      informational,
      total: critical + warning + informational,
    });
  }
  return data;
}

const MOCK_PATTERNS: AnomalyPattern[] = [
  {
    patternId: 'PAT-001',
    title: 'Weekend staffing ratio violations',
    description: 'Nurse-to-patient ratio violations consistently occur on Saturday and Sunday night shifts across Pediatrics and Med-Surg wards.',
    occurrenceCount: 12,
    lastOccurrence: subDays(now, 2).toISOString(),
    severity: 'critical',
    module: 'staffing',
    avgFrequencyDays: 3.5,
    relatedAnomalyIds: ['ANM-009'],
  },
  {
    patternId: 'PAT-002',
    title: 'Monthly supply cost spikes at reorder cycles',
    description: 'Supply costs spike 15-20% during the last week of each month when bulk reorders are processed. This is predictable but creates budget variance flags.',
    occurrenceCount: 6,
    lastOccurrence: subDays(now, 5).toISOString(),
    severity: 'informational',
    module: 'supply-chain',
    avgFrequencyDays: 30,
    relatedAnomalyIds: ['ANM-004'],
  },
  {
    patternId: 'PAT-003',
    title: 'Post-holiday ER volume surges',
    description: 'ER patient volume surges 20-30% in the 48 hours following major holidays, straining bed capacity and staffing.',
    occurrenceCount: 4,
    lastOccurrence: subDays(now, 14).toISOString(),
    severity: 'warning',
    module: 'bed-allocation',
    avgFrequencyDays: 45,
    relatedAnomalyIds: ['ANM-005'],
  },
];

const MOCK_NOTES: InvestigationNote[] = [
  {
    id: 'NOTE-001',
    anomalyId: 'ANM-004',
    authorId: 'USR-015',
    authorName: 'Mark Johnson',
    content: 'Confirmed with orthopedic team that new program is driving increased surgical kit consumption. Historical par levels were based on pre-program volumes. Requesting budget adjustment and new par level calculation.',
    createdAt: subHours(now, 1).toISOString(),
    updatedAt: subHours(now, 1).toISOString(),
  },
  {
    id: 'NOTE-002',
    anomalyId: 'ANM-012',
    authorId: 'USR-001',
    authorName: 'Admin Director',
    content: 'Contacted agency nursing - 2 ICU-certified nurses available starting tonight at 7PM. Surgical schedule reviewed with Dr. Martinez - 1 case deferred to Thursday, 1 case moved to OR Block A. ER transfers prioritized for existing ICU beds.',
    createdAt: subMinutes(now, 45).toISOString(),
    updatedAt: subMinutes(now, 45).toISOString(),
  },
];

// --- Service Functions ---

export async function fetchAnomalies(
  filters?: Partial<AnomalyFilterState>,
): Promise<{ alerts: AnomalyAlert[]; stats: AnomalyStats; totalItems: number; hasMore: boolean }> {
  await new Promise((r) => setTimeout(r, 600));
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = MOCK_ALERTS.slice(start, end);
  return {
    alerts: paged,
    stats: MOCK_STATS,
    totalItems: MOCK_ALERTS.length,
    hasMore: end < MOCK_ALERTS.length,
  };
}

export async function fetchAnomalyDetail(
  anomalyId: string,
): Promise<{ anomaly: AnomalyAlert | null; relatedAnomalies: AnomalyAlert[]; notes: InvestigationNote[] }> {
  await new Promise((r) => setTimeout(r, 400));
  const anomaly = MOCK_ALERTS.find((a) => a.id === anomalyId) ?? null;
  const related = anomaly
    ? MOCK_ALERTS.filter((a) => anomaly.context.relatedAnomalyIds.includes(a.id))
    : [];
  const notes = MOCK_NOTES.filter((n) => n.anomalyId === anomalyId);
  return { anomaly, relatedAnomalies: related, notes };
}

export async function acknowledgeAnomaly(
  anomalyId: string,
  _note?: string,
): Promise<AnomalyAlert> {
  await new Promise((r) => setTimeout(r, 300));
  const alert = MOCK_ALERTS.find((a) => a.id === anomalyId);
  if (!alert) throw new Error(`Anomaly ${anomalyId} not found`);
  return { ...alert, status: 'acknowledged', acknowledgedAt: new Date().toISOString() };
}

export async function investigateAnomaly(
  anomalyId: string,
  _assignedTo?: string,
): Promise<AnomalyAlert> {
  await new Promise((r) => setTimeout(r, 300));
  const alert = MOCK_ALERTS.find((a) => a.id === anomalyId);
  if (!alert) throw new Error(`Anomaly ${anomalyId} not found`);
  return { ...alert, status: 'investigating', acknowledgedAt: alert.acknowledgedAt ?? new Date().toISOString() };
}

export async function dismissAnomaly(
  anomalyId: string,
  _reason: string,
  _suppressSimilar: boolean,
): Promise<AnomalyAlert> {
  await new Promise((r) => setTimeout(r, 300));
  const alert = MOCK_ALERTS.find((a) => a.id === anomalyId);
  if (!alert) throw new Error(`Anomaly ${anomalyId} not found`);
  return { ...alert, status: 'dismissed' };
}

export async function fetchAnomalyStats(): Promise<AnomalyStats> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_STATS;
}

export async function fetchAnomalyTrends(
  period: '7d' | '30d' | '90d' | '1y',
): Promise<AnomalyTrendDataPoint[]> {
  await new Promise((r) => setTimeout(r, 400));
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  return generateTrendData(daysMap[period]);
}

export async function fetchAnomalyPatterns(): Promise<AnomalyPattern[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_PATTERNS;
}

export async function addInvestigationNote(
  anomalyId: string,
  content: string,
): Promise<InvestigationNote> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    id: `NOTE-${Date.now()}`,
    anomalyId,
    authorId: 'USR-001',
    authorName: 'Current User',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
