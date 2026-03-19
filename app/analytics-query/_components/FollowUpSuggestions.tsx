'use client';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (question: string) => void;
}

export default function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
        Follow-up Questions
      </p>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left text-on-surface-variant bg-surface-container-lowest border border-outline-variant/10 rounded-lg hover:border-secondary/30 hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary/60 shrink-0">
              arrow_forward
            </span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
