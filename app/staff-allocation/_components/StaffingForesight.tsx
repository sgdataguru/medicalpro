'use client';

import type { StaffingPrediction, PredictionJobStatus } from '@/lib/staff-allocation/staff-allocation.types';

interface StaffingForesightProps {
  prediction: StaffingPrediction | null;
  predictionStatus: PredictionJobStatus;
  onRunPrediction: () => void;
}

export default function StaffingForesight({ prediction, predictionStatus, onRunPrediction }: StaffingForesightProps) {
  const isProcessing = predictionStatus === 'queued' || predictionStatus === 'processing';

  // Simulated bar heights for the projection chart
  const barHeights = prediction
    ? prediction.departmentPredictions.slice(0, 7).map((dp) => {
        const totalDemand = dp.shifts.reduce((s, sh) => s + sh.predictedDemand, 0);
        return Math.min(100, Math.max(20, totalDemand));
      })
    : [40, 55, 45, 85, 95, 60, 50];

  const maxBar = Math.max(...barHeights);
  const peakIndex = barHeights.indexOf(maxBar);

  const projectedIncrease = prediction
    ? `+${((prediction.confidence * 20) + 5).toFixed(1)}%`
    : '+12.5%';

  return (
    <div className="h-fit">
      <div className="bg-secondary rounded-2xl p-1 shadow-2xl shadow-secondary/20">
        {/* Blue header */}
        <div className="bg-secondary text-white p-6 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">auto_awesome</span>
            <h3 className="font-bold font-headline tracking-tight uppercase text-xs">Staffing Foresight</h3>
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">30-DAY PROJECTION</span>
        </div>

        {/* Content */}
        <div className="bg-surface-container-lowest rounded-xl p-6 space-y-6">
          {/* Projection chart */}
          <div className="relative py-4">
            {isProcessing && (
              <div className="absolute inset-0 bg-surface-dim/30 backdrop-blur-[2px] rounded-lg border-2 border-dashed border-outline/30 flex items-center justify-center z-10">
                <span className="text-xs font-bold text-secondary">RUNNING SIMULATION...</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-xs font-bold text-on-surface-variant">Projected Headcount Need</p>
                <p className="text-xl font-black text-secondary">{projectedIncrease}</p>
              </div>
              <div className="flex items-end gap-1 h-32">
                {barHeights.map((h, i) => {
                  const isPeak = i === peakIndex || i === peakIndex - 1;
                  const heightPercent = (h / maxBar) * 100;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t w-full transition-all ${isPeak ? 'bg-secondary' : 'bg-surface-container-low'}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant opacity-50 uppercase">
                <span>Week 1</span>
                <span>Peak Window</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          {/* Insight cards */}
          <div className="space-y-4 pt-4">
            <div className="bg-surface-container-low p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-secondary">event_note</span>
                <span className="text-xs font-bold text-on-surface">Holiday Seasonal Influx</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Historical volume suggests a 22% increase in respiratory admissions starting within the projection window.
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-on-tertiary-container">check_circle</span>
                <span className="text-xs font-bold text-on-surface">Recruitment Pipeline</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                6 Residents and 12 RNs scheduled to onboard within the foresight window.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onRunPrediction}
            disabled={isProcessing}
            className="w-full py-4 bg-secondary text-white rounded-xl font-bold font-headline text-sm hover:bg-secondary-container transition-all shadow-lg shadow-secondary/10 disabled:opacity-60"
          >
            {isProcessing ? 'RUNNING SIMULATION...' : 'ADJUST FORESIGHT PARAMETERS'}
          </button>
        </div>
      </div>
    </div>
  );
}
