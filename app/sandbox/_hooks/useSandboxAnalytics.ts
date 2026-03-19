'use client';

import { useCallback, useRef } from 'react';
import type { AnalyticsEventType, SandboxFeatureKey } from '@/lib/sandbox/sandbox.types';
import * as service from '@/lib/sandbox/sandbox.service';

export function useSandboxAnalytics(sessionId: string) {
  const trackedRef = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(
    async (eventType: AnalyticsEventType, feature?: string, metadata?: Record<string, string | number>) => {
      await service.trackAnalyticsEvent(sessionId, {
        eventType,
        feature,
        metadata,
      });
    },
    [sessionId],
  );

  const trackFeatureVisit = useCallback(
    (feature: SandboxFeatureKey) => {
      if (!trackedRef.current.has(feature)) {
        trackedRef.current.add(feature);
        trackEvent('feature_visited', feature);
      }
    },
    [trackEvent],
  );

  const trackSimulationRun = useCallback(() => {
    trackEvent('simulation_run');
  }, [trackEvent]);

  return {
    trackEvent,
    trackFeatureVisit,
    trackSimulationRun,
  };
}
