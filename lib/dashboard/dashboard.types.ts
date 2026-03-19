export interface KpiCard {
  label: string;
  value: string;
  badge?: { text: string; variant: 'success' | 'error' | 'neutral' };
  subtitle?: string;
  subtitleIcon?: string;
  progress?: { current: number; target: number; label: string };
  icon?: string;
  gradient?: boolean;
}

export interface RevenueCycleMonth {
  month: string;
  billings: number;
  collections: number;
  leakagePercent: number;
}

export interface ExpenseItem {
  category: string;
  subCategory: string;
  amount: string;
  icon: string;
  change: { value: string; direction: 'up' | 'down' | 'stable' };
}

export interface PayerRow {
  provider: string;
  revenueSharePercent: number;
  avgReimbursement: string;
  marginStatus: { label: string; variant: 'high' | 'low' | 'optimal' };
}

export interface ForesightSimulation {
  scenarioName: string;
  projectedSavings: string;
  savingsSubtitle: string;
  efficiencyDelta: string;
  efficiencySubtitle: string;
  insightHtml: string;
}

export interface ExecutiveDashboardData {
  reportingPeriod: string;
  kpis: KpiCard[];
  revenueCycle: RevenueCycleMonth[];
  expenses: ExpenseItem[];
  payerMix: PayerRow[];
  foresight: ForesightSimulation;
}
