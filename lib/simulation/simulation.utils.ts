/**
 * @file simulation.utils.ts
 * @description Pure utility functions for the Foresight Simulation module.
 *              Handles formatting, validation, layout computation, and filtering
 *              for hospital what-if scenario analysis.
 * @module lib/simulation
 */

import type {
  HospitalModule,
  RiskLevel,
  SimulationVariable,
  ScenarioSummary,
  ModuleImpact,
  CascadeNode,
  CascadeEdge,
} from './simulation.types';
import {
  HOSPITAL_MODULES,
  CASCADE_LAYER_GAP,
  CASCADE_NODE_GAP,
} from './simulation.constants';

/**
 * Format an impact delta value with +/- prefix and its associated unit.
 *
 * @param delta  - The numeric change value (positive or negative).
 * @param unit   - The display unit, e.g. "%", "$", "beds".
 * @returns A formatted string such as "+12.5%" or "-$3.2K".
 *
 * @example
 * formatImpactDelta(12.5, '%');   // "+12.5%"
 * formatImpactDelta(-3200, '$');  // "-$3.2K"
 */
export function formatImpactDelta(delta: number, unit: string): string {
  const prefix = delta >= 0 ? '+' : '-';
  const abs = Math.abs(delta);

  if (unit === '$') {
    // Currency-style formatting with magnitude suffixes
    if (abs >= 1_000_000) {
      return `${prefix}$${(abs / 1_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000) {
      return `${prefix}$${(abs / 1_000).toFixed(1)}K`;
    }
    return `${prefix}$${abs.toFixed(0)}`;
  }

  // For percentage and other units, append directly
  return `${prefix}${abs.toFixed(1)}${unit}`;
}

/**
 * Format a numeric amount as a human-readable currency string.
 *
 * Uses magnitude-aware suffixes:
 * - >= 1 000 000 -> "$X.XM"
 * - >= 1 000     -> "$XK"
 * - otherwise    -> "$X"
 *
 * @param amount - The raw numeric amount in dollars.
 * @returns A formatted currency string.
 *
 * @example
 * formatCurrency(2_500_000); // "$2.5M"
 * formatCurrency(45_000);    // "$45K"
 * formatCurrency(750);       // "$750"
 */
export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Format a numeric value as a percentage string.
 *
 * @param value    - The percentage value (e.g. 12.345).
 * @param decimals - Number of decimal places to display (default: 1).
 * @returns A formatted percentage string such as "12.3%".
 *
 * @example
 * formatPercentage(12.345);    // "12.3%"
 * formatPercentage(12.345, 2); // "12.35%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Map an absolute delta percentage to a {@link RiskLevel}.
 *
 * | Absolute delta | Risk level |
 * |---------------|------------|
 * | >= 30         | critical   |
 * | >= 20         | high       |
 * | >= 10         | medium     |
 * | >= 5          | low        |
 * | < 5           | none       |
 *
 * @param deltaPercentage - The percentage change value (sign is ignored).
 * @returns The computed risk level.
 *
 * @example
 * computeRiskLevel(35);  // 'critical'
 * computeRiskLevel(-22); // 'high'
 * computeRiskLevel(3);   // 'none'
 */
export function computeRiskLevel(deltaPercentage: number): RiskLevel {
  const abs = Math.abs(deltaPercentage);
  if (abs >= 30) return 'critical';
  if (abs >= 20) return 'high';
  if (abs >= 10) return 'medium';
  if (abs >= 5) return 'low';
  return 'none';
}

/**
 * Validate an array of scenario variables for completeness and constraint adherence.
 *
 * Checks performed:
 * 1. At least one variable must be present.
 * 2. Each variable's `adjustedValue` must fall within its `constraints.min` and `constraints.max`.
 *
 * @param variables - The simulation variables to validate.
 * @returns An object with `valid` (boolean) and `errors` (string array).
 *
 * @example
 * validateScenarioVariables([]);
 * // { valid: false, errors: ['At least one variable is required.'] }
 */
export function validateScenarioVariables(
  variables: SimulationVariable[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (variables.length === 0) {
    errors.push('At least one variable is required.');
    return { valid: false, errors };
  }

  for (const variable of variables) {
    const { adjustedValue, constraints, label } = variable;

    if (adjustedValue < constraints.min) {
      errors.push(
        `"${label}" adjusted value (${adjustedValue}) is below the minimum (${constraints.min}).`,
      );
    }

    if (adjustedValue > constraints.max) {
      errors.push(
        `"${label}" adjusted value (${adjustedValue}) exceeds the maximum (${constraints.max}).`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Group an array of {@link ModuleImpact} objects into a record keyed by
 * {@link HospitalModule}. Modules without a corresponding impact are set to `null`.
 *
 * @param impacts - The module impact results from a simulation run.
 * @returns A record mapping every hospital module to its impact or `null`.
 *
 * @example
 * groupImpactsByModule([{ module: 'staffing', ... }]);
 * // { staffing: { ... }, 'bed-allocation': null, 'supply-chain': null, finance: null }
 */
export function groupImpactsByModule(
  impacts: ModuleImpact[],
): Record<HospitalModule, ModuleImpact | null> {
  const record = {} as Record<HospitalModule, ModuleImpact | null>;

  for (const mod of HOSPITAL_MODULES) {
    record[mod] = null;
  }

  for (const impact of impacts) {
    record[impact.module] = impact;
  }

  return record;
}

/**
 * Compute a layered layout for cascade graph nodes.
 *
 * The algorithm assigns nodes to horizontal layers and evenly spaces them
 * vertically within each layer for SVG rendering (viewBox ~900px wide).
 *
 * **Layer assignment:**
 * - Layer 0: nodes with `isDirectChange === true`.
 * - Layer N+1: nodes reachable via edges from layer N that have not yet been assigned.
 *
 * **Position assignment:**
 * - `x` is determined by `layer * CASCADE_LAYER_GAP` (220px per layer).
 * - `y` is evenly spaced within each layer using `index * CASCADE_NODE_GAP` (100px per node)
 *   with a vertical offset to center the layer within a common area.
 *
 * @param nodes - The cascade graph nodes (positions will be recalculated).
 * @param edges - The cascade graph edges defining relationships.
 * @returns A new array of nodes with updated `x` and `y` values.
 */
export function calculateCascadeLayout(
  nodes: CascadeNode[],
  edges: CascadeEdge[],
): CascadeNode[] {
  if (nodes.length === 0) return [];

  // Build an adjacency list from source -> targets
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const targets = adjacency.get(edge.sourceNodeId) ?? [];
    targets.push(edge.targetNodeId);
    adjacency.set(edge.sourceNodeId, targets);
  }

  // Assign layer indices via BFS
  const layerMap = new Map<string, number>();

  // Layer 0: direct-change nodes
  const queue: string[] = [];
  for (const node of nodes) {
    if (node.isDirectChange) {
      layerMap.set(node.id, 0);
      queue.push(node.id);
    }
  }

  // BFS to assign subsequent layers
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentLayer = layerMap.get(currentId)!;
    const targets = adjacency.get(currentId) ?? [];

    for (const targetId of targets) {
      if (!layerMap.has(targetId)) {
        layerMap.set(targetId, currentLayer + 1);
        queue.push(targetId);
      }
    }
  }

  // Assign any orphan nodes (not reachable via edges) to layer 0
  for (const node of nodes) {
    if (!layerMap.has(node.id)) {
      layerMap.set(node.id, 0);
    }
  }

  // Group nodes by layer
  const layers = new Map<number, CascadeNode[]>();
  for (const node of nodes) {
    const layer = layerMap.get(node.id)!;
    const group = layers.get(layer) ?? [];
    group.push(node);
    layers.set(layer, group);
  }

  // Determine the maximum layer count to compute centering
  const maxLayerSize = Math.max(...Array.from(layers.values()).map((g) => g.length));

  // Assign x,y positions
  const result: CascadeNode[] = [];
  for (const [layer, group] of layers.entries()) {
    const totalHeight = (group.length - 1) * CASCADE_NODE_GAP;
    const maxHeight = (maxLayerSize - 1) * CASCADE_NODE_GAP;
    const yOffset = (maxHeight - totalHeight) / 2;

    for (let i = 0; i < group.length; i++) {
      result.push({
        ...group[i],
        x: layer * CASCADE_LAYER_GAP,
        y: i * CASCADE_NODE_GAP + yOffset,
      });
    }
  }

  return result;
}

/**
 * Build upper and lower bounds for a confidence interval around a point estimate.
 *
 * The spread is calculated as:
 * ```
 * spread = pointEstimate * (1 - confidenceLevel) * 1.5
 * ```
 *
 * @param pointEstimate   - The central predicted value.
 * @param confidenceLevel - The confidence level (0-1), e.g. 0.95 for 95%.
 * @returns An object with `lower` and `upper` bound values.
 *
 * @example
 * buildConfidenceIntervalBounds(100, 0.95);
 * // { lower: 92.5, upper: 107.5 }
 */
export function buildConfidenceIntervalBounds(
  pointEstimate: number,
  confidenceLevel: number,
): { lower: number; upper: number } {
  const spread = pointEstimate * (1 - confidenceLevel) * 1.5;
  return {
    lower: pointEstimate - spread,
    upper: pointEstimate + spread,
  };
}

/**
 * Format a simulation execution duration in milliseconds to a human-readable string.
 *
 * - Under 60 000 ms: returns "X.Xs" (e.g. "2.4s").
 * - 60 000 ms or above: returns "Xm Xs" (e.g. "1m 30s").
 *
 * @param ms - Duration in milliseconds.
 * @returns A human-readable duration string.
 *
 * @example
 * formatSimulationDuration(2400);  // "2.4s"
 * formatSimulationDuration(90000); // "1m 30s"
 */
export function formatSimulationDuration(ms: number): string {
  if (ms < 60_000) {
    return `${(ms / 1_000).toFixed(1)}s`;
  }

  const totalSeconds = Math.floor(ms / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

/**
 * Extract a unique, order-preserving list of {@link HospitalModule} values
 * from a set of simulation variables.
 *
 * @param variables - The simulation variables to inspect.
 * @returns An array of unique hospital modules in the order they first appear.
 *
 * @example
 * getModulesFromVariables([
 *   { module: 'staffing', ... },
 *   { module: 'finance', ... },
 *   { module: 'staffing', ... },
 * ]);
 * // ['staffing', 'finance']
 */
export function getModulesFromVariables(
  variables: SimulationVariable[],
): HospitalModule[] {
  const seen = new Set<HospitalModule>();
  const modules: HospitalModule[] = [];

  for (const variable of variables) {
    if (!seen.has(variable.module)) {
      seen.add(variable.module);
      modules.push(variable.module);
    }
  }

  return modules;
}

/**
 * Filter and search scenario summaries by library tab and search query.
 *
 * Tab filtering:
 * - `my_scenarios`: scenarios that are neither shared nor templates.
 * - `shared`: scenarios where `isShared` is true.
 * - `templates`: scenarios where `isTemplate` is true.
 *
 * The search string is matched case-insensitively against both
 * `name` and `description` fields.
 *
 * @param scenarios - The full list of scenario summaries.
 * @param search    - The search query string.
 * @param tab       - The active library tab.
 * @returns The filtered array of scenario summaries.
 *
 * @example
 * filterScenarios(scenarios, 'nurse', 'my_scenarios');
 */
export function filterScenarios(
  scenarios: ScenarioSummary[],
  search: string,
  tab: 'my_scenarios' | 'shared' | 'templates',
): ScenarioSummary[] {
  // First, filter by tab
  let filtered: ScenarioSummary[];

  switch (tab) {
    case 'my_scenarios':
      filtered = scenarios.filter((s) => !s.isShared && !s.isTemplate);
      break;
    case 'shared':
      filtered = scenarios.filter((s) => s.isShared);
      break;
    case 'templates':
      filtered = scenarios.filter((s) => s.isTemplate);
      break;
  }

  // Then, apply search filter
  if (search.trim().length === 0) {
    return filtered;
  }

  const query = search.toLowerCase();
  return filtered.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query),
  );
}
