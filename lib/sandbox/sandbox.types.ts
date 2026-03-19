/**
 * @file sandbox.types.ts
 * @description Type definitions for the Sandbox Demo module
 * @module lib/sandbox
 */

// ===== Core Status Types =====

export type SandboxStatus =
  | 'provisioning'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'resetting'
  | 'error';

export type FeatureExplorationStatus = 'not_visited' | 'visited' | 'explored';

export type ProvisioningStage =
  | 'initializing'
  | 'seeding_data'
  | 'configuring'
  | 'ready';

export type WarningLevel = 'none' | 'low' | 'medium' | 'critical';

export type TourPosition = 'top' | 'bottom' | 'left' | 'right';

// ===== Feature Usage =====

export interface SandboxFeatureUsage {
  staffing: FeatureExplorationStatus;
  bedAllocation: FeatureExplorationStatus;
  supplyChain: FeatureExplorationStatus;
  finance: FeatureExplorationStatus;
  anomalyDetection: FeatureExplorationStatus;
  simulation: FeatureExplorationStatus;
  governance: FeatureExplorationStatus;
}

export type SandboxFeatureKey = keyof SandboxFeatureUsage;

// ===== Session State =====

export interface SandboxSessionState {
  sessionId: string;
  status: SandboxStatus;
  createdAt: string;
  expiresAt: string;
  timeRemainingMs: number;
  extensionsUsed: number;
  maxExtensions: number;
  features: SandboxFeatureUsage;
  simulationsRun: number;
  maxSimulations: number;
  tourCompleted: boolean;
  tourStep: number;
}

// ===== Configuration =====

export interface SandboxConfig {
  sessionTtlMs: number;
  maxExtensions: number;
  extensionDurationMs: number;
  maxSimulationsPerSession: number;
}

// ===== Guided Tour =====

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: TourPosition;
  order: number;
}

// ===== Module Navigation =====

export interface ModuleNavItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  description: string;
  kpiLabel: string;
  kpiValue: string;
  secondaryKpiLabel?: string;
  secondaryKpiValue?: string;
  accentColor: string;
  featureKey: SandboxFeatureKey;
}

// ===== Feature Preview =====

export interface FeaturePreview {
  icon: string;
  title: string;
  description: string;
}

// ===== Suggestion Scenario =====

export interface SuggestionScenario {
  text: string;
  category: string;
}

// ===== Demo Request =====

export interface DemoRequest {
  name: string;
  email: string;
  hospitalName: string;
  role: string;
  phoneNumber?: string;
  numberOfBeds?: number;
  interestedModules: string[];
  message?: string;
  sandboxSessionId: string;
  featuresExplored: string[];
  simulationsRun: number;
}

// ===== Analytics =====

export type AnalyticsEventType =
  | 'feature_visited'
  | 'feature_explored'
  | 'simulation_run'
  | 'tour_step'
  | 'tour_completed'
  | 'tour_skipped';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  feature?: string;
  metadata?: Record<string, string | number>;
}

// ===== Reducer Actions =====

export type SandboxAction =
  | { type: 'SET_SESSION'; payload: SandboxSessionState }
  | { type: 'SET_STATUS'; payload: SandboxStatus }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_EXPIRES_AT'; payload: string }
  | { type: 'INCREMENT_EXTENSIONS' }
  | { type: 'SET_FEATURE_STATUS'; payload: { feature: SandboxFeatureKey; status: FeatureExplorationStatus } }
  | { type: 'INCREMENT_SIMULATIONS' }
  | { type: 'SET_TOUR_COMPLETED'; payload: boolean }
  | { type: 'SET_TOUR_STEP'; payload: number }
  | { type: 'RESET_SESSION'; payload: SandboxSessionState };

// ===== API Response Types =====

export interface CreateSandboxResponse {
  success: boolean;
  sessionId: string;
  expiresAt: string;
  config: SandboxConfig;
}

export interface ValidateAccessCodeResponse {
  valid: boolean;
  sessionId?: string;
  clientName?: string;
  error?: string;
}

export interface DemoRequestResponse {
  success: boolean;
  message: string;
  referenceId: string;
}
