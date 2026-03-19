'use client';

import { useCallback } from 'react';
import { useGuidedTour } from '../_hooks/useGuidedTour';
import { useSandboxContext } from './SandboxContextProvider';
import TourStepCard from './TourStepCard';

export default function GuidedTourOverlay() {
  const { dispatch } = useSandboxContext();
  const {
    currentStep,
    totalSteps,
    isActive,
    currentStepData,
    next,
    previous,
    skip,
    start,
  } = useGuidedTour();

  const handleComplete = useCallback(() => {
    dispatch({ type: 'SET_TOUR_COMPLETED', payload: true });
  }, [dispatch]);

  const handleNext = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      handleComplete();
    } else {
      next();
    }
  }, [currentStep, totalSteps, next, handleComplete]);

  const handleSkip = useCallback(() => {
    skip();
    handleComplete();
  }, [skip, handleComplete]);

  if (!isActive && currentStep === 0) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-primary-container p-8 text-center shadow-2xl">
          <span className="material-symbols-outlined mb-4 text-[48px] text-secondary">
            explore
          </span>
          <h2 className="mb-2 font-headline text-xl font-bold text-white">
            Welcome to Your Guided Tour
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            Take a quick tour to learn about the key features of the Sovereign
            Analyst platform.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSkip}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              Skip Tour
            </button>
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
            >
              <span className="material-symbols-outlined text-[18px]">
                play_arrow
              </span>
              Start Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50">
      <TourStepCard
        step={currentStepData}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrevious={previous}
        onSkip={handleSkip}
        isFirst={currentStep === 0}
        isLast={currentStep >= totalSteps - 1}
      />
    </div>
  );
}
