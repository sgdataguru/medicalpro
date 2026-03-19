'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSandboxContext } from '../../_components/SandboxContextProvider';

export default function SandboxSimulationsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { dispatch, session } = useSandboxContext();

  useEffect(() => {
    dispatch({
      type: 'SET_FEATURE_STATUS',
      payload: { feature: 'simulation', status: 'visited' },
    });
  }, [dispatch]);

  const kpis = [
    { label: 'Simulations Run', value: `${session.simulationsRun}/${session.maxSimulations}`, icon: 'labs' },
    { label: 'Last Result', value: '\u2014', icon: 'science' },
    { label: 'Confidence', value: '\u2014', icon: 'verified' },
    { label: 'Modules Impacted', value: '\u2014', icon: 'hub' },
  ];

  return (
    <div className="min-h-screen bg-primary-container px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/sandbox/${sessionId}`}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#00966820' }}
          >
            <span className="material-symbols-outlined text-[28px]" style={{ color: '#009668' }}>
              labs
            </span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-white">Foresight Simulations</h1>
            <p className="text-sm text-white/50">What-if scenario modeling and impact analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/40">
                <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
                <span className="text-xs">{kpi.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8">
          <h2 className="mb-4 font-headline text-lg font-semibold text-white">Scenario Builder</h2>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10">
            <div className="text-center text-white/30">
              <span className="material-symbols-outlined mb-2 text-[48px]">psychology</span>
              <p className="text-sm">Simulation workspace</p>
              <p className="text-xs">Synthetic data preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
