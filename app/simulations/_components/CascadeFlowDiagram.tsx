'use client';

import { useState, useMemo } from 'react';
import type { CascadeGraph } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG, RISK_LEVEL_CONFIG } from '@/lib/simulation/simulation.constants';

interface CascadeFlowDiagramProps {
  graph: CascadeGraph;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const NODE_RADIUS = 12;
const RISK_INDICATOR_RADIUS = 5;

export default function CascadeFlowDiagram({
  graph,
}: CascadeFlowDiagramProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Build a set of connected edge IDs when a node is hovered
  const connectedEdgeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    for (const edge of graph.edges) {
      if (
        edge.sourceNodeId === hoveredNodeId ||
        edge.targetNodeId === hoveredNodeId
      ) {
        ids.add(edge.id);
      }
    }
    return ids;
  }, [hoveredNodeId, graph.edges]);

  // Calculate SVG viewBox from nodes
  const viewBox = useMemo(() => {
    if (graph.nodes.length === 0) return '0 0 900 500';
    const padding = 40;
    const maxX = Math.max(...graph.nodes.map((n) => n.x + NODE_WIDTH)) + padding;
    const maxY = Math.max(...graph.nodes.map((n) => n.y + NODE_HEIGHT)) + padding;
    return `${-padding} ${-padding} ${maxX + padding} ${maxY + padding}`;
  }, [graph.nodes]);

  // Build node lookup for edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof graph.nodes)[number]>();
    for (const node of graph.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [graph.nodes]);

  function truncateLabel(label: string, maxLen = 20): string {
    if (label.length <= maxLen) return label;
    return label.slice(0, maxLen - 1) + '\u2026';
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[22px] text-on-surface">
          device_hub
        </span>
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Cascade Impact Flow
        </h3>
      </div>

      {/* Diagram container */}
      <div className="bg-surface-container rounded-xl p-6 ring-1 ring-outline-variant/15">
        {graph.nodes.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant text-center py-8">
            No cascade data available.
          </p>
        ) : (
          <svg
            width="100%"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible"
          >
            {/* Render edges (behind nodes) */}
            {graph.edges.map((edge) => {
              const source = nodeMap.get(edge.sourceNodeId);
              const target = nodeMap.get(edge.targetNodeId);
              if (!source || !target) return null;

              const sourceX = source.x + NODE_WIDTH;
              const sourceY = source.y + NODE_HEIGHT / 2;
              const targetX = target.x;
              const targetY = target.y + NODE_HEIGHT / 2;

              const midX = (sourceX + targetX) / 2;
              const controlX1 = midX;
              const controlX2 = midX;

              const isHighlighted = connectedEdgeIds.has(edge.id);
              const isIndirect = edge.impact === 'indirect';
              const baseOpacity = isIndirect ? 0.3 : 0.7;
              const opacity = isHighlighted ? 1 : baseOpacity;
              const strokeWidth = isHighlighted ? 2.5 : 1.5;

              return (
                <path
                  key={edge.id}
                  d={`M ${sourceX},${sourceY} C ${controlX1},${sourceY} ${controlX2},${targetY} ${targetX},${targetY}`}
                  fill="none"
                  stroke="#45464d"
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeDasharray={isIndirect ? '6 4' : undefined}
                />
              );
            })}

            {/* Render nodes */}
            {graph.nodes.map((node) => {
              const moduleColor = MODULE_CONFIG[node.module].color;
              const riskColor = RISK_LEVEL_CONFIG[node.risk].color;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer"
                >
                  {/* Node rectangle */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={NODE_RADIUS}
                    fill="white"
                    stroke={moduleColor}
                    strokeWidth={node.isDirectChange ? 2 : 1}
                  />

                  {/* Label text */}
                  <text
                    x={node.x + NODE_WIDTH / 2}
                    y={node.y + NODE_HEIGHT / 2 - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fill="#131b2e"
                    fontWeight={500}
                  >
                    {truncateLabel(node.label)}
                  </text>

                  {/* Value text */}
                  <text
                    x={node.x + NODE_WIDTH / 2}
                    y={node.y + NODE_HEIGHT / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={moduleColor}
                  >
                    {node.value}
                  </text>

                  {/* Risk indicator circle */}
                  <circle
                    cx={node.x + NODE_WIDTH - 8}
                    cy={node.y + 8}
                    r={RISK_INDICATOR_RADIUS}
                    fill={riskColor}
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
