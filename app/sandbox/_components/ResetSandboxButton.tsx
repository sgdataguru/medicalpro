'use client';

import { useState } from 'react';
import { useSandboxContext } from './SandboxContextProvider';
import { useSandboxReset } from '../_hooks/useSandboxReset';

export default function ResetSandboxButton() {
  const { session, loadSession } = useSandboxContext();
  const { reset, isResetting } = useSandboxReset(session.sessionId);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    const success = await reset();
    if (success) {
      await loadSession(session.sessionId);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isResetting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-50 sm:text-sm"
      >
        <span className="material-symbols-outlined text-[16px]">
          restart_alt
        </span>
        <span className="hidden sm:inline">Reset</span>
      </button>

      {/* Confirmation Dialog Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-primary-container p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-orange-400">
                warning
              </span>
              <h3 className="font-headline text-lg font-bold text-white">
                Reset Sandbox?
              </h3>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-white/60">
              This will restore all data to its original state. Your exploration
              progress and any simulation results will be cleared. This action
              cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">
                      progress_activity
                    </span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">
                      restart_alt
                    </span>
                    Reset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
