'use client';

import type { SimulationVariable } from '@/lib/simulation/simulation.types';
import { MODULE_CONFIG } from '@/lib/simulation/simulation.constants';
import VariableParameterForm from './VariableParameterForm';

interface VariableCardProps {
  variable: SimulationVariable;
  onUpdate: (v: SimulationVariable) => void;
  onRemove: (id: string) => void;
}

export default function VariableCard({
  variable,
  onUpdate,
  onRemove,
}: VariableCardProps) {
  const config = MODULE_CONFIG[variable.module];

  return (
    <div
      className="relative rounded-xl border-l-4 bg-surface-container p-4 ring-1 ring-outline-variant/15"
      style={{ borderLeftColor: config.color }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        {/* Module chip */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgClass}`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {config.icon}
          </span>
          {config.label}
        </span>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(variable.id)}
          className="flex items-center justify-center rounded-md p-1 text-on-surface-variant/60 transition-colors hover:bg-surface hover:text-on-surface"
          aria-label={`Remove ${variable.label}`}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Variable label & description */}
      <h3 className="font-semibold text-on-surface">{variable.label}</h3>
      <p className="mb-3 text-xs text-on-surface-variant">
        {variable.description}
      </p>

      {/* Parameter form */}
      <VariableParameterForm variable={variable} onUpdate={onUpdate} />
    </div>
  );
}
