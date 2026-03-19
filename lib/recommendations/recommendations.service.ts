import type {
  Recommendation,
  RecommendationAction,
  RecommendationOutcome,
  OutcomeSummary,
  OutcomeTrend,
  RecommendationFilterState,
  DismissReason,
  SimulationPreviewData,
} from './recommendations.types';
import { subDays, subHours, addDays, format } from 'date-fns';

const now = new Date();

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-2024-0142',
    hospitalId: 'HOSP-001',
    module: 'bed_allocation',
    status: 'active',
    priority: {
      level: 'urgent',
      score: 92,
      factors: [
        { name: 'revenue_impact', weight: 0.30, value: 95 },
        { name: 'patient_safety', weight: 0.25, value: 88 },
        { name: 'operational_efficiency', weight: 0.15, value: 92 },
        { name: 'cost_savings', weight: 0.20, value: 90 },
        { name: 'compliance', weight: 0.10, value: 85 },
      ],
    },
    urgency: {
      level: 'immediate',
      reason: 'Bed overflow projected within 3 days based on current admission trends.',
      deadlineDate: addDays(now, 3).toISOString(),
    },
    title: 'Reallocate 15 beds from Ward A to Ward B',
    actionSummary: 'Transfer 15 underutilized beds from Ward A (Medical) to Ward B (Surgical) to prevent overflow and increase utilization efficiency across both wards.',
    detailedReasoning: `## Current Situation\nWard B (Surgical) is operating at 94% capacity with 3 patients on waitlist for admission. Ward A (Medical) has dropped to 62% occupancy over the past 2 weeks.\n\n## Analysis\nPredictive models forecast a 30% increase in surgical admissions over the next 10 days due to scheduled elective procedures and historical seasonal patterns. Ward A occupancy is expected to remain below 70%.\n\n## Recommendation Rationale\nReallocating 15 beds will bring Ward A to a sustainable 75% occupancy while giving Ward B the capacity to handle projected demand without overflow. Historical data shows similar reallocations in Q3 2023 resulted in 28% reduction in patient wait times.\n\n## Risk Factors\n- Ward A may need beds returned if medical admissions spike unexpectedly (low probability: 12%)\n- Temporary staffing adjustment needed for Ward B nursing coverage\n\n## Alternative Approaches\n1. Open overflow beds in hallway (not recommended — patient satisfaction impact)\n2. Defer elective procedures (revenue loss of ~$120K)\n3. Transfer patients to partner hospital (logistically complex, insurance complications)`,
    specificActions: [
      { stepNumber: 1, description: 'Confirm Ward A bed availability with charge nurse', responsible: 'Bed Manager', estimatedDuration: '2 hours', dependencies: [] },
      { stepNumber: 2, description: 'Coordinate nursing staff reassignment for additional Ward B capacity', responsible: 'Nursing Director', estimatedDuration: '1 day', dependencies: ['1'] },
      { stepNumber: 3, description: 'Update bed allocation system and notify admissions', responsible: 'Bed Manager', estimatedDuration: '1 hour', dependencies: ['1'] },
      { stepNumber: 4, description: 'Monitor utilization for 48 hours and adjust if needed', responsible: 'Operations Manager', estimatedDuration: '2 days', dependencies: ['2', '3'] },
    ],
    expectedImpacts: [
      { metricName: 'bed_overflow_risk', displayName: 'Bed Overflow Risk', currentValue: 78, projectedValue: 48, delta: -30, deltaPercentage: -38.5, unit: '%', timeToImpact: '3 days', confidence: 87, direction: 'positive' },
      { metricName: 'ward_b_utilization', displayName: 'Ward B Utilization', currentValue: 72, projectedValue: 89, delta: 17, deltaPercentage: 23.6, unit: '%', timeToImpact: '1 week', confidence: 91, direction: 'positive' },
      { metricName: 'quarterly_revenue', displayName: 'Revenue Uplift', currentValue: 0, projectedValue: 45000, delta: 45000, deltaPercentage: 100, unit: '$', timeToImpact: '1 quarter', confidence: 78, direction: 'positive' },
    ],
    confidenceScore: 87,
    dataBasis: {
      timeframeDays: 180,
      recordCount: 24500,
      modules: ['bed_allocation', 'staffing'],
      dataQualityScore: 92,
      modelAccuracy: 85,
      lastDataUpdateAt: subHours(now, 2).toISOString(),
    },
    predictiveModelId: 'PM-BED-004',
    relatedRecommendationIds: ['REC-2024-0143', 'REC-2024-0147'],
    generatedAt: subHours(now, 4).toISOString(),
    expiresAt: addDays(now, 3).toISOString(),
    lastViewedAt: null,
    viewCount: 0,
    action: null,
  },
  {
    id: 'REC-2024-0143',
    hospitalId: 'HOSP-001',
    module: 'staffing',
    status: 'active',
    priority: {
      level: 'high',
      score: 78,
      factors: [
        { name: 'patient_safety', weight: 0.25, value: 85 },
        { name: 'cost_savings', weight: 0.20, value: 82 },
        { name: 'operational_efficiency', weight: 0.15, value: 75 },
        { name: 'revenue_impact', weight: 0.30, value: 70 },
        { name: 'compliance', weight: 0.10, value: 80 },
      ],
    },
    urgency: {
      level: 'this_week',
      reason: 'Weekend staffing gaps predicted for upcoming Saturday/Sunday shifts.',
      deadlineDate: addDays(now, 5).toISOString(),
    },
    title: 'Increase weekend RN shifts by 3 FTEs in Emergency Department',
    actionSummary: 'Add 3 full-time equivalent RN positions to weekend shifts in the Emergency Department to reduce patient wait times and decrease overtime dependency.',
    detailedReasoning: `## Current Situation\nER weekend shifts are consistently understaffed, with nurse-to-patient ratios exceeding 1:6 on 73% of weekends over the past 90 days. This has led to average overtime costs of $18K/month.\n\n## Analysis\nPatient volume analysis shows weekends average 22% higher than weekday volumes. Current scheduling only accounts for 8% higher staffing on weekends.\n\n## Recommendation Rationale\nAdding 3 FTEs specifically for weekend coverage closes the staffing gap and eliminates the need for overtime. Net cost savings of $8K/month after accounting for new hires.\n\n## Risk Factors\n- Recruitment timeline may delay implementation by 2-3 weeks\n- Existing staff may resist schedule changes\n\n## Alternative Approaches\n1. Continue with overtime (unsustainable, burnout risk)\n2. Use agency nurses (higher cost per hour)\n3. Redistribute existing weekday staff (creates weekday gaps)`,
    specificActions: [
      { stepNumber: 1, description: 'Post 3 FTE weekend RN positions through HR', responsible: 'HR Director', estimatedDuration: '2 days', dependencies: [] },
      { stepNumber: 2, description: 'Contact nursing agency for interim weekend coverage', responsible: 'Nursing Director', estimatedDuration: '1 day', dependencies: [] },
      { stepNumber: 3, description: 'Revise weekend shift schedules to accommodate new positions', responsible: 'ER Charge Nurse', estimatedDuration: '3 days', dependencies: ['1'] },
      { stepNumber: 4, description: 'Monitor overtime hours and patient wait times post-implementation', responsible: 'Operations Manager', estimatedDuration: 'Ongoing', dependencies: ['2', '3'] },
    ],
    expectedImpacts: [
      { metricName: 'patient_wait_time', displayName: 'Patient Wait Time', currentValue: 47, projectedValue: 25, delta: -22, deltaPercentage: -46.8, unit: 'min', timeToImpact: '2 weeks', confidence: 83, direction: 'positive' },
      { metricName: 'overtime_cost', displayName: 'Overtime Costs', currentValue: 18000, projectedValue: 10000, delta: -8000, deltaPercentage: -44.4, unit: '$/mo', timeToImpact: '1 month', confidence: 79, direction: 'positive' },
      { metricName: 'patient_satisfaction', displayName: 'Patient Satisfaction', currentValue: 3.6, projectedValue: 4.2, delta: 0.6, deltaPercentage: 16.7, unit: 'pts', timeToImpact: '1 quarter', confidence: 72, direction: 'positive' },
    ],
    confidenceScore: 83,
    dataBasis: {
      timeframeDays: 90,
      recordCount: 12800,
      modules: ['staffing', 'finance'],
      dataQualityScore: 89,
      modelAccuracy: 81,
      lastDataUpdateAt: subHours(now, 6).toISOString(),
    },
    predictiveModelId: 'PM-STAFF-007',
    relatedRecommendationIds: ['REC-2024-0142', 'REC-2024-0148'],
    generatedAt: subHours(now, 8).toISOString(),
    expiresAt: addDays(now, 7).toISOString(),
    lastViewedAt: null,
    viewCount: 0,
    action: null,
  },
  {
    id: 'REC-2024-0144',
    hospitalId: 'HOSP-001',
    module: 'supply_chain',
    status: 'active',
    priority: {
      level: 'high',
      score: 74,
      factors: [
        { name: 'patient_safety', weight: 0.25, value: 90 },
        { name: 'cost_savings', weight: 0.20, value: 65 },
        { name: 'operational_efficiency', weight: 0.15, value: 70 },
        { name: 'revenue_impact', weight: 0.30, value: 60 },
        { name: 'compliance', weight: 0.10, value: 95 },
      ],
    },
    urgency: {
      level: 'immediate',
      reason: 'N95 respirator stockout projected in 3.2 days at current burn rate.',
      deadlineDate: addDays(now, 3).toISOString(),
    },
    title: 'Place emergency N95 respirator order and activate conservation protocol',
    actionSummary: 'Order 2,000 N95 respirators from secondary supplier and implement conservation protocols in non-critical areas to prevent stockout within 72 hours.',
    detailedReasoning: `## Current Situation\nN95 respirator stock is at 340 units, 32% below the safety stock of 500. Daily consumption is 106 units. Primary supplier shipment is delayed.\n\n## Analysis\nAt current burn rate, complete stockout occurs in 3.2 days. Conservation protocols in non-critical areas can reduce daily consumption by 35 units.\n\n## Recommendation Rationale\nDual approach: emergency order ensures supply continuity while conservation protocols extend runway from 3.2 to 5.1 days, providing buffer for delivery.\n\n## Risk Factors\n- Secondary supplier has 15% price premium\n- Conservation protocols may face pushback from staff\n\n## Alternative Approaches\n1. Wait for primary supplier (risk of stockout)\n2. Borrow from partner hospitals (limited availability)\n3. Switch to alternative PPE (regulatory concerns for certain procedures)`,
    specificActions: [
      { stepNumber: 1, description: 'Place emergency order with MedSupply Corp (secondary supplier)', responsible: 'Supply Chain Manager', estimatedDuration: '2 hours', dependencies: [] },
      { stepNumber: 2, description: 'Issue conservation protocol memo for non-ICU, non-ER areas', responsible: 'Infection Control', estimatedDuration: '4 hours', dependencies: [] },
      { stepNumber: 3, description: 'Escalate delayed primary shipment with vendor relations', responsible: 'Procurement Lead', estimatedDuration: '1 day', dependencies: [] },
      { stepNumber: 4, description: 'Monitor daily inventory levels until stock replenished', responsible: 'Supply Chain Manager', estimatedDuration: '5 days', dependencies: ['1', '2'] },
    ],
    expectedImpacts: [
      { metricName: 'stockout_risk', displayName: 'Stockout Risk', currentValue: 85, projectedValue: 15, delta: -70, deltaPercentage: -82.4, unit: '%', timeToImpact: '3 days', confidence: 90, direction: 'positive' },
      { metricName: 'ppe_cost', displayName: 'Additional PPE Cost', currentValue: 0, projectedValue: 4200, delta: 4200, deltaPercentage: 100, unit: '$', timeToImpact: '1 week', confidence: 95, direction: 'negative' },
      { metricName: 'compliance_score', displayName: 'Safety Compliance', currentValue: 88, projectedValue: 98, delta: 10, deltaPercentage: 11.4, unit: '%', timeToImpact: '1 week', confidence: 88, direction: 'positive' },
    ],
    confidenceScore: 90,
    dataBasis: {
      timeframeDays: 30,
      recordCount: 3400,
      modules: ['supply_chain'],
      dataQualityScore: 95,
      modelAccuracy: 92,
      lastDataUpdateAt: subHours(now, 1).toISOString(),
    },
    predictiveModelId: 'PM-SUPPLY-002',
    relatedRecommendationIds: ['REC-2024-0149'],
    generatedAt: subHours(now, 3).toISOString(),
    expiresAt: addDays(now, 2).toISOString(),
    lastViewedAt: null,
    viewCount: 0,
    action: null,
  },
  {
    id: 'REC-2024-0145',
    hospitalId: 'HOSP-001',
    module: 'finance',
    status: 'active',
    priority: {
      level: 'medium',
      score: 58,
      factors: [
        { name: 'revenue_impact', weight: 0.30, value: 72 },
        { name: 'cost_savings', weight: 0.20, value: 55 },
        { name: 'patient_safety', weight: 0.25, value: 30 },
        { name: 'operational_efficiency', weight: 0.15, value: 65 },
        { name: 'compliance', weight: 0.10, value: 70 },
      ],
    },
    urgency: {
      level: 'this_month',
      reason: 'Q1 revenue target at risk if claim denial rate not addressed by month end.',
      deadlineDate: addDays(now, 21).toISOString(),
    },
    title: 'Audit and resubmit denied cardiac procedure claims',
    actionSummary: 'Review 47 denied cardiac procedure claims ($380K total) from the past 60 days, identify systematic denial patterns, and resubmit with corrected documentation.',
    detailedReasoning: `## Current Situation\nClaim denial rate for cardiac procedures increased from 3% to 8% over the past 2 months. This represents $380,000 in unrealized revenue across 47 denied claims.\n\n## Analysis\n62% of denials are due to documentation insufficiency (missing pre-authorization or incorrect procedure codes). 24% are payer-specific policy changes. 14% are legitimate.\n\n## Recommendation Rationale\nTargeted audit and resubmission of the 62% documentation-related denials could recover approximately $235K. Addressing the root cause prevents future denials.\n\n## Risk Factors\n- Resubmission window closes 90 days from original submission\n- Some denials may be upheld on appeal\n\n## Alternative Approaches\n1. Accept the losses and focus forward (lose $235K)\n2. Hire external billing auditor (additional $15K cost but potentially higher recovery rate)`,
    specificActions: [
      { stepNumber: 1, description: 'Pull complete list of denied cardiac claims from past 60 days', responsible: 'Revenue Cycle Manager', estimatedDuration: '4 hours', dependencies: [] },
      { stepNumber: 2, description: 'Categorize denials by root cause (documentation, policy, legitimate)', responsible: 'Claims Analyst', estimatedDuration: '2 days', dependencies: ['1'] },
      { stepNumber: 3, description: 'Correct documentation and resubmit eligible claims', responsible: 'Medical Billing Team', estimatedDuration: '1 week', dependencies: ['2'] },
      { stepNumber: 4, description: 'Update pre-authorization checklist to prevent future documentation denials', responsible: 'Revenue Cycle Manager', estimatedDuration: '3 days', dependencies: ['2'] },
    ],
    expectedImpacts: [
      { metricName: 'recovered_revenue', displayName: 'Recovered Revenue', currentValue: 0, projectedValue: 235000, delta: 235000, deltaPercentage: 100, unit: '$', timeToImpact: '6 weeks', confidence: 68, direction: 'positive' },
      { metricName: 'denial_rate', displayName: 'Claim Denial Rate', currentValue: 8, projectedValue: 4, delta: -4, deltaPercentage: -50, unit: '%', timeToImpact: '2 months', confidence: 72, direction: 'positive' },
    ],
    confidenceScore: 68,
    dataBasis: {
      timeframeDays: 60,
      recordCount: 1890,
      modules: ['finance'],
      dataQualityScore: 87,
      modelAccuracy: 76,
      lastDataUpdateAt: subHours(now, 12).toISOString(),
    },
    predictiveModelId: 'PM-FIN-003',
    relatedRecommendationIds: [],
    generatedAt: subDays(now, 1).toISOString(),
    expiresAt: addDays(now, 30).toISOString(),
    lastViewedAt: subHours(now, 2).toISOString(),
    viewCount: 3,
    action: null,
  },
  {
    id: 'REC-2024-0146',
    hospitalId: 'HOSP-001',
    module: 'anomaly_detection',
    status: 'active',
    priority: {
      level: 'medium',
      score: 52,
      factors: [
        { name: 'operational_efficiency', weight: 0.15, value: 80 },
        { name: 'compliance', weight: 0.10, value: 75 },
        { name: 'patient_safety', weight: 0.25, value: 45 },
        { name: 'cost_savings', weight: 0.20, value: 50 },
        { name: 'revenue_impact', weight: 0.30, value: 40 },
      ],
    },
    urgency: {
      level: 'this_month',
      reason: 'Recurring pattern of weekend staffing anomalies detected over 6 weeks.',
      deadlineDate: addDays(now, 14).toISOString(),
    },
    title: 'Implement automated weekend staffing alert thresholds',
    actionSummary: 'Configure automated monitoring rules that trigger early warnings when weekend shift assignments fall below minimum staffing ratios, preventing repeated compliance violations.',
    detailedReasoning: `## Current Situation\nAnomaly detection has flagged weekend staffing ratio violations 12 times in the past 6 weeks across Pediatrics and Med-Surg. Current detection is reactive.\n\n## Analysis\nPattern analysis shows violations are predictable: they occur when 2+ nurses call out within 4 hours of shift start and float pool availability is below 3.\n\n## Recommendation Rationale\nAutomated alerts at the T-6 hour mark (before shift start) allow proactive float pool activation, reducing violations by an estimated 80%.\n\n## Risk Factors\n- Alert fatigue if thresholds are too sensitive\n- Float pool may still be unavailable in extreme cases`,
    specificActions: [
      { stepNumber: 1, description: 'Define alert thresholds for weekend staffing ratios by department', responsible: 'Nursing Director', estimatedDuration: '2 days', dependencies: [] },
      { stepNumber: 2, description: 'Configure automated monitoring rules in anomaly detection system', responsible: 'IT Operations', estimatedDuration: '3 days', dependencies: ['1'] },
      { stepNumber: 3, description: 'Set up escalation chain for staffing alerts (charge nurse → director → agency)', responsible: 'Nursing Director', estimatedDuration: '1 day', dependencies: ['1'] },
      { stepNumber: 4, description: 'Test alert system over 2 weekend cycles', responsible: 'Operations Manager', estimatedDuration: '2 weeks', dependencies: ['2', '3'] },
    ],
    expectedImpacts: [
      { metricName: 'staffing_violations', displayName: 'Staffing Violations', currentValue: 2.0, projectedValue: 0.4, delta: -1.6, deltaPercentage: -80, unit: '/week', timeToImpact: '3 weeks', confidence: 75, direction: 'positive' },
      { metricName: 'proactive_coverage', displayName: 'Proactive Coverage Rate', currentValue: 30, projectedValue: 85, delta: 55, deltaPercentage: 183, unit: '%', timeToImpact: '1 month', confidence: 70, direction: 'positive' },
    ],
    confidenceScore: 75,
    dataBasis: {
      timeframeDays: 42,
      recordCount: 840,
      modules: ['anomaly_detection', 'staffing'],
      dataQualityScore: 91,
      modelAccuracy: 83,
      lastDataUpdateAt: subHours(now, 4).toISOString(),
    },
    predictiveModelId: 'PM-ANOM-001',
    relatedRecommendationIds: [],
    generatedAt: subDays(now, 2).toISOString(),
    expiresAt: addDays(now, 14).toISOString(),
    lastViewedAt: null,
    viewCount: 0,
    action: null,
  },
  {
    id: 'REC-2024-0147',
    hospitalId: 'HOSP-001',
    module: 'bed_allocation',
    status: 'active',
    priority: {
      level: 'low',
      score: 35,
      factors: [
        { name: 'operational_efficiency', weight: 0.15, value: 60 },
        { name: 'revenue_impact', weight: 0.30, value: 30 },
        { name: 'patient_safety', weight: 0.25, value: 20 },
        { name: 'cost_savings', weight: 0.20, value: 40 },
        { name: 'compliance', weight: 0.10, value: 35 },
      ],
    },
    urgency: {
      level: 'next_quarter',
      reason: 'Seasonal pattern suggests preparation needed before Q2 surge.',
      deadlineDate: null,
    },
    title: 'Review OR Block B scheduling policy for surgeon absence coverage',
    actionSummary: 'Update operating room scheduling system to flag concurrent surgeon absences and automatically offer vacant slots to waitlisted elective procedures.',
    detailedReasoning: `## Current Situation\nOR Block B utilization dropped to 61% for two weeks when two senior surgeons attended a conference simultaneously. No backfill mechanism exists.\n\n## Analysis\nThis represents ~$240K in lost potential revenue over the two-week period. Similar concurrent absences occur 2-3 times per year.\n\n## Recommendation Rationale\nAutomated scheduling policy change is a low-cost fix that prevents recurring revenue loss.\n\n## Risk Factors\n- Minimal — this is a scheduling system configuration change`,
    specificActions: [
      { stepNumber: 1, description: 'Audit scheduling system for absence conflict detection capability', responsible: 'IT Operations', estimatedDuration: '1 day', dependencies: [] },
      { stepNumber: 2, description: 'Implement concurrent absence alerting rule for OR blocks', responsible: 'IT Operations', estimatedDuration: '3 days', dependencies: ['1'] },
      { stepNumber: 3, description: 'Create waitlist auto-offer workflow for vacant OR slots', responsible: 'Surgical Scheduling Coordinator', estimatedDuration: '1 week', dependencies: ['1'] },
    ],
    expectedImpacts: [
      { metricName: 'or_utilization', displayName: 'OR Utilization', currentValue: 61, projectedValue: 78, delta: 17, deltaPercentage: 27.9, unit: '%', timeToImpact: 'Next absence event', confidence: 65, direction: 'positive' },
      { metricName: 'annual_revenue_recovery', displayName: 'Annual Revenue Recovery', currentValue: 0, projectedValue: 480000, delta: 480000, deltaPercentage: 100, unit: '$', timeToImpact: '1 year', confidence: 55, direction: 'positive' },
    ],
    confidenceScore: 65,
    dataBasis: {
      timeframeDays: 365,
      recordCount: 4200,
      modules: ['bed_allocation', 'finance'],
      dataQualityScore: 88,
      modelAccuracy: 72,
      lastDataUpdateAt: subDays(now, 1).toISOString(),
    },
    predictiveModelId: 'PM-BED-006',
    relatedRecommendationIds: ['REC-2024-0142'],
    generatedAt: subDays(now, 3).toISOString(),
    expiresAt: null,
    lastViewedAt: null,
    viewCount: 0,
    action: null,
  },
  {
    id: 'REC-2024-0148',
    hospitalId: 'HOSP-001',
    module: 'staffing',
    status: 'accepted',
    priority: {
      level: 'high',
      score: 76,
      factors: [
        { name: 'cost_savings', weight: 0.20, value: 88 },
        { name: 'operational_efficiency', weight: 0.15, value: 82 },
        { name: 'patient_safety', weight: 0.25, value: 70 },
        { name: 'revenue_impact', weight: 0.30, value: 68 },
        { name: 'compliance', weight: 0.10, value: 75 },
      ],
    },
    urgency: {
      level: 'this_week',
      reason: 'Current overtime trend unsustainable beyond 2 weeks.',
      deadlineDate: subDays(now, 10).toISOString(),
    },
    title: 'Restructure ICU shift rotation to 12-hour model',
    actionSummary: 'Transition ICU nursing from 8-hour to 12-hour shifts to reduce handoff frequency, improve continuity of care, and reduce overtime costs by consolidating coverage.',
    detailedReasoning: `## Current Situation\nICU overtime has averaged $22K/month for the past quarter due to frequent shift handoffs and coverage gaps during the overlap period.\n\n## Analysis\n12-hour shift models in comparable ICUs show 35% reduction in overtime and improved patient outcomes through continuity.\n\n## Recommendation Rationale\nThis structural change addresses the root cause of ICU overtime rather than treating symptoms.`,
    specificActions: [
      { stepNumber: 1, description: 'Survey ICU nursing staff on 12-hour shift preference', responsible: 'Nursing Director', estimatedDuration: '1 week', dependencies: [] },
      { stepNumber: 2, description: 'Design new rotation schedule with 12-hour blocks', responsible: 'Scheduling Coordinator', estimatedDuration: '2 weeks', dependencies: ['1'] },
      { stepNumber: 3, description: 'Pilot with one ICU pod for 4 weeks', responsible: 'ICU Nurse Manager', estimatedDuration: '4 weeks', dependencies: ['2'] },
    ],
    expectedImpacts: [
      { metricName: 'overtime_cost', displayName: 'ICU Overtime Cost', currentValue: 22000, projectedValue: 14300, delta: -7700, deltaPercentage: -35, unit: '$/mo', timeToImpact: '2 months', confidence: 80, direction: 'positive' },
      { metricName: 'handoff_errors', displayName: 'Handoff Communication Errors', currentValue: 4.2, projectedValue: 2.1, delta: -2.1, deltaPercentage: -50, unit: '/week', timeToImpact: '1 month', confidence: 74, direction: 'positive' },
    ],
    confidenceScore: 80,
    dataBasis: {
      timeframeDays: 90,
      recordCount: 8700,
      modules: ['staffing', 'finance'],
      dataQualityScore: 91,
      modelAccuracy: 79,
      lastDataUpdateAt: subDays(now, 14).toISOString(),
    },
    predictiveModelId: 'PM-STAFF-005',
    relatedRecommendationIds: ['REC-2024-0143'],
    generatedAt: subDays(now, 21).toISOString(),
    expiresAt: null,
    lastViewedAt: subDays(now, 1).toISOString(),
    viewCount: 8,
    action: {
      id: 'ACT-001',
      recommendationId: 'REC-2024-0148',
      actionType: 'accept',
      implementationNotes: 'Starting with Pod A in ICU. Survey showed 78% staff approval. Running 4-week pilot starting next Monday.',
      targetImplementationDate: subDays(now, 7).toISOString(),
      deferUntilDate: null,
      deferReason: null,
      dismissReason: null,
      dismissComment: null,
      actionBy: 'USR-001',
      actionAt: subDays(now, 14).toISOString(),
      outcome: {
        id: 'OUT-001',
        recommendationId: 'REC-2024-0148',
        actionId: 'ACT-001',
        predictedImpacts: [
          { metricName: 'overtime_cost', displayName: 'ICU Overtime Cost', currentValue: 22000, projectedValue: 14300, delta: -7700, deltaPercentage: -35, unit: '$/mo', timeToImpact: '2 months', confidence: 80, direction: 'positive' },
        ],
        actualImpacts: [
          { metricName: 'overtime_cost', displayName: 'ICU Overtime Cost', baselineValue: 22000, actualValue: 15100, delta: -6900, deltaPercentage: -31.4, unit: '$/mo' },
        ],
        overallResult: 'positive',
        accuracyScore: 89,
        implementedAt: subDays(now, 7).toISOString(),
        measuredAt: subDays(now, 1).toISOString(),
        measurementWindowDays: 14,
        administratorFeedback: 'Staff adapted well. Overtime dropped noticeably in the first week. Minor scheduling conflicts resolved by week 2.',
        lessonsLearned: 'Important to get staff buy-in before pilot. Survey was key to smooth adoption.',
      },
    },
  },
  {
    id: 'REC-2024-0149',
    hospitalId: 'HOSP-001',
    module: 'supply_chain',
    status: 'deferred',
    priority: {
      level: 'medium',
      score: 55,
      factors: [
        { name: 'cost_savings', weight: 0.20, value: 70 },
        { name: 'operational_efficiency', weight: 0.15, value: 65 },
        { name: 'revenue_impact', weight: 0.30, value: 45 },
        { name: 'patient_safety', weight: 0.25, value: 40 },
        { name: 'compliance', weight: 0.10, value: 60 },
      ],
    },
    urgency: {
      level: 'this_month',
      reason: 'Contract renegotiation window opens next month.',
      deadlineDate: addDays(now, 30).toISOString(),
    },
    title: 'Renegotiate surgical supply vendor contract for volume discount',
    actionSummary: 'Leverage 2.5x increase in surgical kit consumption to negotiate 12-15% volume discount with primary supplier, projected annual savings of $180K.',
    detailedReasoning: `## Current Situation\nSurgical kit consumption increased 150% following new orthopedic program launch. Current contract pricing does not reflect the new volume.\n\n## Analysis\nAt new volume levels, the hospital qualifies for tier 2 pricing from the primary supplier.\n\n## Recommendation Rationale\nSimple contract renegotiation with strong leverage from increased volume.`,
    specificActions: [
      { stepNumber: 1, description: 'Compile 6-month consumption data for negotiation', responsible: 'Supply Chain Manager', estimatedDuration: '2 days', dependencies: [] },
      { stepNumber: 2, description: 'Schedule meeting with vendor account representative', responsible: 'Procurement Lead', estimatedDuration: '1 week', dependencies: ['1'] },
      { stepNumber: 3, description: 'Negotiate tier 2 pricing and updated contract terms', responsible: 'CFO', estimatedDuration: '2 weeks', dependencies: ['2'] },
    ],
    expectedImpacts: [
      { metricName: 'annual_supply_cost', displayName: 'Annual Supply Cost Savings', currentValue: 0, projectedValue: 180000, delta: 180000, deltaPercentage: 100, unit: '$', timeToImpact: '1 quarter', confidence: 70, direction: 'positive' },
    ],
    confidenceScore: 70,
    dataBasis: {
      timeframeDays: 180,
      recordCount: 2100,
      modules: ['supply_chain', 'finance'],
      dataQualityScore: 93,
      modelAccuracy: 77,
      lastDataUpdateAt: subDays(now, 3).toISOString(),
    },
    predictiveModelId: 'PM-SUPPLY-004',
    relatedRecommendationIds: ['REC-2024-0144'],
    generatedAt: subDays(now, 10).toISOString(),
    expiresAt: addDays(now, 30).toISOString(),
    lastViewedAt: subDays(now, 5).toISOString(),
    viewCount: 4,
    action: {
      id: 'ACT-002',
      recommendationId: 'REC-2024-0149',
      actionType: 'defer',
      implementationNotes: null,
      targetImplementationDate: null,
      deferUntilDate: addDays(now, 14).toISOString(),
      deferReason: 'CFO is out until next week. Need CFO involvement for vendor negotiation.',
      dismissReason: null,
      dismissComment: null,
      actionBy: 'USR-015',
      actionAt: subDays(now, 5).toISOString(),
      outcome: null,
    },
  },
];

const MOCK_OUTCOME_SUMMARY: OutcomeSummary = {
  totalAccepted: 24,
  positiveOutcomes: 18,
  neutralOutcomes: 4,
  negativeOutcomes: 2,
  successRate: 75,
  averageImpactDollars: 62000,
  averageAccuracyScore: 81,
};

const MOCK_OUTCOME_TRENDS: OutcomeTrend[] = [
  { month: '2024-04', acceptedCount: 3, successRate: 67, averageImpact: 45000 },
  { month: '2024-05', acceptedCount: 2, successRate: 50, averageImpact: 32000 },
  { month: '2024-06', acceptedCount: 4, successRate: 75, averageImpact: 58000 },
  { month: '2024-07', acceptedCount: 3, successRate: 67, averageImpact: 41000 },
  { month: '2024-08', acceptedCount: 2, successRate: 100, averageImpact: 72000 },
  { month: '2024-09', acceptedCount: 3, successRate: 67, averageImpact: 55000 },
  { month: '2024-10', acceptedCount: 2, successRate: 50, averageImpact: 38000 },
  { month: '2024-11', acceptedCount: 1, successRate: 100, averageImpact: 95000 },
  { month: '2024-12', acceptedCount: 2, successRate: 100, averageImpact: 88000 },
  { month: '2025-01', acceptedCount: 1, successRate: 100, averageImpact: 62000 },
  { month: '2025-02', acceptedCount: 0, successRate: 0, averageImpact: 0 },
  { month: '2025-03', acceptedCount: 1, successRate: 100, averageImpact: 69000 },
];

// --- Service Functions ---

export async function fetchRecommendations(
  filters?: Partial<RecommendationFilterState>,
): Promise<{ recommendations: Recommendation[]; totalCount: number; newCount: number }> {
  await new Promise((r) => setTimeout(r, 600));

  let result = [...MOCK_RECOMMENDATIONS];

  if (filters?.status && filters.status.length > 0) {
    result = result.filter((r) => filters.status!.includes(r.status));
  }
  if (filters?.priority && filters.priority.length > 0) {
    result = result.filter((r) => filters.priority!.includes(r.priority.level));
  }
  if (filters?.modules && filters.modules.length > 0) {
    result = result.filter((r) => filters.modules!.includes(r.module));
  }

  const newCount = result.filter((r) => r.status === 'active' && r.viewCount === 0).length;
  return { recommendations: result, totalCount: result.length, newCount };
}

export async function fetchRecommendationDetail(
  recommendationId: string,
): Promise<{
  recommendation: Recommendation | null;
  relatedRecommendations: Recommendation[];
  simulationPreview: SimulationPreviewData | null;
}> {
  await new Promise((r) => setTimeout(r, 400));

  const recommendation = MOCK_RECOMMENDATIONS.find((r) => r.id === recommendationId) ?? null;
  const related = recommendation
    ? MOCK_RECOMMENDATIONS.filter((r) => recommendation.relatedRecommendationIds.includes(r.id))
    : [];

  const simulationPreview: SimulationPreviewData | null = recommendation
    ? {
        simulationId: `SIM-${recommendation.id}`,
        summary: `Simulated impact of "${recommendation.title}" across affected modules.`,
        keyMetrics: recommendation.expectedImpacts.slice(0, 3).map((i) => ({
          name: i.displayName,
          value: i.projectedValue,
          unit: i.unit,
        })),
      }
    : null;

  return { recommendation, relatedRecommendations: related, simulationPreview };
}

export async function acceptRecommendation(
  recommendationId: string,
  implementationNotes: string,
  targetDate: string,
): Promise<{ action: RecommendationAction; recommendation: Recommendation }> {
  await new Promise((r) => setTimeout(r, 300));

  const rec = MOCK_RECOMMENDATIONS.find((r) => r.id === recommendationId);
  if (!rec) throw new Error(`Recommendation ${recommendationId} not found`);

  const action: RecommendationAction = {
    id: `ACT-${Date.now()}`,
    recommendationId,
    actionType: 'accept',
    implementationNotes,
    targetImplementationDate: targetDate,
    deferUntilDate: null,
    deferReason: null,
    dismissReason: null,
    dismissComment: null,
    actionBy: 'USR-001',
    actionAt: new Date().toISOString(),
    outcome: null,
  };

  return {
    action,
    recommendation: { ...rec, status: 'accepted', action },
  };
}

export async function deferRecommendation(
  recommendationId: string,
  deferUntilDate: string,
  reason?: string,
): Promise<{ action: RecommendationAction; recommendation: Recommendation }> {
  await new Promise((r) => setTimeout(r, 300));

  const rec = MOCK_RECOMMENDATIONS.find((r) => r.id === recommendationId);
  if (!rec) throw new Error(`Recommendation ${recommendationId} not found`);

  const action: RecommendationAction = {
    id: `ACT-${Date.now()}`,
    recommendationId,
    actionType: 'defer',
    implementationNotes: null,
    targetImplementationDate: null,
    deferUntilDate,
    deferReason: reason ?? null,
    dismissReason: null,
    dismissComment: null,
    actionBy: 'USR-001',
    actionAt: new Date().toISOString(),
    outcome: null,
  };

  return {
    action,
    recommendation: { ...rec, status: 'deferred', action },
  };
}

export async function dismissRecommendation(
  recommendationId: string,
  dismissReason: DismissReason,
  comment?: string,
): Promise<{ action: RecommendationAction; recommendation: Recommendation }> {
  await new Promise((r) => setTimeout(r, 300));

  const rec = MOCK_RECOMMENDATIONS.find((r) => r.id === recommendationId);
  if (!rec) throw new Error(`Recommendation ${recommendationId} not found`);

  const action: RecommendationAction = {
    id: `ACT-${Date.now()}`,
    recommendationId,
    actionType: 'dismiss',
    implementationNotes: null,
    targetImplementationDate: null,
    deferUntilDate: null,
    deferReason: null,
    dismissReason,
    dismissComment: comment ?? null,
    actionBy: 'USR-001',
    actionAt: new Date().toISOString(),
    outcome: null,
  };

  return {
    action,
    recommendation: { ...rec, status: 'dismissed', action },
  };
}

export async function fetchOutcomeSummary(): Promise<{
  summary: OutcomeSummary;
  trends: OutcomeTrend[];
}> {
  await new Promise((r) => setTimeout(r, 400));
  return { summary: MOCK_OUTCOME_SUMMARY, trends: MOCK_OUTCOME_TRENDS };
}

export async function fetchNotificationCounts(): Promise<{
  newCount: number;
  urgentCount: number;
  deferredExpiringCount: number;
  outcomesReadyCount: number;
}> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    newCount: 3,
    urgentCount: 1,
    deferredExpiringCount: 1,
    outcomesReadyCount: 2,
  };
}

export async function fetchLearningMetrics(): Promise<{
  trends: { month: string; acceptanceRate: number; outcomeAccuracy: number }[];
  isImproving: boolean;
  improvementRate: number;
}> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    trends: [
      { month: '2024-10', acceptanceRate: 32, outcomeAccuracy: 68 },
      { month: '2024-11', acceptanceRate: 38, outcomeAccuracy: 72 },
      { month: '2024-12', acceptanceRate: 42, outcomeAccuracy: 78 },
      { month: '2025-01', acceptanceRate: 45, outcomeAccuracy: 81 },
      { month: '2025-02', acceptanceRate: 48, outcomeAccuracy: 84 },
      { month: '2025-03', acceptanceRate: 51, outcomeAccuracy: 86 },
    ],
    isImproving: true,
    improvementRate: 12.5,
  };
}
