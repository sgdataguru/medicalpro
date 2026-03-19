'use client';

import { ForesightSimulation } from '@/lib/dashboard/dashboard.types';

interface ForesightSimulationROIProps {
  data: ForesightSimulation;
}

export default function ForesightSimulationROI({ data }: ForesightSimulationROIProps) {
  return (
    <div className="bg-surface-container-low p-8 rounded-xl shadow-inner border border-dashed border-on-primary-container/30 relative overflow-hidden">
      {/* Watermark */}
      <span className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 material-symbols-outlined text-[200px]">
        auto_graph
      </span>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-lg shadow-tertiary-fixed/20">
          <span className="material-symbols-outlined text-on-tertiary-container">
            query_stats
          </span>
        </div>
        <div>
          <h3 className="font-headline font-extrabold text-lg">
            Foresight Simulation: ROI
          </h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            Active Scenario: {data.scenarioName}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Projected Savings */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-lg border border-white/40">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
            Projected Savings
          </p>
          <p className="text-2xl font-headline font-extrabold text-on-surface">
            {data.projectedSavings}
          </p>
          <p className="text-[9px] text-on-tertiary-container font-bold">
            {data.savingsSubtitle}
          </p>
        </div>

        {/* Efficiency Delta */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-lg border border-white/40">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
            Efficiency Delta
          </p>
          <p className="text-2xl font-headline font-extrabold text-on-surface">
            {data.efficiencyDelta}
          </p>
          <p className="text-[9px] text-on-tertiary-container font-bold">
            {data.efficiencySubtitle}
          </p>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-6 p-4 bg-tertiary-container rounded-lg border border-on-tertiary-container/10">
        <p className="text-xs text-on-tertiary-container leading-relaxed mb-3">
          <span className="font-bold">Insight: </span>
          {data.insightHtml}
        </p>
        <div className="flex items-center gap-2">
          <button className="text-[10px] font-bold py-1 px-3 bg-on-tertiary-container text-white rounded uppercase tracking-widest">
            Apply Globally
          </button>
          <button className="text-[10px] font-bold py-1 px-3 border border-on-tertiary-container/30 text-on-tertiary-container rounded uppercase tracking-widest">
            Deep Dive Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
