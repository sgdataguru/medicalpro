'use client';

import type { InventoryItem, RiskLevel } from '@/lib/supply-chain/supply-chain.types';
import { RISK_LEVEL_CONFIG, CHART_COLORS } from '@/lib/supply-chain/supply-chain.constants';
import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from 'recharts';

// ---------------------------------------------------------------------------
// Dot color mapping by risk level
// ---------------------------------------------------------------------------

const RISK_DOT_COLORS: Record<RiskLevel, string> = {
  CRITICAL: '#ef4444',  // red-500
  WARNING: '#f59e0b',   // amber-500
  HEALTHY: '#10b981',   // emerald-500
  OVERSTOCK: '#3b82f6', // blue-500
};

// ---------------------------------------------------------------------------
// Point data shape for Recharts
// ---------------------------------------------------------------------------

interface ScatterPoint {
  itemId: string;
  itemName: string;
  x: number; // daysToStockout
  y: number; // dailyConsumptionRate
  z: number; // totalValue (used for dot size)
  quantity: number;
  riskLevel: RiskLevel;
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
}

function MatrixTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="font-headline text-sm font-semibold text-on-surface">{point.itemName}</p>
      <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
        <p>Quantity: <span className="font-medium text-on-surface">{point.quantity.toLocaleString()}</span></p>
        <p>Consumption: <span className="font-medium text-on-surface">{point.y.toFixed(1)}/day</span></p>
        <p>Days to Stockout: <span className="font-medium text-on-surface">{Math.round(point.x)}</span></p>
        <p>Value: <span className="font-medium text-on-surface">{formatInventoryValue(point.z)}</span></p>
        <p>
          Risk:{' '}
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${RISK_LEVEL_CONFIG[point.riskLevel].bgColor} ${RISK_LEVEL_CONFIG[point.riskLevel].color}`}
          >
            {RISK_LEVEL_CONFIG[point.riskLevel].label}
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

function RiskLegend() {
  const levels: RiskLevel[] = ['CRITICAL', 'WARNING', 'HEALTHY', 'OVERSTOCK'];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {levels.map((level) => (
        <div key={level} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: RISK_DOT_COLORS[level] }}
          />
          {RISK_LEVEL_CONFIG[level].label}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InventoryRiskMatrix component
// ---------------------------------------------------------------------------

interface InventoryRiskMatrixProps {
  items: InventoryItem[];
  onItemClick: (itemId: string) => void;
}

export default function InventoryRiskMatrix({ items, onItemClick }: InventoryRiskMatrixProps) {
  // Transform items into scatter data
  const maxValue = Math.max(...items.map((i) => i.totalValue), 1);

  const data: ScatterPoint[] = items.map((item) => ({
    itemId: item.itemId,
    itemName: item.itemName,
    x: Math.min(item.daysToStockout, 60), // cap at 60 for charting
    y: item.dailyConsumptionRate,
    z: item.totalValue,
    quantity: item.currentQuantity,
    riskLevel: item.riskLevel,
  }));

  // Calculate dot size relative to max value (6-20 px range)
  function getDotSize(value: number): number {
    const ratio = value / maxValue;
    return Math.round(6 + ratio * 14);
  }

  // Handle click on a scatter dot
  function handleDotClick(entry: ScatterPoint) {
    onItemClick(entry.itemId);
  }

  // Compute max Y for reference areas
  const maxY = Math.max(...data.map((d) => d.y), 10);
  const yUpperBound = Math.ceil(maxY * 1.15);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="font-headline text-lg font-semibold text-on-surface">Inventory Risk Matrix</h3>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />

            {/* Reference areas for quadrants */}
            <ReferenceArea
              x1={0}
              x2={7}
              y1={0}
              y2={yUpperBound}
              fill={CHART_COLORS.criticalZone}
              fillOpacity={1}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              x1={30}
              x2={60}
              y1={0}
              y2={yUpperBound}
              fill={CHART_COLORS.overstockZone}
              fillOpacity={1}
              ifOverflow="extendDomain"
            />

            <XAxis
              type="number"
              dataKey="x"
              name="Days to Stockout"
              domain={[0, 60]}
              tickCount={7}
              label={{
                value: 'Days to Stockout',
                position: 'insideBottom',
                offset: -10,
                style: { fontSize: 12, fill: '#4F6467' },
              }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="Daily Consumption Rate"
              domain={[0, yUpperBound]}
              label={{
                value: 'Daily Consumption Rate',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                style: { fontSize: 12, fill: '#4F6467' },
              }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />

            <Tooltip content={<MatrixTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            <Scatter
              data={data}
              onClick={(data: { payload?: ScatterPoint }) => {
                const point = data?.payload;
                if (point) handleDotClick(point);
              }}
              cursor="pointer"
            >
              {data.map((point) => (
                <Cell
                  key={point.itemId}
                  fill={RISK_DOT_COLORS[point.riskLevel]}
                  r={getDotSize(point.z)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <RiskLegend />
    </div>
  );
}
