import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import type {
  Recommendation,
  ExpectedImpact,
  ActualImpact,
  RecommendationOutcome,
  HospitalModule,
  PriorityLevel,
  RecommendationUrgency,
  DataBasis,
  RecommendationSortField,
  SortOrder,
} from './recommendations.types';
import { PRIORITY_ORDER, PRIORITY_THRESHOLDS, PRIORITY_WEIGHTS, MODULE_CONFIG } from './recommendations.constants';

// --- Formatting Helpers ---

/** Format impact delta for display (e.g., "+30%" or "-$8K") */
export function formatImpactDelta(impact: ExpectedImpact): string {
  const sign = impact.delta >= 0 ? '+' : '';
  if (impact.unit === '$' || impact.unit === '$/mo') {
    const absVal = Math.abs(impact.delta);
    if (absVal >= 1_000_000) return `${sign}$${(impact.delta / 1_000_000).toFixed(1)}M`;
    if (absVal >= 1_000) return `${sign}$${(impact.delta / 1_000).toFixed(0)}K`;
    return `${sign}$${impact.delta.toFixed(0)}`;
  }
  if (impact.unit === '%') {
    return `${sign}${impact.delta.toFixed(1)}%`;
  }
  return `${sign}${impact.delta}${impact.unit ? ` ${impact.unit}` : ''}`;
}

/** Format urgency deadline for display */
export function formatUrgencyDeadline(urgency: RecommendationUrgency): string {
  if (!urgency.deadlineDate) return urgency.reason;
  try {
    const deadline = parseISO(urgency.deadlineDate);
    const daysLeft = differenceInDays(deadline, new Date());
    if (daysLeft <= 0) return 'Overdue';
    if (daysLeft === 1) return '1 day remaining';
    return `${daysLeft} days remaining`;
  } catch {
    return urgency.reason;
  }
}

/** Format data basis for display */
export function formatDataBasis(basis: DataBasis): string {
  const modules = basis.modules.map((m) => MODULE_CONFIG[m].label).join(', ');
  return `${basis.timeframeDays} days of data · ${basis.recordCount.toLocaleString()} records · ${modules}`;
}

/** Format confidence score for display */
export function formatConfidence(score: number): string {
  return `${score}%`;
}

/** Format date as readable string */
export function formatRecommendationDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
}

/** Format date with time */
export function formatRecommendationDateTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy HH:mm');
  } catch {
    return 'Unknown';
  }
}

/** Format dollar amount */
export function formatDollars(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

/** Get module icon */
export function getModuleIcon(module: HospitalModule): string {
  return MODULE_CONFIG[module].icon;
}

/** Get module label */
export function getModuleLabel(module: HospitalModule): string {
  return MODULE_CONFIG[module].label;
}

// --- Priority Calculator ---

/** Calculate composite priority score from impact factors */
export function calculatePriorityScore(
  impacts: ExpectedImpact[],
  urgency: RecommendationUrgency,
  confidence: number,
): number {
  // Average impact magnitude weighted by confidence
  const avgImpactScore = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + Math.min(100, Math.abs(i.deltaPercentage)), 0) / impacts.length
    : 0;

  // Urgency multiplier
  const urgencyMultiplier: Record<string, number> = {
    immediate: 1.3,
    this_week: 1.1,
    this_month: 1.0,
    next_quarter: 0.8,
  };
  const urgMult = urgencyMultiplier[urgency.level] ?? 1.0;

  // Composite score
  const rawScore = avgImpactScore * urgMult * (confidence / 100);
  return Math.round(Math.min(100, rawScore));
}

/** Classify priority level from composite score */
export function classifyPriority(score: number): PriorityLevel {
  if (score >= PRIORITY_THRESHOLDS.urgent) return 'urgent';
  if (score >= PRIORITY_THRESHOLDS.high) return 'high';
  if (score >= PRIORITY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

// --- Outcome Tracker ---

/** Compare predicted vs actual impact and return accuracy score */
export function compareOutcome(
  predicted: ExpectedImpact[],
  actual: ActualImpact[],
): { accuracyScore: number; overallResult: 'positive' | 'neutral' | 'negative' } {
  if (actual.length === 0) return { accuracyScore: 0, overallResult: 'neutral' };

  let totalAccuracy = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  for (const act of actual) {
    const pred = predicted.find((p) => p.metricName === act.metricName);
    if (!pred) continue;

    // Accuracy: how close was the prediction
    const predictedDelta = Math.abs(pred.delta);
    const actualDelta = Math.abs(act.delta);
    const maxDelta = Math.max(predictedDelta, actualDelta, 1);
    const accuracy = 1 - Math.abs(predictedDelta - actualDelta) / maxDelta;
    totalAccuracy += accuracy * 100;

    // Direction check
    if (act.delta !== 0) {
      const predictedPositive = pred.direction === 'positive';
      const actualPositive =
        (pred.direction === 'positive' && act.delta > 0) ||
        (pred.direction === 'negative' && act.delta < 0);
      if (actualPositive) positiveCount++;
      else negativeCount++;
    }
  }

  const accuracyScore = Math.round(totalAccuracy / actual.length);
  const overallResult =
    positiveCount > negativeCount ? 'positive' :
    negativeCount > positiveCount ? 'negative' : 'neutral';

  return { accuracyScore, overallResult };
}

/** Calculate rolling success rate from outcomes */
export function calculateSuccessRate(outcomes: RecommendationOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const positive = outcomes.filter((o) => o.overallResult === 'positive').length;
  return Math.round((positive / outcomes.length) * 100);
}

/** Compute aggregate ROI from accepted recommendation outcomes */
export function computeROI(outcomes: RecommendationOutcome[]): number {
  return outcomes.reduce((total, outcome) => {
    const dollarImpacts = outcome.actualImpacts.filter((a) => a.unit === '$' || a.unit === '$/mo');
    const impact = dollarImpacts.reduce((sum, a) => sum + a.delta, 0);
    return total + impact;
  }, 0);
}

// --- Sorting ---

/** Sort recommendations by specified field */
export function sortRecommendations(
  recs: Recommendation[],
  sortBy: RecommendationSortField,
  sortOrder: SortOrder,
): Recommendation[] {
  return [...recs].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'priority':
        cmp = PRIORITY_ORDER[a.priority.level] - PRIORITY_ORDER[b.priority.level];
        break;
      case 'date':
        cmp = a.generatedAt.localeCompare(b.generatedAt);
        break;
      case 'module':
        cmp = a.module.localeCompare(b.module);
        break;
      case 'confidence':
        cmp = a.confidenceScore - b.confidenceScore;
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });
}

/** Serialize filter state to URL params */
export function buildRecommendationSearchParams(
  filters: { priority?: PriorityLevel[]; modules?: HospitalModule[]; status?: string[]; sortBy?: string; sortOrder?: string },
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.priority && filters.priority.length > 0) params.set('priority', filters.priority.join(','));
  if (filters.modules && filters.modules.length > 0) params.set('modules', filters.modules.join(','));
  if (filters.status && filters.status.length > 0) params.set('status', filters.status.join(','));
  if (filters.sortBy && filters.sortBy !== 'priority') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder && filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
  return params;
}
