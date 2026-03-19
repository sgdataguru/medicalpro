'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSandboxContext } from './SandboxContextProvider';
import SuggestionChips from './SuggestionChips';

export default function QuickSimulationPrompt() {
  const router = useRouter();
  const { session } = useSandboxContext();
  const [scenario, setScenario] = useState('');

  const handleRun = () => {
    if (!scenario.trim()) return;
    router.push(`/sandbox/${session.sessionId}/simulations`);
  };

  return (
    <div data-tour="simulation-prompt" className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="mb-4 font-headline text-lg font-semibold text-white">
        Quick Simulation
      </h2>

      <SuggestionChips onSelect={setScenario} />

      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="Type your scenario..."
          className="flex-1 rounded-lg bg-white/5 px-4 py-3 text-sm text-white ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
        />
        <button
          onClick={handleRun}
          disabled={!scenario.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            play_arrow
          </span>
          Run
        </button>
      </div>
    </div>
  );
}
