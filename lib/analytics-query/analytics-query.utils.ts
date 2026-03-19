import { format, parseISO, formatDistanceToNow } from 'date-fns';
import type {
  ConfidenceScore,
  ConfidenceLevel,
  HospitalModule,
  DataSourceCitation,
  VisualizationSpec,
  ChartDataPoint,
  TableData,
  VisualizationType,
} from './analytics-query.types';
import { MODULE_CONFIG, CONFIDENCE_CONFIG } from './analytics-query.constants';

/** Truncate query text for preview */
export function truncateQueryPreview(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/** Generate a conversation title from the first question */
export function generateConversationTitle(firstQuestion: string): string {
  return truncateQueryPreview(firstQuestion, 50);
}

/** Format processing time for display */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Format confidence score for display */
export function formatConfidence(score: ConfidenceScore): {
  level: ConfidenceLevel;
  label: string;
  percentage: string;
  color: string;
} {
  const config = CONFIDENCE_CONFIG[score.level];
  return {
    level: score.level,
    label: config.label,
    percentage: `${score.overall}%`,
    color: config.color,
  };
}

/** Get confidence level from numeric score */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 85) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/** Format data source citation for display */
export function formatCitation(citation: DataSourceCitation): string {
  const moduleLabel = MODULE_CONFIG[citation.module]?.label ?? citation.module;
  return `${moduleLabel} — ${citation.timeframeUsed} (${citation.recordCount.toLocaleString()} records)`;
}

/** Format relative time */
export function formatRelativeTime(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/** Format date */
export function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy HH:mm');
  } catch {
    return 'Unknown';
  }
}

/** Format currency value */
export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/** Format percentage */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Check if visualization data is table data */
export function isTableData(data: ChartDataPoint[] | TableData): data is TableData {
  return 'headers' in data && 'rows' in data;
}

/** Determine optimal chart type from data shape */
export function mapDataToVisualizationType(
  dataPoints: number,
  hasTimeSeries: boolean,
  hasCategories: boolean,
): VisualizationType {
  if (hasTimeSeries && dataPoints > 3) return 'line_chart';
  if (hasCategories) return 'bar_chart';
  if (dataPoints <= 6) return 'pie_chart';
  return 'data_table';
}

/** Get module icon */
export function getModuleIcon(module: HospitalModule): string {
  return MODULE_CONFIG[module]?.icon ?? 'help';
}

/** Get module label */
export function getModuleLabel(module: HospitalModule): string {
  return MODULE_CONFIG[module]?.label ?? module;
}
