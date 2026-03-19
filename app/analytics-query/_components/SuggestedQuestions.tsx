'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  isLoading: boolean;
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ questions, isLoading, onSelect }: SuggestedQuestionsProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-48 bg-surface-container-high rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-3">
        Suggested Questions
      </p>
      <div className="flex gap-2 flex-wrap">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-3 py-1.5 text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/15 rounded-full hover:border-secondary/30 hover:text-secondary transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
