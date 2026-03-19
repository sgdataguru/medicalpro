'use client';

import { SUGGESTION_SCENARIOS } from '@/lib/sandbox/sandbox.constants';

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {SUGGESTION_SCENARIOS.map((scenario) => (
        <button
          key={scenario.text}
          onClick={() => onSelect(scenario.text)}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-secondary/30 hover:bg-secondary/10 hover:text-white"
        >
          {scenario.text}
        </button>
      ))}
    </div>
  );
}
