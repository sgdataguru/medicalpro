'use client';

interface RecommendationActionsProps {
  onAccept: () => void;
  onReject: () => void;
  disabled: boolean;
}

export default function RecommendationActions({ onAccept, onReject, disabled }: RecommendationActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAccept}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">check</span>
        Accept
      </button>
      <button
        onClick={onReject}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
        Reject
      </button>
    </div>
  );
}
