'use client';

import { useState } from 'react';
import { useSandboxContext } from './SandboxContextProvider';
import ExplorationProgress from './ExplorationProgress';
import RequestDemoModal from './RequestDemoModal';

export default function SessionInfoBar() {
  const { session, formattedTime } = useSandboxContext();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <>
      <div
        data-tour="session-info"
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="material-symbols-outlined text-[18px]">timer</span>
          <span className="tabular-nums">{formattedTime}</span>
          <span>remaining</span>
        </div>

        <ExplorationProgress features={session.features} />

        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="material-symbols-outlined text-[18px]">labs</span>
          <span>
            {session.simulationsRun} / {session.maxSimulations} simulations
          </span>
        </div>

        <button
          onClick={() => setShowDemoModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
        >
          <span className="material-symbols-outlined text-[18px]">
            calendar_month
          </span>
          Request Full Demo
        </button>
      </div>

      {showDemoModal && (
        <RequestDemoModal onClose={() => setShowDemoModal(false)} />
      )}
    </>
  );
}
