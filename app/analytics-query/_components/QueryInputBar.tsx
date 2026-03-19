'use client';

import { useCallback, useRef } from 'react';
import { MAX_QUERY_LENGTH } from '@/lib/analytics-query/analytics-query.constants';
import VoiceInputButton from './VoiceInputButton';

interface QueryInputBarProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (question: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isStreaming: boolean;
}

export default function QueryInputBar({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isStreaming,
}: QueryInputBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isSubmitting) {
          onSubmit(value.trim());
        }
      }
    },
    [value, isSubmitting, onSubmit],
  );

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      onChange(text);
      onSubmit(text);
    },
    [onChange, onSubmit],
  );

  return (
    <div className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/20 focus-within:border-secondary/50 focus-within:ring-1 focus-within:ring-secondary/20 transition-all">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your hospital data..."
        maxLength={MAX_QUERY_LENGTH}
        rows={1}
        className="w-full resize-none px-4 py-3 pr-24 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
        disabled={isSubmitting}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <VoiceInputButton onTranscript={handleVoiceTranscript} />
        {isStreaming ? (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">stop</span>
          </button>
        ) : (
          <button
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim() || isSubmitting}
            className="p-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        )}
      </div>
    </div>
  );
}
