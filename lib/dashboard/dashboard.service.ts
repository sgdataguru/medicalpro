import type { ExecutiveDashboardData } from './dashboard.types';

const MOCK_DASHBOARD: ExecutiveDashboardData = {
  reportingPeriod: 'Jan 1 — Mar 19, 2026',
  kpis: [
    {
      label: 'Total Revenue',
      value: '$42.8M',
      badge: { text: '+12.4%', variant: 'success' },
      progress: { current: 42.8, target: 45.0, label: 'Target: $45.0M (95%)' },
    },
    {
      label: 'Net Margin',
      value: '18.2%',
      icon: 'query_stats',
      subtitle: 'Gross: 24.5%',
    },
    {
      label: 'Avg AR Days',
      value: '34.5',
      badge: { text: '+2.1d', variant: 'error' },
      subtitle: 'Slowing Collections',
      subtitleIcon: 'trending_up',
    },
    {
      label: 'Forecasted EOM',
      value: '$51.2M',
      icon: 'auto_awesome',
      subtitle: 'Driven by Surgical Volume',
      gradient: true,
    },
  ],
  revenueCycle: [
    { month: 'OCT', billings: 7.2, collections: 6.1, leakagePercent: 4.2 },
    { month: 'NOV', billings: 7.8, collections: 6.6, leakagePercent: 3.8 },
    { month: 'DEC', billings: 6.6, collections: 5.7, leakagePercent: 3.5 },
    { month: 'JAN', billings: 8.4, collections: 7.2, leakagePercent: 3.9 },
    { month: 'FEB', billings: 6.3, collections: 5.4, leakagePercent: 4.1 },
    { month: 'MAR', billings: 4.8, collections: 6.3, leakagePercent: 10.1 },
  ],
  expenses: [
    {
      category: 'Staffing',
      subCategory: 'Nursing & Residents',
      amount: '$12.4M',
      icon: 'groups',
      change: { value: '2%', direction: 'up' },
    },
    {
      category: 'Supplies',
      subCategory: 'Surgical & Medical',
      amount: '$8.1M',
      icon: 'inventory_2',
      change: { value: '5%', direction: 'down' },
    },
    {
      category: 'Facility',
      subCategory: 'Utilities & Upkeep',
      amount: '$3.2M',
      icon: 'apartment',
      change: { value: 'Stable', direction: 'stable' },
    },
  ],
  payerMix: [
    {
      provider: 'Medicare/Medicaid',
      revenueSharePercent: 45,
      avgReimbursement: '$4,200',
      marginStatus: { label: 'Low Margin', variant: 'low' },
    },
    {
      provider: 'Private (Blue Shield)',
      revenueSharePercent: 32,
      avgReimbursement: '$8,900',
      marginStatus: { label: 'High Margin', variant: 'high' },
    },
    {
      provider: 'Aetna/United',
      revenueSharePercent: 18,
      avgReimbursement: '$7,100',
      marginStatus: { label: 'Optimal', variant: 'optimal' },
    },
  ],
  foresight: {
    scenarioName: 'Staffing Optimization',
    projectedSavings: '$1.24M',
    savingsSubtitle: 'Annualized Post-Change',
    efficiencyDelta: '+18.4%',
    efficiencySubtitle: 'Bed Turn-around Time',
    insightHtml:
      'Recent adjustments to the ED-to-Inpatient workflow have yielded a 9% reduction in overtime costs during peak cycles.',
  },
};

export async function fetchExecutiveDashboard(): Promise<ExecutiveDashboardData> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_DASHBOARD;
}
