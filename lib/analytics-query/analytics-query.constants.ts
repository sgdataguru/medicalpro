import type { ConfidenceLevel, HospitalModule } from './analytics-query.types';

// Confidence level visual config — MD3 tokens
export const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  { label: string; color: string; bgClass: string; textClass: string; icon: string }
> = {
  high: {
    label: 'High Confidence',
    color: '#009668',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
    icon: 'verified',
  },
  medium: {
    label: 'Medium Confidence',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    icon: 'info',
  },
  low: {
    label: 'Low Confidence',
    color: '#ba1a1a',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    icon: 'warning',
  },
};

// Module visual config
export const MODULE_CONFIG: Record<
  HospitalModule,
  { label: string; icon: string; color: string; bgClass: string }
> = {
  staffing: { label: 'Staffing', icon: 'groups', color: '#0058be', bgClass: 'bg-blue-100 text-secondary' },
  bed_allocation: { label: 'Bed Allocation', icon: 'bed', color: '#2170e4', bgClass: 'bg-blue-50 text-secondary-container' },
  supply_chain: { label: 'Supply Chain', icon: 'inventory_2', color: '#f59e0b', bgClass: 'bg-amber-50 text-amber-700' },
  finance: { label: 'Finance', icon: 'payments', color: '#009668', bgClass: 'bg-emerald-50 text-emerald-700' },
  anomaly_detection: { label: 'Anomaly Detection', icon: 'warning', color: '#8B5CF6', bgClass: 'bg-violet-50 text-violet-700' },
};

// Chart colors — MD3 palette
export const CHART_COLORS = {
  primary: '#009668',
  secondary: '#0058be',
  tertiary: '#f59e0b',
  quaternary: '#131b2e',
  grid: '#c6c6cd',
  axis: '#45464d',
};

// Default chart color array
export const DEFAULT_CHART_PALETTE = ['#009668', '#0058be', '#f59e0b', '#8B5CF6', '#ba1a1a', '#2170e4'];

// Suggested questions (seeded for demo)
export const DEFAULT_SUGGESTED_QUESTIONS = [
  'Why is our revenue lower this quarter?',
  'What is our current bed occupancy rate?',
  'Which departments are overstaffed this week?',
  'Show me overtime trends by department for the past 90 days',
  'What is unusual about our supply chain costs this month?',
  'Compare staffing levels Q2 vs Q3',
];

// Query input config
export const MAX_QUERY_LENGTH = 500;
export const QUERY_DEBOUNCE_MS = 300;

// Streaming config
export const STREAM_TYPING_INTERVAL_MS = 20;

// History config
export const HISTORY_PAGE_SIZE = 20;

// Rate limiting display
export const RATE_LIMIT_PER_HOUR = 30;
