/**
 * @file simulation.service.ts
 * @description Mock service layer for the Foresight Simulation module.
 *              Provides CRUD operations, a deterministic simulation engine,
 *              progress tracking, NLP parsing, and template management.
 * @module lib/simulation
 */

import type {
  HospitalModule,
  RiskLevel,
  SimulationVariable,
  Scenario,
  ScenarioSummary,
  ScenarioTemplate,
  SimulationResults,
  SimulationProgress,
  SimulationStage,
  ModuleImpact,
  ImpactMetric,
  CascadeNode,
  CascadeEdge,
  CascadeGraph,
  ConfidenceInterval,
  ComparisonEntry,
  RiskAssessment,
  RiskFactor,
  NlpParseResult,
  VariableParameterType,
} from './simulation.types';
import { HOSPITAL_MODULES, MODULE_CONFIG, SIMULATION_STAGES, VARIABLE_PARAMETER_CONFIGS } from './simulation.constants';
import { computeRiskLevel, calculateCascadeLayout, buildConfidenceIntervalBounds } from './simulation.utils';

// ───────────────────────────── Helpers ─────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextId = 100;
function generateId(): string {
  return `sim-${++nextId}-${Date.now().toString(36)}`;
}

// ───────────────────────────── Mock available variables ─────────────────────────────

const MOCK_AVAILABLE_VARIABLES: Record<HospitalModule, Omit<SimulationVariable, 'id'>[]> = {
  staffing: [
    {
      module: 'staffing',
      parameterType: 'staff_count',
      label: 'ICU Nursing Staff',
      description: 'Number of full-time equivalent nurses in ICU department',
      currentValue: 45,
      adjustedValue: 45,
      unit: 'FTE',
      effectiveDate: '2026-04-01',
      constraints: { min: 10, max: 120, step: 1 },
    },
    {
      module: 'staffing',
      parameterType: 'staff_count',
      label: 'Emergency Physicians',
      description: 'Number of full-time equivalent physicians in emergency department',
      currentValue: 22,
      adjustedValue: 22,
      unit: 'FTE',
      effectiveDate: '2026-04-01',
      constraints: { min: 5, max: 60, step: 1 },
    },
    {
      module: 'staffing',
      parameterType: 'staff_skill_mix',
      label: 'Senior Nurse Ratio',
      description: 'Percentage of senior-level nurses across the facility',
      currentValue: 35,
      adjustedValue: 35,
      unit: '%',
      effectiveDate: '2026-04-01',
      constraints: { min: 0, max: 100, step: 5 },
    },
  ],
  'bed-allocation': [
    {
      module: 'bed-allocation',
      parameterType: 'bed_count',
      label: 'ICU Beds',
      description: 'Total ICU bed capacity',
      currentValue: 60,
      adjustedValue: 60,
      unit: 'beds',
      effectiveDate: '2026-04-01',
      constraints: { min: 10, max: 200, step: 1 },
    },
    {
      module: 'bed-allocation',
      parameterType: 'bed_count',
      label: 'General Ward Beds',
      description: 'Total general ward bed capacity',
      currentValue: 320,
      adjustedValue: 320,
      unit: 'beds',
      effectiveDate: '2026-04-01',
      constraints: { min: 50, max: 800, step: 5 },
    },
    {
      module: 'bed-allocation',
      parameterType: 'ward_status',
      label: 'Active Wards',
      description: 'Number of operational patient wards',
      currentValue: 18,
      adjustedValue: 18,
      unit: 'wards',
      effectiveDate: '2026-04-01',
      constraints: { min: 5, max: 40, step: 1 },
    },
  ],
  'supply-chain': [
    {
      module: 'supply-chain',
      parameterType: 'supplier_change',
      label: 'Primary Supplier Cost Change',
      description: 'Expected change in primary supplier pricing',
      currentValue: 0,
      adjustedValue: 0,
      unit: '%',
      effectiveDate: '2026-04-01',
      constraints: { min: -50, max: 50, step: 5 },
    },
    {
      module: 'supply-chain',
      parameterType: 'inventory_level',
      label: 'PPE Inventory Buffer',
      description: 'Personal protective equipment stock buffer level',
      currentValue: 5000,
      adjustedValue: 5000,
      unit: 'units',
      effectiveDate: '2026-04-01',
      constraints: { min: 500, max: 10000, step: 100 },
    },
  ],
  finance: [
    {
      module: 'finance',
      parameterType: 'budget_allocation',
      label: 'Operating Budget',
      description: 'Total quarterly operating budget allocation',
      currentValue: 12500,
      adjustedValue: 12500,
      unit: '$K',
      effectiveDate: '2026-Q2',
      constraints: { min: 5000, max: 30000, step: 500 },
    },
    {
      module: 'finance',
      parameterType: 'service_line',
      label: 'Surgical Revenue',
      description: 'Projected quarterly surgical service line revenue',
      currentValue: 8200,
      adjustedValue: 8200,
      unit: '$K',
      effectiveDate: '2026-Q2',
      constraints: { min: 2000, max: 20000, step: 500 },
    },
  ],
};

// ───────────────────────────── Mock scenario summaries ─────────────────────────────

const MOCK_SCENARIOS: ScenarioSummary[] = [
  {
    id: 'scn-001',
    name: 'Q2 Staffing Reduction Impact',
    description: 'Assess the impact of reducing ICU nursing staff by 15% while maintaining current bed capacity.',
    status: 'completed',
    createdBy: 'Dr. Sarah Chen',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-03-01T14:22:00Z',
    variableCount: 3,
    modules: ['staffing', 'bed-allocation'],
    overallRisk: 'high',
    tags: ['staffing', 'Q2-planning'],
    isShared: false,
    isTemplate: false,
  },
  {
    id: 'scn-002',
    name: 'Bed Expansion Phase 1',
    description: 'Evaluate adding 40 general ward beds and 10 ICU beds with proportional staffing increase.',
    status: 'completed',
    createdBy: 'Dr. Sarah Chen',
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-03-05T16:45:00Z',
    variableCount: 4,
    modules: ['bed-allocation', 'staffing', 'finance'],
    overallRisk: 'medium',
    tags: ['expansion', 'capital'],
    isShared: true,
    isTemplate: false,
  },
  {
    id: 'scn-003',
    name: 'Supply Chain Disruption Scenario',
    description: 'Model the effect of a 25% increase in primary supplier costs with reduced PPE inventory buffers.',
    status: 'draft',
    createdBy: 'Dr. Sarah Chen',
    createdAt: '2026-03-08T08:15:00Z',
    updatedAt: '2026-03-08T08:15:00Z',
    variableCount: 2,
    modules: ['supply-chain', 'finance'],
    overallRisk: null,
    tags: ['supply-chain', 'risk'],
    isShared: false,
    isTemplate: false,
  },
  {
    id: 'scn-004',
    name: 'Budget Optimization: Surgical Services',
    description: 'Shift 10% of budget allocation toward surgical services to increase revenue while maintaining quality.',
    status: 'completed',
    createdBy: 'James Wilson',
    createdAt: '2026-01-10T13:00:00Z',
    updatedAt: '2026-02-28T10:30:00Z',
    variableCount: 3,
    modules: ['finance', 'staffing'],
    overallRisk: 'low',
    tags: ['finance', 'optimization'],
    isShared: true,
    isTemplate: false,
  },
  {
    id: 'scn-005',
    name: 'Full Cross-Module Stress Test',
    description: 'Comprehensive scenario testing simultaneous changes across all hospital modules under budget constraints.',
    status: 'completed',
    createdBy: 'Dr. Sarah Chen',
    createdAt: '2026-03-10T07:00:00Z',
    updatedAt: '2026-03-12T18:00:00Z',
    variableCount: 8,
    modules: ['staffing', 'bed-allocation', 'supply-chain', 'finance'],
    overallRisk: 'critical',
    tags: ['stress-test', 'cross-module'],
    isShared: false,
    isTemplate: false,
  },
  {
    id: 'scn-006',
    name: 'Nurse Recruitment Drive Model',
    description: 'Project impacts of a 20% increase in nursing staff across all departments over next quarter.',
    status: 'ready',
    createdBy: 'James Wilson',
    createdAt: '2026-03-14T09:45:00Z',
    updatedAt: '2026-03-14T09:45:00Z',
    variableCount: 2,
    modules: ['staffing', 'finance'],
    overallRisk: null,
    tags: ['staffing', 'recruitment'],
    isShared: false,
    isTemplate: false,
  },
];

// ───────────────────────────── Mock templates ─────────────────────────────

const MOCK_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Staff Reduction Assessment',
    description: 'Evaluate impact of reducing staff headcount across departments.',
    category: 'Staff Restructuring',
    variables: [
      { module: 'staffing', parameterType: 'staff_count', label: 'Nursing Staff', description: 'Total nursing FTE', currentValue: 200, adjustedValue: 170, unit: 'FTE', effectiveDate: '2026-Q2', constraints: { min: 50, max: 400, step: 1 } },
      { module: 'staffing', parameterType: 'staff_skill_mix', label: 'Senior Nurse Ratio', description: 'Percentage of senior nurses', currentValue: 35, adjustedValue: 40, unit: '%', effectiveDate: '2026-Q2', constraints: { min: 0, max: 100, step: 5 } },
    ],
    popularity: 87,
  },
  {
    id: 'tpl-002',
    name: 'Capacity Expansion Plan',
    description: 'Model bed capacity increase with required staffing and budget impacts.',
    category: 'Capacity Expansion',
    variables: [
      { module: 'bed-allocation', parameterType: 'bed_count', label: 'General Ward Beds', description: 'New bed total', currentValue: 320, adjustedValue: 380, unit: 'beds', effectiveDate: '2026-Q3', constraints: { min: 100, max: 800, step: 5 } },
      { module: 'staffing', parameterType: 'staff_count', label: 'Additional Nursing Staff', description: 'Nurses to support expansion', currentValue: 200, adjustedValue: 230, unit: 'FTE', effectiveDate: '2026-Q3', constraints: { min: 50, max: 400, step: 1 } },
      { module: 'finance', parameterType: 'budget_allocation', label: 'Capital Budget', description: 'Budget for expansion', currentValue: 12500, adjustedValue: 15000, unit: '$K', effectiveDate: '2026-Q3', constraints: { min: 5000, max: 30000, step: 500 } },
    ],
    popularity: 92,
  },
  {
    id: 'tpl-003',
    name: 'Annual Budget Planning',
    description: 'Standard budget allocation scenario across all departments.',
    category: 'Budget Planning',
    variables: [
      { module: 'finance', parameterType: 'budget_allocation', label: 'Operating Budget', description: 'Quarterly operating budget', currentValue: 12500, adjustedValue: 13000, unit: '$K', effectiveDate: '2026-Q2', constraints: { min: 5000, max: 30000, step: 500 } },
      { module: 'finance', parameterType: 'service_line', label: 'Surgical Revenue Target', description: 'Target surgical revenue', currentValue: 8200, adjustedValue: 9000, unit: '$K', effectiveDate: '2026-Q2', constraints: { min: 2000, max: 20000, step: 500 } },
    ],
    popularity: 78,
  },
  {
    id: 'tpl-004',
    name: 'Supply Chain Risk Scenario',
    description: 'Model supply chain disruptions and cost increases.',
    category: 'Supply Optimization',
    variables: [
      { module: 'supply-chain', parameterType: 'supplier_change', label: 'Supplier Cost Change', description: 'Cost impact from supplier change', currentValue: 0, adjustedValue: 15, unit: '%', effectiveDate: '2026-Q2', constraints: { min: -50, max: 50, step: 5 } },
      { module: 'supply-chain', parameterType: 'inventory_level', label: 'Safety Stock Level', description: 'Minimum inventory buffer', currentValue: 5000, adjustedValue: 3500, unit: 'units', effectiveDate: '2026-Q2', constraints: { min: 500, max: 10000, step: 100 } },
    ],
    popularity: 65,
  },
  {
    id: 'tpl-005',
    name: 'Cost Reduction Initiative',
    description: 'Identify savings through staffing optimization and supply negotiations.',
    category: 'Cost Reduction',
    variables: [
      { module: 'staffing', parameterType: 'staff_count', label: 'Administrative Staff', description: 'Admin FTE reduction', currentValue: 80, adjustedValue: 68, unit: 'FTE', effectiveDate: '2026-Q2', constraints: { min: 20, max: 150, step: 1 } },
      { module: 'supply-chain', parameterType: 'supplier_change', label: 'Renegotiated Supplier Rate', description: 'New supplier contract rate', currentValue: 0, adjustedValue: -10, unit: '%', effectiveDate: '2026-Q2', constraints: { min: -50, max: 50, step: 5 } },
      { module: 'finance', parameterType: 'budget_allocation', label: 'Reduced Operating Budget', description: 'Target lower operating budget', currentValue: 12500, adjustedValue: 11000, unit: '$K', effectiveDate: '2026-Q2', constraints: { min: 5000, max: 30000, step: 500 } },
    ],
    popularity: 71,
  },
];

// ───────────────────────────── Mock scenario detail (for scn-001) ─────────────────────────────

function buildMockScenarioDetail(id: string): Scenario | null {
  const summary = MOCK_SCENARIOS.find((s) => s.id === id);
  if (!summary) return null;

  const variables: SimulationVariable[] = [];
  const moduleVars = MOCK_AVAILABLE_VARIABLES;

  for (const mod of summary.modules) {
    const available = moduleVars[mod];
    if (available && available.length > 0) {
      variables.push({ ...available[0], id: generateId(), adjustedValue: available[0].currentValue * 0.85 });
    }
  }

  return {
    id: summary.id,
    name: summary.name,
    description: summary.description,
    createdBy: summary.createdBy,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
    status: summary.status,
    variables,
    results: summary.status === 'completed' ? buildMockResults(summary.id, variables) : null,
    tags: summary.tags,
    modules: summary.modules,
    isShared: summary.isShared,
    isTemplate: summary.isTemplate,
  };
}

// ───────────────────────────── Simulation engine (mock) ─────────────────────────────

function buildMockResults(scenarioId: string, variables: SimulationVariable[]): SimulationResults {
  const startTime = Date.now();
  const moduleImpacts = buildModuleImpacts(variables);
  const cascadeGraph = buildCascadeGraph(variables, moduleImpacts);
  const confidenceIntervals = buildConfidenceIntervals(moduleImpacts);
  const beforeAfterComparison = buildComparison(moduleImpacts);
  const riskAssessment = buildRiskAssessment(moduleImpacts);
  const narrativeSummary = buildNarrative(variables, moduleImpacts, riskAssessment);

  return {
    scenarioId,
    executedAt: new Date().toISOString(),
    executionDurationMs: Date.now() - startTime + 3200,
    moduleImpacts,
    cascadeGraph,
    confidenceIntervals,
    narrativeSummary,
    riskAssessment,
    beforeAfterComparison,
  };
}

function buildModuleImpacts(variables: SimulationVariable[]): ModuleImpact[] {
  const moduleMap = new Map<HospitalModule, SimulationVariable[]>();
  for (const v of variables) {
    const list = moduleMap.get(v.module) ?? [];
    list.push(v);
    moduleMap.set(v.module, list);
  }

  const impacts: ModuleImpact[] = [];

  for (const [mod, vars] of moduleMap.entries()) {
    const metrics = vars.map((v) => buildImpactMetric(v));
    const maxDelta = Math.max(...metrics.map((m) => Math.abs(m.deltaPercentage)));
    const overallRisk = computeRiskLevel(maxDelta);
    const config = MODULE_CONFIG[mod];

    impacts.push({
      module: mod,
      metrics,
      overallRisk,
      summary: `${config.label}: ${metrics.length} variable${metrics.length > 1 ? 's' : ''} adjusted. Maximum projected change of ${maxDelta.toFixed(1)}%.`,
    });
  }

  // Add indirect impacts for modules not directly changed
  for (const mod of HOSPITAL_MODULES) {
    if (!moduleMap.has(mod) && variables.length > 0) {
      const indirectDelta = variables.reduce((sum, v) => sum + Math.abs(v.adjustedValue - v.currentValue) / Math.max(v.currentValue, 1), 0) * 3;
      const config = MODULE_CONFIG[mod];
      impacts.push({
        module: mod,
        metrics: [{
          name: `${config.label} Efficiency`,
          currentValue: 85,
          projectedValue: 85 - indirectDelta,
          delta: -indirectDelta,
          deltaPercentage: -(indirectDelta / 85) * 100,
          unit: '%',
          direction: indirectDelta > 0 ? 'negative' : 'neutral',
          risk: computeRiskLevel((indirectDelta / 85) * 100),
        }],
        overallRisk: computeRiskLevel((indirectDelta / 85) * 100),
        summary: `${config.label}: indirect impact from cross-module changes. Projected efficiency change of ${indirectDelta.toFixed(1)}%.`,
      });
    }
  }

  return impacts;
}

function buildImpactMetric(variable: SimulationVariable): ImpactMetric {
  const delta = variable.adjustedValue - variable.currentValue;
  const deltaPercentage = variable.currentValue !== 0
    ? (delta / variable.currentValue) * 100
    : delta > 0 ? 100 : 0;

  return {
    name: variable.label,
    currentValue: variable.currentValue,
    projectedValue: variable.adjustedValue,
    delta,
    deltaPercentage,
    unit: variable.unit,
    direction: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    risk: computeRiskLevel(deltaPercentage),
  };
}

function buildCascadeGraph(variables: SimulationVariable[], impacts: ModuleImpact[]): CascadeGraph {
  const nodes: CascadeNode[] = [];
  const edges: CascadeEdge[] = [];

  // Create direct change nodes from variables
  for (const v of variables) {
    const delta = v.adjustedValue - v.currentValue;
    const deltaPct = v.currentValue !== 0 ? (delta / v.currentValue) * 100 : 0;
    nodes.push({
      id: `node-${v.module}-${v.parameterType}`,
      module: v.module,
      label: v.label,
      value: `${delta >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`,
      risk: computeRiskLevel(deltaPct),
      isDirectChange: true,
      x: 0,
      y: 0,
    });
  }

  // Create indirect impact nodes for each module
  for (const impact of impacts) {
    for (const metric of impact.metrics) {
      const existingNode = nodes.find(
        (n) => n.module === impact.module && n.label === metric.name,
      );
      if (!existingNode) {
        nodes.push({
          id: `node-${impact.module}-indirect-${metric.name.replace(/\s+/g, '-').toLowerCase()}`,
          module: impact.module,
          label: metric.name,
          value: `${metric.delta >= 0 ? '+' : ''}${metric.deltaPercentage.toFixed(1)}%`,
          risk: metric.risk,
          isDirectChange: false,
          x: 0,
          y: 0,
        });
      }
    }
  }

  // Create edges from direct nodes to indirect nodes
  for (const directNode of nodes.filter((n) => n.isDirectChange)) {
    for (const indirectNode of nodes.filter((n) => !n.isDirectChange)) {
      if (directNode.module === indirectNode.module) {
        edges.push({
          id: `edge-${directNode.id}-${indirectNode.id}`,
          sourceNodeId: directNode.id,
          targetNodeId: indirectNode.id,
          label: 'direct',
          impact: 'direct',
          strength: 0.8,
        });
      } else {
        edges.push({
          id: `edge-${directNode.id}-${indirectNode.id}`,
          sourceNodeId: directNode.id,
          targetNodeId: indirectNode.id,
          label: 'cascade',
          impact: 'indirect',
          strength: 0.4,
        });
      }
    }
  }

  const layoutNodes = calculateCascadeLayout(nodes, edges);

  return { nodes: layoutNodes, edges };
}

function buildConfidenceIntervals(impacts: ModuleImpact[]): ConfidenceInterval[] {
  const intervals: ConfidenceInterval[] = [];
  for (const impact of impacts) {
    for (const metric of impact.metrics) {
      const bounds = buildConfidenceIntervalBounds(metric.projectedValue, 0.95);
      intervals.push({
        metric: metric.name,
        module: impact.module,
        pointEstimate: metric.projectedValue,
        lowerBound: bounds.lower,
        upperBound: bounds.upper,
        confidenceLevel: 0.95,
        unit: metric.unit,
      });
    }
  }
  return intervals;
}

function buildComparison(impacts: ModuleImpact[]): ComparisonEntry[] {
  const entries: ComparisonEntry[] = [];
  for (const impact of impacts) {
    for (const metric of impact.metrics) {
      entries.push({
        module: impact.module,
        metric: metric.name,
        currentValue: metric.currentValue,
        projectedValue: metric.projectedValue,
        delta: metric.delta,
        deltaPercentage: metric.deltaPercentage,
        risk: metric.risk,
        unit: metric.unit,
      });
    }
  }
  return entries;
}

function buildRiskAssessment(impacts: ModuleImpact[]): RiskAssessment {
  const riskFactors: RiskFactor[] = [];

  for (const impact of impacts) {
    for (const metric of impact.metrics) {
      if (metric.risk === 'critical' || metric.risk === 'high') {
        riskFactors.push({
          description: `${metric.name}: ${metric.deltaPercentage.toFixed(1)}% change poses ${metric.risk} risk`,
          module: impact.module,
          severity: metric.risk,
          likelihood: metric.risk === 'critical' ? 0.85 : 0.65,
        });
      }
    }
  }

  const riskOrder: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
  const maxRisk = impacts.reduce<RiskLevel>(
    (worst, impact) => riskOrder[impact.overallRisk] > riskOrder[worst] ? impact.overallRisk : worst,
    'none',
  );

  const mitigationSuggestions: string[] = [];
  if (riskFactors.some((f) => f.module === 'staffing')) {
    mitigationSuggestions.push('Consider a phased staffing transition with temporary agency cover to reduce operational risk.');
  }
  if (riskFactors.some((f) => f.module === 'bed-allocation')) {
    mitigationSuggestions.push('Implement a flexible bed management protocol to adapt to demand fluctuations during the transition.');
  }
  if (riskFactors.some((f) => f.module === 'supply-chain')) {
    mitigationSuggestions.push('Establish secondary supply agreements and increase safety stock levels before implementing changes.');
  }
  if (riskFactors.some((f) => f.module === 'finance')) {
    mitigationSuggestions.push('Set aside a contingency budget of 5-10% to absorb unexpected cost overruns during the implementation period.');
  }
  if (mitigationSuggestions.length === 0) {
    mitigationSuggestions.push('Risk levels are within acceptable thresholds. Continue to monitor key metrics during implementation.');
  }

  return { overallRisk: maxRisk, riskFactors, mitigationSuggestions };
}

function buildNarrative(
  variables: SimulationVariable[],
  impacts: ModuleImpact[],
  riskAssessment: RiskAssessment,
): string {
  const moduleNames = [...new Set(variables.map((v) => MODULE_CONFIG[v.module].label))];
  const highRiskModules = impacts.filter((i) => i.overallRisk === 'critical' || i.overallRisk === 'high');

  let narrative = `This simulation analyzed changes across ${moduleNames.join(', ')} with ${variables.length} variables adjusted. `;

  if (highRiskModules.length > 0) {
    narrative += `The analysis identified ${highRiskModules.length} module${highRiskModules.length > 1 ? 's' : ''} with elevated risk levels: ${highRiskModules.map((m) => MODULE_CONFIG[m.module].label).join(' and ')}. `;
  } else {
    narrative += 'The analysis found risk levels within acceptable bounds across all modules. ';
  }

  narrative += `Overall risk assessment: ${riskAssessment.overallRisk.toUpperCase()}. `;

  if (riskAssessment.riskFactors.length > 0) {
    narrative += `Key risk factors include: ${riskAssessment.riskFactors.map((f) => f.description).join('; ')}. `;
  }

  narrative += riskAssessment.mitigationSuggestions.length > 0
    ? `Recommended actions: ${riskAssessment.mitigationSuggestions[0]}`
    : 'No immediate mitigation actions required.';

  return narrative;
}

// ───────────────────────────── In-memory store ─────────────────────────────

const scenarioStore = new Map<string, Scenario>();

// ───────────────────────────── Public service functions ─────────────────────────────

/** Fetch all scenario summaries. */
export async function fetchScenarios(): Promise<ScenarioSummary[]> {
  await delay(400);

  // Merge stored custom scenarios with mock data
  const custom: ScenarioSummary[] = Array.from(scenarioStore.values()).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    status: s.status,
    createdBy: s.createdBy,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    variableCount: s.variables.length,
    modules: s.modules,
    overallRisk: s.results?.riskAssessment.overallRisk ?? null,
    tags: s.tags,
    isShared: s.isShared,
    isTemplate: s.isTemplate,
  }));

  return [...MOCK_SCENARIOS, ...custom];
}

/** Fetch full scenario detail by ID. */
export async function fetchScenarioDetail(id: string): Promise<Scenario> {
  await delay(300);

  const stored = scenarioStore.get(id);
  if (stored) return stored;

  const mock = buildMockScenarioDetail(id);
  if (mock) return mock;

  throw new Error(`Scenario not found: ${id}`);
}

/** Create a new empty scenario. */
export async function createScenario(name: string, description: string): Promise<Scenario> {
  await delay(200);

  const scenario: Scenario = {
    id: generateId(),
    name,
    description,
    createdBy: 'Dr. Sarah Chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    variables: [],
    results: null,
    tags: [],
    modules: [],
    isShared: false,
    isTemplate: false,
  };

  scenarioStore.set(scenario.id, scenario);
  return scenario;
}

/** Update an existing scenario. */
export async function updateScenario(scenario: Scenario): Promise<Scenario> {
  await delay(200);

  const updated: Scenario = {
    ...scenario,
    updatedAt: new Date().toISOString(),
    modules: [...new Set(scenario.variables.map((v) => v.module))],
  };

  scenarioStore.set(updated.id, updated);
  return updated;
}

/** Delete a scenario by ID. */
export async function deleteScenario(id: string): Promise<void> {
  await delay(200);
  scenarioStore.delete(id);
}

/** Fetch available variables for a given module. */
export async function fetchAvailableVariables(
  module: HospitalModule,
): Promise<Omit<SimulationVariable, 'id'>[]> {
  await delay(200);
  return MOCK_AVAILABLE_VARIABLES[module] ?? [];
}

/** Run the simulation engine on a set of variables. */
export async function runSimulation(
  scenarioId: string,
  variables: SimulationVariable[],
): Promise<SimulationResults> {
  await delay(500);
  return buildMockResults(scenarioId, variables);
}

/** Simulate progress updates during a simulation run. */
export async function simulateProgress(
  scenarioId: string,
  onProgress: (progress: SimulationProgress) => void,
): Promise<void> {
  const stages = SIMULATION_STAGES;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const overallProgress = ((i + 1) / stages.length) * 100;

    // Sub-step progress within each stage
    for (let sub = 0; sub <= 100; sub += 25) {
      onProgress({
        scenarioId,
        stage: stage.stage,
        stageProgress: sub,
        overallProgress: ((i / stages.length) * 100) + (sub / stages.length),
        currentMessage: stage.label + (sub < 100 ? '...' : ''),
      });
      await delay(150);
    }

    onProgress({
      scenarioId,
      stage: stage.stage,
      stageProgress: 100,
      overallProgress,
      currentMessage: stage.label,
    });
  }
}

/** Fetch scenario templates. */
export async function fetchTemplates(): Promise<ScenarioTemplate[]> {
  await delay(300);
  return MOCK_TEMPLATES;
}

/** Parse natural language input into simulation variables (mock). */
export async function parseNaturalLanguage(input: string): Promise<NlpParseResult> {
  await delay(800);

  const lower = input.toLowerCase();
  const variables: Omit<SimulationVariable, 'id'>[] = [];
  let interpretation = '';
  let confidence = 0;
  let clarificationNeeded = false;
  let clarificationPrompt: string | undefined;

  // Match "reduce/decrease/cut ... staff/nurse/physician ... by X%"
  const staffMatch = lower.match(/(?:reduce|decrease|cut)\s+(?:\w+\s+)*(?:staff|nurse|physician|nursing)\s+(?:\w+\s+)*by\s+(\d+)%?/);
  if (staffMatch) {
    const pct = parseInt(staffMatch[1], 10);
    const base = MOCK_AVAILABLE_VARIABLES.staffing[0];
    variables.push({
      ...base,
      adjustedValue: Math.round(base.currentValue * (1 - pct / 100)),
    });
    interpretation += `Reduce nursing staff by ${pct}%. `;
    confidence = 0.85;
  }

  // Match "increase/add ... beds ... by X"
  const bedMatch = lower.match(/(?:increase|add|expand)\s+(?:\w+\s+)*(?:bed|beds)\s+(?:\w+\s+)*(?:by\s+)?(\d+)/);
  if (bedMatch) {
    const count = parseInt(bedMatch[1], 10);
    const base = MOCK_AVAILABLE_VARIABLES['bed-allocation'][0];
    variables.push({
      ...base,
      adjustedValue: base.currentValue + count,
    });
    interpretation += `Add ${count} beds. `;
    confidence = Math.max(confidence, 0.80);
  }

  // Match "budget ... X%" or "budget ... $XK"
  const budgetMatch = lower.match(/(?:budget|spending|cost)\s+(?:\w+\s+)*(?:by\s+)?(\d+)(%|k|\$)/i);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1], 10);
    const base = MOCK_AVAILABLE_VARIABLES.finance[0];
    const isPercent = budgetMatch[2] === '%';
    variables.push({
      ...base,
      adjustedValue: isPercent ? Math.round(base.currentValue * (1 + amount / 100)) : base.currentValue + amount,
    });
    interpretation += `Adjust budget by ${amount}${budgetMatch[2]}. `;
    confidence = Math.max(confidence, 0.75);
  }

  // Match "supplier ... X%"
  const supplyMatch = lower.match(/(?:supplier|supply)\s+(?:\w+\s+)*(?:by\s+)?(\d+)%/);
  if (supplyMatch) {
    const pct = parseInt(supplyMatch[1], 10);
    const base = MOCK_AVAILABLE_VARIABLES['supply-chain'][0];
    variables.push({
      ...base,
      adjustedValue: pct,
    });
    interpretation += `Supplier cost change of ${pct}%. `;
    confidence = Math.max(confidence, 0.70);
  }

  if (variables.length === 0) {
    clarificationNeeded = true;
    clarificationPrompt = 'I could not parse specific changes from your input. Try phrases like "reduce nursing staff by 15%" or "add 20 ICU beds".';
    confidence = 0.2;
    interpretation = 'Unable to extract specific variable changes.';
  }

  return {
    variables,
    interpretation: interpretation.trim(),
    confidence,
    clarificationNeeded,
    clarificationPrompt,
  };
}

/** Share a scenario (mock — toggles isShared flag). */
export async function shareScenario(id: string): Promise<{ shareUrl: string }> {
  await delay(300);

  const stored = scenarioStore.get(id);
  if (stored) {
    stored.isShared = true;
    scenarioStore.set(id, stored);
  }

  return { shareUrl: `https://app.sovereign-analyst.io/simulations/shared/${id}` };
}
