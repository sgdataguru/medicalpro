'use client';

import type { TourStep } from '@/lib/sandbox/sandbox.types';

interface TourStepCardProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function TourStepCard({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isFirst,
  isLast,
}: TourStepCardProps) {
  return (
    <div className="fixed left-1/2 top-1/2 z-[95] w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
      <div className="mx-4 rounded-2xl border border-secondary/30 bg-primary-container p-6 shadow-2xl">
        {/* Step counter */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-white/40">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-xs text-white/40 transition-colors hover:text-white"
          >
            Skip tour
          </button>
        </div>

        {/* Progress dots */}
        <div className="mb-4 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? 'bg-secondary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="mb-2 font-headline text-lg font-bold text-white">
          {step.title}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:invisible"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
            Previous
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            {isLast ? 'Finish' : 'Next'}
            {!isLast && (
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
