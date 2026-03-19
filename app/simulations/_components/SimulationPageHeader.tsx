'use client';

import type { SimulationViewMode } from '@/lib/simulation/simulation.types';

interface SimulationPageHeaderProps {
  viewMode: SimulationViewMode;
  scenarioName?: string;
  onNewScenario: () => void;
  onNavigate: (mode: SimulationViewMode) => void;
  onBackToLibrary: () => void;
}

const SUBTITLE_MAP: Record<SimulationViewMode, string | null> = {
  library: 'Scenario Library',
  builder: null, // handled dynamically
  results: 'Simulation Results',
  comparison: 'Compare Scenarios',
};

export default function SimulationPageHeader({
  viewMode,
  scenarioName,
  onNewScenario,
  onNavigate,
  onBackToLibrary,
}: SimulationPageHeaderProps) {
  const subtitle =
    viewMode === 'builder'
      ? scenarioName || 'New Scenario'
      : SUBTITLE_MAP[viewMode];

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left section: back button + title block */}
      <div className="flex items-center gap-3">
        {viewMode !== 'library' && (
          <button
            type="button"
            onClick={onBackToLibrary}
            className="flex items-center justify-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Back to library"
          >
            <span className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Foresight Simulations
          </h1>
          {subtitle && (
            <p className="font-body text-sm text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right section: actions */}
      <div className="flex items-center gap-3">
        {viewMode === 'library' && (
          <button
            type="button"
            onClick={onNewScenario}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Scenario
          </button>
        )}
      </div>
    </div>
  );
}
