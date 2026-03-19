'use client';

import { useState, useCallback } from 'react';
import type { SimulationVariable } from '@/lib/simulation/simulation.types';
import { useNaturalLanguageParse } from '../_hooks/useNaturalLanguageParse';

interface NaturalLanguageInputProps {
  onAddVariable: (v: SimulationVariable) => void;
}

function generateId(): string {
  return `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function NaturalLanguageInput({
  onAddVariable,
}: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const { parse, isParsing, result, reset } = useNaturalLanguageParse();

  const handleParse = useCallback(() => {
    if (input.trim()) {
      parse(input);
    }
  }, [input, parse]);

  const handleAddVariable = useCallback(
    (template: Omit<SimulationVariable, 'id'>) => {
      const variable: SimulationVariable = {
        ...template,
        id: generateId(),
      };
      onAddVariable(variable);
    },
    [onAddVariable],
  );

  const handleReset = useCallback(() => {
    setInput('');
    reset();
  }, [reset]);

  const confidenceColor =
    result && result.confidence >= 0.7
      ? 'bg-emerald-100 text-emerald-700'
      : result && result.confidence >= 0.4
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container p-5 ring-1 ring-outline-variant/15">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[22px] text-secondary">
          smart_toy
        </span>
        <h3 className="font-headline text-base font-semibold text-on-surface">
          AI-Assisted Input
        </h3>
      </div>

      {/* Input area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your scenario changes in plain language..."
        rows={3}
        className="w-full resize-none rounded-lg bg-surface-container p-3 font-body text-sm text-on-surface ring-1 ring-outline-variant/15 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
      />

      {/* Parse button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleParse}
          disabled={isParsing || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            smart_toy
          </span>
          {isParsing ? 'Parsing...' : 'Parse with AI'}
        </button>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Clear results
          </button>
        )}
      </div>

      {/* Loading shimmer */}
      {isParsing && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-secondary/30" />
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </div>
      )}

      {/* Results */}
      {result && !isParsing && (
        <div className="flex flex-col gap-3">
          {/* Interpretation and confidence */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm italic text-on-surface-variant">
              {result.interpretation}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColor}`}
            >
              {(result.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          {/* Parsed variables */}
          {result.variables.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-on-surface-variant">
                Parsed Variables
              </p>
              {result.variables.map((tmpl, idx) => (
                <div
                  key={`${tmpl.parameterType}-${idx}`}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 ring-1 ring-outline-variant/15"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-on-surface">
                      {tmpl.label}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {tmpl.currentValue} {tmpl.unit} &rarr; {tmpl.adjustedValue}{' '}
                      {tmpl.unit}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddVariable(tmpl)}
                    className="inline-flex items-center gap-1 rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add
                    </span>
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Clarification needed */}
          {result.clarificationNeeded && result.clarificationPrompt && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <span className="material-symbols-outlined mt-0.5 text-[18px] text-amber-600">
                help
              </span>
              <p className="text-sm text-amber-800">
                {result.clarificationPrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
