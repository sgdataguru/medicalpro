'use client';

interface CompareViewToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function CompareViewToggle({ enabled, onToggle }: CompareViewToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
        enabled
          ? 'bg-secondary/10 text-secondary border border-secondary/30'
          : 'text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">compare</span>
      Compare View
    </button>
  );
}
