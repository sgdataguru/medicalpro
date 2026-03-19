/**
 * @file useNaturalLanguageParse.ts
 * @description Hook for parsing natural language input into simulation variables via mock NLP service.
 * @module app/simulations/_hooks
 */

'use client';

import { useState, useCallback } from 'react';
import type { NlpParseResult } from '@/lib/simulation/simulation.types';
import { parseNaturalLanguage } from '@/lib/simulation/simulation.service';

export function useNaturalLanguageParse() {
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<NlpParseResult | null>(null);

  const parse = useCallback(async (input: string) => {
    if (!input.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await parseNaturalLanguage(input);
      setResult(parsed);
    } catch {
      setResult({
        variables: [],
        interpretation: 'Failed to parse input.',
        confidence: 0,
        clarificationNeeded: true,
        clarificationPrompt: 'An error occurred while parsing. Please try again.',
      });
    } finally {
      setIsParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { parse, isParsing, result, reset };
}
