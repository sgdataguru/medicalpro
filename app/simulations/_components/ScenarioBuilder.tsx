'use client';

import type { Scenario, SimulationVariable } from '@/lib/simulation/simulation.types';
import VariableCardStrip from './VariableCardStrip';
import NaturalLanguageInput from './NaturalLanguageInput';

interface ScenarioBuilderProps {
  scenario: Scenario;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (desc: string) => void;
  onAddVariable: (v: SimulationVariable) => void;
  onUpdateVariable: (v: SimulationVariable) => void;
  onRemoveVariable: (id: string) => void;
}

export default function ScenarioBuilder({
  scenario,
  onUpdateName,
  onUpdateDescription,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
}: ScenarioBuilderProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Scenario name */}
      <input
        type="text"
        value={scenario.name}
        onChange={(e) => onUpdateName(e.target.value)}
        placeholder="Scenario Name"
        className="w-full rounded-lg bg-surface-container px-4 py-3 font-headline text-xl text-on-surface ring-1 ring-outline-variant/15 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
      />

      {/* Scenario description */}
      <textarea
        value={scenario.description}
        onChange={(e) => onUpdateDescription(e.target.value)}
        placeholder="Describe the purpose and scope of this scenario..."
        rows={3}
        className="w-full resize-none rounded-lg bg-surface-container px-4 py-3 font-body text-sm text-on-surface ring-1 ring-outline-variant/15 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
      />

      {/* Variable card strip */}
      <VariableCardStrip
        variables={scenario.variables}
        onAddVariable={onAddVariable}
        onUpdateVariable={onUpdateVariable}
        onRemoveVariable={onRemoveVariable}
      />

      {/* Natural language input */}
      <NaturalLanguageInput onAddVariable={onAddVariable} />
    </div>
  );
}
