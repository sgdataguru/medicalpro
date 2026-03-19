'use client';

interface ResultsActionBarProps {
  onCompare: () => void;
  onShare: () => void;
  onBackToBuilder: () => void;
  onSaveResults: () => void;
}

export default function ResultsActionBar({
  onCompare,
  onShare,
  onBackToBuilder,
  onSaveResults,
}: ResultsActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Back to Builder */}
      <button
        type="button"
        onClick={onBackToBuilder}
        className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface-variant rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
        Back to Builder
      </button>

      {/* Save Results */}
      <button
        type="button"
        onClick={onSaveResults}
        className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface-variant rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        Save Results
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface-variant rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">share</span>
        Share
      </button>

      {/* Compare Scenarios (primary action, pushed right) */}
      <button
        type="button"
        onClick={onCompare}
        className="ml-auto inline-flex items-center gap-2 bg-secondary text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/90"
      >
        <span className="material-symbols-outlined text-[18px]">
          compare_arrows
        </span>
        Compare Scenarios
      </button>
    </div>
  );
}
