'use client';

import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { CostComponent } from '@/lib/revenue-cost/revenue-cost.types';
import { COST_CATEGORY_CONFIG } from '@/lib/revenue-cost/revenue-cost.constants';
import {
  buildTreemapData,
  formatCurrencyCompact,
  formatPercentage,
  getTrendIcon,
} from '@/lib/revenue-cost/revenue-cost.utils';

interface CostBreakdownTreemapProps {
  components: CostComponent[];
  onCellClick?: (componentId: string) => void;
}

interface TreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  category?: string;
  trend?: string;
  trendPercentage?: number;
  percentageOfTotal?: number;
  budgetVariance?: number;
  depth?: number;
  onCellClick?: (name: string) => void;
}

function CustomTreemapContent(props: TreemapCellProps) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = '',
    value = 0,
    category = 'OTHER',
    trend = 'STABLE',
    trendPercentage = 0,
    percentageOfTotal = 0,
    budgetVariance,
    depth,
    onCellClick,
  } = props;

  if (depth !== 1) return null;

  const config = COST_CATEGORY_CONFIG[category as keyof typeof COST_CATEGORY_CONFIG] ?? COST_CATEGORY_CONFIG.OTHER;
  const isSmallCell = percentageOfTotal < 5;

  // Lighten color for favorable (negative) budget variance, darken for unfavorable
  let baseColor = config.color;
  if (budgetVariance !== undefined) {
    if (budgetVariance < 0) {
      // Favorable: lighten slightly
      baseColor = config.color + 'CC';
    } else if (budgetVariance > 0) {
      // Unfavorable: darken by using full opacity
      baseColor = config.color;
    }
  }

  const trendArrow = getTrendIcon(trend as 'RISING' | 'STABLE' | 'DECLINING');

  return (
    <g
      onClick={() => onCellClick?.(name)}
      style={{ cursor: onCellClick ? 'pointer' : 'default' }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={baseColor}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {width > 40 && height > 24 && (
        <text
          x={x + 8}
          y={y + 18}
          fill="#fff"
          fontSize={12}
          fontWeight={600}
        >
          {name}
        </text>
      )}
      {!isSmallCell && width > 60 && height > 44 && (
        <>
          <text
            x={x + 8}
            y={y + 36}
            fill="rgba(255,255,255,0.85)"
            fontSize={11}
          >
            {formatCurrencyCompact(value)}
          </text>
          {height > 56 && (
            <text
              x={x + 8}
              y={y + 52}
              fill="rgba(255,255,255,0.75)"
              fontSize={10}
            >
              {trendArrow} {formatPercentage(trendPercentage, true)}
            </text>
          )}
        </>
      )}
    </g>
  );
}

function TreemapTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Record<string, unknown> }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const trend = data.trend as string;
  const trendArrow = getTrendIcon(trend as 'RISING' | 'STABLE' | 'DECLINING');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-medium text-on-surface">{data.name as string}</p>
      <p className="mt-1 text-gray-600">
        Amount:{' '}
        <span className="font-mono font-semibold">
          {formatCurrencyCompact(data.value as number)}
        </span>
      </p>
      <p className="text-gray-500">
        % of total: {formatPercentage(data.percentageOfTotal as number)}
      </p>
      <p className="text-gray-500">
        Trend: {trendArrow} {formatPercentage(data.trendPercentage as number, true)}
      </p>
      {data.budgetVariance !== undefined && (
        <p className="text-gray-500">
          Budget variance:{' '}
          {formatCurrencyCompact(data.budgetVariance as number)}
        </p>
      )}
    </div>
  );
}

export default function CostBreakdownTreemap({
  components,
  onCellClick,
}: CostBreakdownTreemapProps) {
  const treemapData = useMemo(() => buildTreemapData(components), [components]);

  const totalCost = useMemo(
    () => components.reduce((sum, c) => sum + c.currentAmount, 0),
    [components]
  );

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <div className="flex items-baseline justify-between">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Cost Breakdown
        </h3>
        <span className="text-sm text-gray-500">
          Total: {formatCurrencyCompact(totalCost)}
        </span>
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={320}>
          <Treemap
            data={treemapData}
            dataKey="value"
            nameKey="name"
            content={
              <CustomTreemapContent onCellClick={onCellClick ? (name: string) => {
                const comp = components.find((c) => c.name === name);
                if (comp) onCellClick(comp.componentId);
              } : undefined} />
            }
          >
            <Tooltip content={<TreemapTooltipContent />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
