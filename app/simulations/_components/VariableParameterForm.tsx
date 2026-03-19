'use client';

import type { SimulationVariable } from '@/lib/simulation/simulation.types';

interface VariableParameterFormProps {
  variable: SimulationVariable;
  onUpdate: (v: SimulationVariable) => void;
}

export default function VariableParameterForm({
  variable,
  onUpdate,
}: VariableParameterFormProps) {
  const { constraints, currentValue, adjustedValue, unit } = variable;
  const delta = adjustedValue - currentValue;

  const handleAdjustedValueChange = (value: number) => {
    const clamped = Math.min(
      constraints.max,
      Math.max(constraints.min, value),
    );
    onUpdate({ ...variable, adjustedValue: clamped });
  };

  const handleEffectiveDateChange = (date: string) => {
    onUpdate({ ...variable, effectiveDate: date });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Current value display */}
      <p className="text-sm text-on-surface-variant">
        Current:{' '}
        <span className="font-medium text-on-surface">
          {currentValue} {unit}
        </span>
      </p>

      {/* Adjusted value input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-on-surface-variant">
          Adjusted Value
        </label>
        <input
          type="number"
          value={adjustedValue}
          min={constraints.min}
          max={constraints.max}
          step={constraints.step}
          onChange={(e) => handleAdjustedValueChange(Number(e.target.value))}
          className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ring-1 ring-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
        />
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={constraints.min}
        max={constraints.max}
        step={constraints.step}
        value={adjustedValue}
        onChange={(e) => handleAdjustedValueChange(Number(e.target.value))}
        className="w-full accent-secondary"
      />

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-on-surface-variant/60">
        <span>{constraints.min}</span>
        <span>{constraints.max}</span>
      </div>

      {/* Effective date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-on-surface-variant">
          Effective Date
        </label>
        <input
          type="month"
          value={variable.effectiveDate.slice(0, 7)}
          onChange={(e) => handleEffectiveDateChange(e.target.value)}
          className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ring-1 ring-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
        />
      </div>

      {/* Delta display */}
      {delta !== 0 && (
        <div
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
            delta > 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {delta > 0 ? 'trending_up' : 'trending_down'}
          </span>
          {delta > 0 ? '+' : ''}
          {delta} {unit}
          {currentValue !== 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({delta > 0 ? '+' : ''}
              {((delta / currentValue) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
