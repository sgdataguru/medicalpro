'use client';

import { useSandboxContext } from '../_components/SandboxContextProvider';
import ModuleNavigationGrid from '../_components/ModuleNavigationGrid';
import QuickSimulationPrompt from '../_components/QuickSimulationPrompt';
import SessionInfoBar from '../_components/SessionInfoBar';
import GuidedTourOverlay from '../_components/GuidedTourOverlay';

export default function SandboxDashboardPage() {
  const { session } = useSandboxContext();

  return (
    <div className="min-h-screen bg-primary-container px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div data-tour="dashboard-header">
          <h1 className="font-headline text-2xl font-bold text-white">
            Sandbox Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Explore hospital analytics modules with synthetic data
          </p>
        </div>

        {/* Module Navigation */}
        <ModuleNavigationGrid sessionId={session.sessionId} />

        {/* Quick Simulation */}
        <QuickSimulationPrompt />

        {/* Session Info Footer */}
        <SessionInfoBar />
      </div>

      {/* Guided Tour - starts automatically if tour not completed */}
      {!session.tourCompleted && <GuidedTourOverlay />}
    </div>
  );
}
