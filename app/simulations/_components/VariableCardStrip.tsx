'use client';

import { useState, useCallback } from 'react';
import type {
  HospitalModule,
  SimulationVariable,
} from '@/lib/simulation/simulation.types';
import {
  HOSPITAL_MODULES,
  MODULE_CONFIG,
} from '@/lib/simulation/simulation.constants';
import { fetchAvailableVariables } from '@/lib/simulation/simulation.service';
import VariableCard from './VariableCard';

interface VariableCardStripProps {
  variables: SimulationVariable[];
  onAddVariable: (v: SimulationVariable) => void;
  onUpdateVariable: (v: SimulationVariable) => void;
  onRemoveVariable: (id: string) => void;
}

function generateId(): string {
  return `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function VariableCardStrip({
  variables,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
}: VariableCardStripProps) {
  const [openModule, setOpenModule] = useState<HospitalModule | null>(null);
  const [availableVars, setAvailableVars] = useState<
    Omit<SimulationVariable, 'id'>[]
  >([]);
  const [loadingModule, setLoadingModule] = useState<HospitalModule | null>(
    null,
  );

  const handleModuleClick = useCallback(
    async (mod: HospitalModule) => {
      if (openModule === mod) {
        setOpenModule(null);
        return;
      }

      setLoadingModule(mod);
      try {
        const vars = await fetchAvailableVariables(mod);
        setAvailableVars(vars);
        setOpenModule(mod);
      } finally {
        setLoadingModule(null);
      }
    },
    [openModule],
  );

  const handleSelectVariable = useCallback(
    (template: Omit<SimulationVariable, 'id'>) => {
      const variable: SimulationVariable = {
        ...template,
        id: generateId(),
      };
      onAddVariable(variable);
      setOpenModule(null);
    },
    [onAddVariable],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Variables
        </h2>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary/10 px-2 text-xs font-semibold text-secondary">
          {variables.length}
        </span>
      </div>

      {/* Module add buttons */}
      <div className="relative flex flex-wrap items-center gap-2">
        {HOSPITAL_MODULES.map((mod) => {
          const config = MODULE_CONFIG[mod];
          const isLoading = loadingModule === mod;

          return (
            <div key={mod} className="relative">
              <button
                type="button"
                onClick={() => handleModuleClick(mod)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {config.icon}
                </span>
                {isLoading ? 'Loading...' : `+ ${config.label}`}
              </button>

              {/* Dropdown for available variables */}
              {openModule === mod && (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-64 rounded-xl bg-surface p-2 shadow-lg ring-1 ring-outline-variant/15">
                  <p className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
                    {config.label} Variables
                  </p>
                  {availableVars.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-on-surface-variant">
                      No variables available.
                    </p>
                  ) : (
                    availableVars.map((tmpl, idx) => (
                      <button
                        key={`${tmpl.parameterType}-${idx}`}
                        type="button"
                        onClick={() => handleSelectVariable(tmpl)}
                        className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-container"
                      >
                        <span className="text-sm font-medium text-on-surface">
                          {tmpl.label}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {tmpl.description}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Variable cards grid */}
      {variables.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {variables.map((variable) => (
            <VariableCard
              key={variable.id}
              variable={variable}
              onUpdate={onUpdateVariable}
              onRemove={onRemoveVariable}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 px-6 py-12 text-center">
          <span className="material-symbols-outlined mb-3 text-[40px] text-on-surface-variant/40">
            tune
          </span>
          <p className="font-body text-sm text-on-surface-variant">
            Add variables from hospital modules to build your scenario
          </p>
        </div>
      )}
    </div>
  );
}
