/**
 * @file sandbox.constants.ts
 * @description Constants for the Sandbox Demo module
 * @module lib/sandbox
 */

import type {
  SandboxConfig,
  SandboxSessionState,
  SandboxFeatureUsage,
  TourStep,
  FeaturePreview,
  ModuleNavItem,
  SuggestionScenario,
} from './sandbox.types';

// ===== Default Configuration =====

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  sessionTtlMs: 4 * 60 * 60 * 1000,         // 4 hours
  maxExtensions: 1,
  extensionDurationMs: 60 * 60 * 1000,       // 1 hour
  maxSimulationsPerSession: 10,
};

// ===== Default Feature Usage =====

export const DEFAULT_FEATURE_USAGE: SandboxFeatureUsage = {
  staffing: 'not_visited',
  bedAllocation: 'not_visited',
  supplyChain: 'not_visited',
  finance: 'not_visited',
  anomalyDetection: 'not_visited',
  simulation: 'not_visited',
  governance: 'not_visited',
};

// ===== Default Session State =====

export const DEFAULT_SESSION_STATE: SandboxSessionState = {
  sessionId: '',
  status: 'provisioning',
  createdAt: '',
  expiresAt: '',
  timeRemainingMs: DEFAULT_SANDBOX_CONFIG.sessionTtlMs,
  extensionsUsed: 0,
  maxExtensions: DEFAULT_SANDBOX_CONFIG.maxExtensions,
  features: { ...DEFAULT_FEATURE_USAGE },
  simulationsRun: 0,
  maxSimulations: DEFAULT_SANDBOX_CONFIG.maxSimulationsPerSession,
  tourCompleted: false,
  tourStep: 0,
};

// ===== Guided Tour Steps =====

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Farrer Park Hospital',
    description:
      'This sandbox gives you hands-on experience with our hospital analytics platform using realistic synthetic data. Nothing you do here affects real systems.',
    targetSelector: '[data-tour="dashboard-header"]',
    position: 'bottom',
    order: 0,
  },
  {
    id: 'modules',
    title: 'Explore Operational Modules',
    description:
      'Each card represents a core module — staffing, beds, supply chain, finance, and anomaly detection. Click any card to dive into detailed dashboards.',
    targetSelector: '[data-tour="module-grid"]',
    position: 'bottom',
    order: 1,
  },
  {
    id: 'simulation',
    title: 'Run What-If Simulations',
    description:
      'Test scenarios like "What if we reduce nursing staff by 20%?" and see cascading impacts across all modules in real time.',
    targetSelector: '[data-tour="simulation-prompt"]',
    position: 'top',
    order: 2,
  },
  {
    id: 'anomalies',
    title: 'Anomaly Detection',
    description:
      'Our AI continuously monitors hospital data streams for irregularities — from billing anomalies to supply chain disruptions.',
    targetSelector: '[data-tour="anomaly-card"]',
    position: 'right',
    order: 3,
  },
  {
    id: 'session-info',
    title: 'Track Your Progress',
    description:
      'See which features you\'ve explored, how many simulations you\'ve run, and your remaining session time. When ready, request a full demo!',
    targetSelector: '[data-tour="session-info"]',
    position: 'top',
    order: 4,
  },
];

// ===== Feature Preview Cards (Landing Page) =====

export const FEATURE_PREVIEWS: FeaturePreview[] = [
  {
    icon: 'analytics',
    title: 'Predictive Analytics',
    description:
      'See staffing forecasts, bed occupancy trends, and supply chain projections powered by historical data analysis.',
  },
  {
    icon: 'labs',
    title: 'What-If Simulations',
    description:
      'Run scenarios before committing to decisions. Model cascading impacts across departments in real time.',
  },
  {
    icon: 'warning',
    title: 'Anomaly Detection',
    description:
      'AI-powered monitoring automatically flags irregular patterns in billing, inventory, staffing, and more.',
  },
];

// ===== Module Navigation Items =====

export const MODULE_NAV_ITEMS: ModuleNavItem[] = [
  {
    id: 'staffing',
    title: 'Staff Optimization',
    href: 'staffing',
    icon: 'groups',
    description: 'Workforce scheduling and cost optimization',
    kpiLabel: 'Total Staff',
    kpiValue: '203',
    secondaryKpiLabel: 'On Overtime',
    secondaryKpiValue: '12',
    accentColor: '#0058be',
    featureKey: 'staffing',
  },
  {
    id: 'beds',
    title: 'Bed Allocation',
    href: 'beds',
    icon: 'bed',
    description: 'Ward occupancy and capacity management',
    kpiLabel: 'Beds Occupied',
    kpiValue: '487 / 500',
    secondaryKpiLabel: 'Occupancy Rate',
    secondaryKpiValue: '97.4%',
    accentColor: '#2170e4',
    featureKey: 'bedAllocation',
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain',
    href: 'supply-chain',
    icon: 'inventory_2',
    description: 'Inventory tracking and procurement intelligence',
    kpiLabel: 'Items Tracked',
    kpiValue: '312',
    secondaryKpiLabel: 'Low Stock',
    secondaryKpiValue: '5',
    accentColor: '#f59e0b',
    featureKey: 'supplyChain',
  },
  {
    id: 'finance',
    title: 'Revenue & Finance',
    href: 'finance',
    icon: 'payments',
    description: 'Financial performance and cost analytics',
    kpiLabel: 'Monthly Revenue',
    kpiValue: '$2.1M',
    secondaryKpiLabel: 'Operating Margin',
    secondaryKpiValue: '23%',
    accentColor: '#8B5CF6',
    featureKey: 'finance',
  },
  {
    id: 'anomalies',
    title: 'Anomaly Detection',
    href: 'anomalies',
    icon: 'warning',
    description: 'AI-powered operational anomaly monitoring',
    kpiLabel: 'Critical Alerts',
    kpiValue: '3',
    secondaryKpiLabel: 'Warnings',
    secondaryKpiValue: '12',
    accentColor: '#ba1a1a',
    featureKey: 'anomalyDetection',
  },
  {
    id: 'simulations',
    title: 'Foresight Simulations',
    href: 'simulations',
    icon: 'labs',
    description: 'What-if scenario modeling and impact analysis',
    kpiLabel: 'Run What-If',
    kpiValue: 'Scenarios',
    accentColor: '#009668',
    featureKey: 'simulation',
  },
];

// ===== Suggestion Scenarios =====

export const SUGGESTION_SCENARIOS: SuggestionScenario[] = [
  {
    text: 'What if we reduce nursing staff by 20 in December?',
    category: 'staffing',
  },
  {
    text: 'What happens if bed occupancy reaches 100%?',
    category: 'beds',
  },
  {
    text: 'What if our main PPE supplier delays shipment by 2 weeks?',
    category: 'supply-chain',
  },
  {
    text: 'What if we increase surgical capacity by 30%?',
    category: 'finance',
  },
  {
    text: 'What if we add 50 beds to the general ward?',
    category: 'beds',
  },
];

// ===== Provisioning Stage Labels =====

export const PROVISIONING_STAGES: Record<string, string> = {
  initializing: 'Initializing sandbox environment...',
  seeding_data: 'Seeding synthetic hospital data...',
  configuring: 'Configuring analytics modules...',
  ready: 'Sandbox ready!',
};

// ===== Timer Warning Thresholds =====

export const TIMER_THRESHOLDS = {
  lowWarningMs: 30 * 60 * 1000,      // 30 minutes
  mediumWarningMs: 15 * 60 * 1000,   // 15 minutes
  criticalWarningMs: 5 * 60 * 1000,  // 5 minutes
};
