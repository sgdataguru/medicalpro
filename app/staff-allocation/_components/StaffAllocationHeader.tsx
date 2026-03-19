'use client';

import { useState } from 'react';

interface StaffAllocationHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export default function StaffAllocationHeader({ onRefresh, loading }: StaffAllocationHeaderProps) {
  const [activeView, setActiveView] = useState<'clinical' | 'editorial'>('clinical');

  return (
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Staffing Optimization
        </h2>
        <p className="text-on-surface-variant mt-1">
          Real-time distribution and predictive logistics for regional clinical units.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveView('editorial'); onRefresh(); }}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'editorial'
              ? 'bg-secondary text-on-secondary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          EDITORIAL VIEW
        </button>
        <button
          onClick={() => setActiveView('clinical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'clinical'
              ? 'bg-secondary text-on-secondary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          CLINICAL VIEW
        </button>
      </div>
    </div>
  );
}
