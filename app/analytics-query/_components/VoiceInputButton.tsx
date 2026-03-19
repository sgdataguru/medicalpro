'use client';

import { useVoiceInput } from '../_hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const { isListening, startListening, stopListening } = useVoiceInput(onTranscript);

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-1.5 rounded-lg transition-colors ${
        isListening
          ? 'bg-error/10 text-error animate-pulse'
          : 'text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface'
      }`}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      <span className="material-symbols-outlined text-[20px]">
        {isListening ? 'mic_off' : 'mic'}
      </span>
    </button>
  );
}
