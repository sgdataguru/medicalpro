'use client';

import { useState, useCallback, useRef } from 'react';

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAINarrative() {
  const [expanded, setExpanded] = useState(false);
  const [copying, setCopying] = useState(false);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    // Clear any existing timeout to avoid stale resets
    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);

      copyTimeoutRef.current = setTimeout(() => {
        setCopying(false);
        copyTimeoutRef.current = null;
      }, 2_000);
    } catch {
      // Silently fail if clipboard access is denied
      setCopying(false);
    }
  }, []);

  return { expanded, copying, toggleExpanded, copyToClipboard } as const;
}
