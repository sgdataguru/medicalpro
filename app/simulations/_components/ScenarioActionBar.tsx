'use client';

interface ScenarioActionBarProps {
  variableCount: number;
  onRunSimulation: () => void;
  onSaveDraft: () => void;
  loading: boolean;
}

export default function ScenarioActionBar({
  variableCount,
  onRunSimulation,
  onSaveDraft,
  loading,
}: ScenarioActionBarProps) {
  const isRunDisabled = variableCount === 0 || loading;

  return (
    <div className="sticky bottom-0 border-t border-outline-variant/15 bg-surface/95 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left: variable count */}
        <p className="font-body text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{variableCount}</span>{' '}
          variable{variableCount !== 1 ? 's' : ''} configured
        </p>

        {/* Right: action buttons */}
        <div className="flex items-center gap-3">
          {/* Save Draft */}
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Draft
          </button>

          {/* Run Simulation */}
          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isRunDisabled}
            className={`inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors ${
              isRunDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-secondary/90'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? 'hourglass_top' : 'play_arrow'}
            </span>
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
