'use client';

import { useMemo } from 'react';
import type {
  VisualizationSpec,
  ChartDataPoint,
  TableData,
} from '@/lib/analytics-query/analytics-query.types';
import { isTableData } from '@/lib/analytics-query/analytics-query.utils';
import { DEFAULT_CHART_PALETTE } from '@/lib/analytics-query/analytics-query.constants';

interface ParsedChartData {
  data: ChartDataPoint[];
  categories: string[];
  minValue: number;
  maxValue: number;
  colors: string[];
  hasMultipleCategories: boolean;
}

interface ParsedTableData {
  headers: string[];
  rows: (string | number)[][];
  highlightRows: number[];
}

export function useVisualizationData(spec: VisualizationSpec | null) {
  const chartData = useMemo((): ParsedChartData | null => {
    if (!spec || isTableData(spec.data)) return null;

    const data = spec.data as ChartDataPoint[];
    const categories = [...new Set(data.map((d) => d.category).filter(Boolean))] as string[];
    const values = data.map((d) => d.value);

    return {
      data,
      categories,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      colors: spec.config.colors.length > 0 ? spec.config.colors : DEFAULT_CHART_PALETTE,
      hasMultipleCategories: categories.length > 1,
    };
  }, [spec]);

  const tableData = useMemo((): ParsedTableData | null => {
    if (!spec || !isTableData(spec.data)) return null;

    const tbl = spec.data as TableData;
    return {
      headers: tbl.headers,
      rows: tbl.rows,
      highlightRows: tbl.highlightRows ?? [],
    };
  }, [spec]);

  const isTable = spec ? isTableData(spec.data) : false;

  return {
    chartData,
    tableData,
    isTable,
    visualizationType: spec?.type ?? null,
    title: spec?.title ?? '',
    config: spec?.config ?? null,
  };
}
