/**
 * @file simulation.constants.ts
 * @description Shared constants for the Foresight Simulation module
 * @module lib/simulation
 */

import type {
  HospitalModule,
  RiskLevel,
  ScenarioStatus,
  SimulationStage,
  VariableParameterType,
  SimulationState,
  VariableConstraints,
} from './simulation.types';

// ───────────────────────────── Module configuration ─────────────────────────────

export const HOSPITAL_MODULES: readonly HospitalModule[] = [
  'staffing',
  'bed-allocation',
  'supply-chain',
  'finance',
] as const;

export const MODULE_CONFIG: Record<
  HospitalModule,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  staffing: {
    label: 'Staffing',
    color: '#0058be',
    bgClass: 'bg-blue-100 text-secondary',
    icon: 'badge',
  },
  'bed-allocation': {
    label: 'Bed Allocation',
    color: '#2170e4',
    bgClass: 'bg-blue-50 text-secondary-container',
    icon: 'bed',
  },
  'supply-chain': {
    label: 'Supply Chain',
    color: '#f59e0b',
    bgClass: 'bg-amber-50 text-amber-700',
    icon: 'inventory_2',
  },
  finance: {
    label: 'Finance',
    color: '#009668',
    bgClass: 'bg-emerald-50 text-emerald-700',
    icon: 'account_balance',
  },
};

// ───────────────────────────── Risk levels ─────────────────────────────

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  critical: {
    label: 'Critical',
    color: '#dc2626',
    bgClass: 'bg-red-100 text-red-700',
    icon: 'error',
  },
  high: {
    label: 'High',
    color: '#ea580c',
    bgClass: 'bg-orange-100 text-orange-700',
    icon: 'warning',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgClass: 'bg-amber-100 text-amber-700',
    icon: 'info',
  },
  low: {
    label: 'Low',
    color: '#16a34a',
    bgClass: 'bg-green-100 text-green-700',
    icon: 'check_circle',
  },
  none: {
    label: 'None',
    color: '#6B7280',
    bgClass: 'bg-gray-100 text-gray-600',
    icon: 'remove_circle_outline',
  },
};

// ───────────────────────────── Scenario statuses ─────────────────────────────

export const SCENARIO_STATUS_CONFIG: Record<
  ScenarioStatus,
  { label: string; color: string; bgClass: string }
> = {
  draft: { label: 'Draft', color: '#6B7280', bgClass: 'bg-gray-100 text-gray-600' },
  ready: { label: 'Ready', color: '#0058be', bgClass: 'bg-blue-100 text-secondary' },
  running: { label: 'Running', color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: '#009668', bgClass: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', color: '#ba1a1a', bgClass: 'bg-red-100 text-red-700' },
};

// ───────────────────────────── Simulation stages ─────────────────────────────

export const SIMULATION_STAGES: { stage: SimulationStage; label: string; icon: string }[] = [
  { stage: 'validating', label: 'Validating inputs', icon: 'fact_check' },
  { stage: 'computing_staffing', label: 'Computing staffing impacts', icon: 'badge' },
  { stage: 'computing_beds', label: 'Computing bed allocation', icon: 'bed' },
  { stage: 'computing_supply_chain', label: 'Computing supply chain', icon: 'inventory_2' },
  { stage: 'computing_finance', label: 'Computing financial impact', icon: 'account_balance' },
  { stage: 'calculating_cascades', label: 'Calculating cascade effects', icon: 'device_hub' },
  { stage: 'computing_confidence', label: 'Computing confidence intervals', icon: 'analytics' },
  { stage: 'generating_narrative', label: 'Generating AI narrative', icon: 'smart_toy' },
  { stage: 'complete', label: 'Complete', icon: 'check_circle' },
];

// ───────────────────────────── Variable parameter configs ─────────────────────────────

export const VARIABLE_PARAMETER_CONFIGS: Record<
  VariableParameterType,
  { label: string; icon: string; defaultUnit: string; constraints: VariableConstraints }
> = {
  staff_count: {
    label: 'Staff Count',
    icon: 'group',
    defaultUnit: 'FTE',
    constraints: { min: 0, max: 500, step: 1 },
  },
  staff_skill_mix: {
    label: 'Skill Mix Ratio',
    icon: 'psychology',
    defaultUnit: '%',
    constraints: { min: 0, max: 100, step: 5 },
  },
  ward_status: {
    label: 'Ward Status',
    icon: 'domain',
    defaultUnit: 'wards',
    constraints: { min: 0, max: 50, step: 1 },
  },
  bed_count: {
    label: 'Bed Count',
    icon: 'bed',
    defaultUnit: 'beds',
    constraints: { min: 0, max: 1000, step: 1 },
  },
  supplier_change: {
    label: 'Supplier Change',
    icon: 'local_shipping',
    defaultUnit: '%',
    constraints: { min: -100, max: 100, step: 5 },
  },
  inventory_level: {
    label: 'Inventory Level',
    icon: 'inventory',
    defaultUnit: 'units',
    constraints: { min: 0, max: 10000, step: 100 },
  },
  budget_allocation: {
    label: 'Budget Allocation',
    icon: 'payments',
    defaultUnit: '$K',
    constraints: { min: 0, max: 50000, step: 100 },
  },
  service_line: {
    label: 'Service Line Revenue',
    icon: 'medical_services',
    defaultUnit: '$K',
    constraints: { min: 0, max: 100000, step: 500 },
  },
};

// ───────────────────────────── Chart colors ─────────────────────────────

export const CHART_COLORS = {
  primary: '#0058be',
  secondary: '#2170e4',
  tertiary: '#009668',
  warning: '#f59e0b',
  error: '#ba1a1a',
  grid: '#c6c6cd',
  axis: '#45464d',
  tooltip: '#ffffff',
  series: ['#0058be', '#009668', '#f59e0b', '#8B5CF6', '#ea580c', '#2170e4'],
};

// ───────────────────────────── Template categories ─────────────────────────────

export const TEMPLATE_CATEGORIES = [
  'Budget Planning',
  'Staff Restructuring',
  'Capacity Expansion',
  'Cost Reduction',
  'Supply Optimization',
];

// ───────────────────────────── SVG layout ─────────────────────────────

export const CASCADE_LAYER_GAP = 220;
export const CASCADE_NODE_GAP = 100;

// ───────────────────────────── Default state ─────────────────────────────

export const DEFAULT_SIMULATION_STATE: SimulationState = {
  viewMode: 'library',
  scenarios: [],
  templates: [],
  activeScenario: null,
  simulationProgress: null,
  comparisonScenarioIds: [],
  comparisonScenarios: [],
  libraryTab: 'my_scenarios',
  librarySearch: '',
  loading: false,
  error: null,
};
