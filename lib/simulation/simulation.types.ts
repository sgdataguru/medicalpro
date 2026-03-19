/**
 * @file simulation.types.ts
 * @description Type definitions for the Foresight Simulation module
 * @module lib/simulation
 */

// ───────────────────────────── Type aliases ─────────────────────────────

export type HospitalModule = 'staffing' | 'bed-allocation' | 'supply-chain' | 'finance';

export type ScenarioStatus = 'draft' | 'ready' | 'running' | 'completed' | 'failed';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type SimulationStage =
  | 'validating'
  | 'computing_staffing'
  | 'computing_beds'
  | 'computing_supply_chain'
  | 'computing_finance'
  | 'calculating_cascades'
  | 'computing_confidence'
  | 'generating_narrative'
  | 'complete';

export type VariableParameterType =
  | 'staff_count'
  | 'staff_skill_mix'
  | 'ward_status'
  | 'bed_count'
  | 'supplier_change'
  | 'inventory_level'
  | 'budget_allocation'
  | 'service_line';

export type SimulationViewMode = 'library' | 'builder' | 'results' | 'comparison';

export type LibraryTab = 'my_scenarios' | 'shared' | 'templates';

// ───────────────────────────── Core interfaces ─────────────────────────────

export interface VariableConstraints {
  min: number;
  max: number;
  step: number;
}

export interface SimulationVariable {
  id: string;
  module: HospitalModule;
  parameterType: VariableParameterType;
  label: string;
  description: string;
  currentValue: number;
  adjustedValue: number;
  unit: string;
  effectiveDate: string;
  constraints: VariableConstraints;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: ScenarioStatus;
  variables: SimulationVariable[];
  results: SimulationResults | null;
  tags: string[];
  modules: HospitalModule[];
  isShared: boolean;
  isTemplate: boolean;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  variableCount: number;
  modules: HospitalModule[];
  overallRisk: RiskLevel | null;
  tags: string[];
  isShared: boolean;
  isTemplate: boolean;
}

// ───────────────────────────── Simulation results ─────────────────────────────

export interface ModuleImpact {
  module: HospitalModule;
  metrics: ImpactMetric[];
  overallRisk: RiskLevel;
  summary: string;
}

export interface ImpactMetric {
  name: string;
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  unit: string;
  direction: 'positive' | 'negative' | 'neutral';
  risk: RiskLevel;
}

export interface CascadeNode {
  id: string;
  module: HospitalModule;
  label: string;
  value: string;
  risk: RiskLevel;
  isDirectChange: boolean;
  x: number;
  y: number;
}

export interface CascadeEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  impact: 'direct' | 'indirect';
  strength: number;
}

export interface CascadeGraph {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
}

export interface ConfidenceInterval {
  metric: string;
  module: HospitalModule;
  pointEstimate: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
  unit: string;
}

export interface ComparisonEntry {
  module: HospitalModule;
  metric: string;
  currentValue: number;
  projectedValue: number;
  delta: number;
  deltaPercentage: number;
  risk: RiskLevel;
  unit: string;
}

export interface RiskFactor {
  description: string;
  module: HospitalModule;
  severity: RiskLevel;
  likelihood: number;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationSuggestions: string[];
}

export interface SimulationResults {
  scenarioId: string;
  executedAt: string;
  executionDurationMs: number;
  moduleImpacts: ModuleImpact[];
  cascadeGraph: CascadeGraph;
  confidenceIntervals: ConfidenceInterval[];
  narrativeSummary: string;
  riskAssessment: RiskAssessment;
  beforeAfterComparison: ComparisonEntry[];
}

// ───────────────────────────── Progress ─────────────────────────────

export interface SimulationProgress {
  scenarioId: string;
  stage: SimulationStage;
  stageProgress: number;
  overallProgress: number;
  currentMessage: string;
}

// ───────────────────────────── NLP ─────────────────────────────

export interface NlpParseResult {
  variables: Omit<SimulationVariable, 'id'>[];
  interpretation: string;
  confidence: number;
  clarificationNeeded: boolean;
  clarificationPrompt?: string;
}

// ───────────────────────────── Templates ─────────────────────────────

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  variables: Omit<SimulationVariable, 'id'>[];
  popularity: number;
}

// ───────────────────────────── State & Reducer ─────────────────────────────

export interface SimulationState {
  viewMode: SimulationViewMode;
  scenarios: ScenarioSummary[];
  templates: ScenarioTemplate[];
  activeScenario: Scenario | null;
  simulationProgress: SimulationProgress | null;
  comparisonScenarioIds: string[];
  comparisonScenarios: Scenario[];
  libraryTab: LibraryTab;
  librarySearch: string;
  loading: boolean;
  error: string | null;
}

export type SimulationAction =
  | { type: 'SET_VIEW_MODE'; payload: SimulationViewMode }
  | { type: 'SET_SCENARIOS'; payload: ScenarioSummary[] }
  | { type: 'SET_TEMPLATES'; payload: ScenarioTemplate[] }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: Scenario | null }
  | { type: 'UPDATE_SCENARIO_NAME'; payload: string }
  | { type: 'UPDATE_SCENARIO_DESCRIPTION'; payload: string }
  | { type: 'ADD_VARIABLE'; payload: SimulationVariable }
  | { type: 'UPDATE_VARIABLE'; payload: SimulationVariable }
  | { type: 'REMOVE_VARIABLE'; payload: string }
  | { type: 'SET_SIMULATION_PROGRESS'; payload: SimulationProgress | null }
  | { type: 'SET_SIMULATION_RESULTS'; payload: SimulationResults }
  | { type: 'SET_SCENARIO_STATUS'; payload: ScenarioStatus }
  | { type: 'SET_COMPARISON_IDS'; payload: string[] }
  | { type: 'SET_COMPARISON_SCENARIOS'; payload: Scenario[] }
  | { type: 'SET_LIBRARY_TAB'; payload: LibraryTab }
  | { type: 'SET_LIBRARY_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
