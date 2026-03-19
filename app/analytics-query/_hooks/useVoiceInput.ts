'use client';

import { useState, useCallback, useRef } from 'react';

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    error: null,
    isSupported: true, // Mock always supported for demo
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    // Check for native Web Speech API support
    const hasNative =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    if (!hasNative) {
      // Mock fallback for demo — simulate voice input
      setState((s) => ({ ...s, isListening: true, error: null }));
      const timer = setTimeout(() => {
        const mockTranscript = 'What is our current bed occupancy rate?';
        setState((s) => ({ ...s, isListening: false, transcript: mockTranscript }));
        onTranscript(mockTranscript);
      }, 2000);
      recognitionRef.current = timer;
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setState((s) => ({ ...s, isListening: true, error: null }));
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript as string;
        setState((s) => ({ ...s, transcript, isListening: false }));
        onTranscript(transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setState((s) => ({ ...s, error: event.error, isListening: false }));
      };

      recognition.onend = () => {
        setState((s) => ({ ...s, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setState((s) => ({ ...s, error: 'Speech recognition failed to start', isListening: false }));
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      if (typeof recognitionRef.current === 'number') {
        clearTimeout(recognitionRef.current);
      } else if (recognitionRef.current.stop) {
        recognitionRef.current.stop();
      }
      recognitionRef.current = null;
    }
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    isSupported: state.isSupported,
    startListening,
    stopListening,
  };
}
