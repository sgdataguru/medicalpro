'use client';

import type { SimulationProgress } from '@/lib/simulation/simulation.types';
import { SIMULATION_STAGES } from '@/lib/simulation/simulation.constants';

interface SimulationProgressOverlayProps {
  progress: SimulationProgress;
  onCancel: () => void;
}

export default function SimulationProgressOverlay({
  progress,
  onCancel,
}: SimulationProgressOverlayProps) {
  const currentStageIndex = SIMULATION_STAGES.findIndex((s) => s.stage === progress.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-surface p-8 shadow-2xl ring-1 ring-outline-variant/15">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
            <span className="material-symbols-outlined animate-spin text-[24px] text-secondary">
              progress_activity
            </span>
          </div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Running Simulation
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {progress.currentMessage}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Overall Progress</span>
            <span>{Math.round(progress.overallProgress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-300 ease-out"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stage stepper */}
        <div className="mb-6 space-y-1">
          {SIMULATION_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.stage}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isCurrent
                    ? 'bg-secondary/10 text-secondary font-medium'
                    : isCompleted
                      ? 'text-on-surface-variant/60'
                      : 'text-on-surface-variant/30'
                }`}
              >
                {/* Step indicator */}
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[18px] text-green-600">
                      check_circle
                    </span>
                  ) : isCurrent ? (
                    <div className="h-3 w-3 animate-pulse rounded-full bg-secondary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-on-surface-variant/20" />
                  )}
                </div>

                {/* Icon + Label */}
                <span className="material-symbols-outlined text-[16px]">{stage.icon}</span>
                <span>{stage.label}</span>

                {/* Stage progress for current */}
                {isCurrent && (
                  <span className="ml-auto text-xs text-secondary/60">
                    {Math.round(progress.stageProgress)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-5 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            Cancel Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
