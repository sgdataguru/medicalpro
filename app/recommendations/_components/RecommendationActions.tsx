'use client';

interface RecommendationActionsProps {
  recommendationId: string;
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDismiss: (id: string) => void;
}

export default function RecommendationActions({
  recommendationId,
  onAccept,
  onDefer,
  onDismiss,
}: RecommendationActionsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Accept Button */}
      <button
        type="button"
        onClick={() => onAccept(recommendationId)}
        className="inline-flex items-center gap-2 rounded-lg bg-on-tertiary-container px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-on-tertiary-container/90 focus:outline-none focus:ring-2 focus:ring-on-tertiary-container/50"
      >
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        Accept
      </button>

      {/* Defer Button */}
      <button
        type="button"
        onClick={() => onDefer(recommendationId)}
        className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-transparent px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-outline-variant/50"
      >
        <span className="material-symbols-outlined text-[18px]">schedule</span>
        Defer
      </button>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => onDismiss(recommendationId)}
        className="inline-flex items-center gap-2 rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-outline-variant/50"
      >
        <span className="material-symbols-outlined text-[18px]">cancel</span>
        Dismiss
      </button>
    </div>
  );
}
