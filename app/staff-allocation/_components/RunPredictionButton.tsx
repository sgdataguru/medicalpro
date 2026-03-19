'use client';

import type { PredictionJobStatus } from '@/lib/staff-allocation/staff-allocation.types';

interface RunPredictionButtonProps {
  status: PredictionJobStatus;
  onRun: () => void;
  onCancel: () => void;
}

export default function RunPredictionButton({ status, onRun, onCancel }: RunPredictionButtonProps) {
  const isProcessing = status === 'queued' || status === 'processing';

  if (isProcessing) {
    return (
      <button
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
      >
        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        {status === 'queued' ? 'Queued...' : 'Analyzing...'}
        <span className="text-xs">(Cancel)</span>
      </button>
    );
  }

  return (
    <button
      onClick={onRun}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">psychology</span>
      Run Prediction
    </button>
  );
}
