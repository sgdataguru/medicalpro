'use client';

import { useState, useCallback, useMemo } from 'react';
import { TOUR_STEPS } from '@/lib/sandbox/sandbox.constants';
import type { TourStep } from '@/lib/sandbox/sandbox.types';

interface UseGuidedTourOptions {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useGuidedTour(options: UseGuidedTourOptions = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = TOUR_STEPS.length;

  const currentStepData: TourStep | null = useMemo(() => {
    if (!isActive || currentStep >= totalSteps) return null;
    return TOUR_STEPS[currentStep];
  }, [isActive, currentStep, totalSteps]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setIsComplete(false);
  }, []);

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
      setIsComplete(true);
      options.onComplete?.();
    }
  }, [currentStep, totalSteps, options]);

  const previous = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    setIsComplete(true);
    options.onSkip?.();
  }, [options]);

  const restart = useCallback(() => {
    start();
  }, [start]);

  return {
    currentStep,
    totalSteps,
    isActive,
    isComplete,
    currentStepData,
    start,
    next,
    previous,
    skip,
    restart,
  };
}
