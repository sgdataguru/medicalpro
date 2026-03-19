'use client';

import SandboxModeIndicator from './SandboxModeIndicator';
import SessionCountdownTimer from './SessionCountdownTimer';
import ResetSandboxButton from './ResetSandboxButton';

export default function SandboxBanner() {
  return (
    <div
      data-tour="sandbox-banner"
      className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-white/10 bg-primary-container/95 px-4 py-2 backdrop-blur-md sm:px-6"
    >
      {/* Left: mode indicator */}
      <SandboxModeIndicator />

      {/* Center: countdown timer */}
      <div className="flex-1 text-center">
        <SessionCountdownTimer />
      </div>

      {/* Right: reset button */}
      <ResetSandboxButton />
    </div>
  );
}
