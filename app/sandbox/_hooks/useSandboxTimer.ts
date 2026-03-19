'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatCountdownTime, getWarningLevel } from '@/lib/sandbox/sandbox.utils';
import type { WarningLevel } from '@/lib/sandbox/sandbox.types';

interface UseSandboxTimerOptions {
  expiresAt: string;
  onExpired?: () => void;
  onWarningChange?: (level: WarningLevel) => void;
}

export function useSandboxTimer({
  expiresAt,
  onExpired,
  onWarningChange,
}: UseSandboxTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const callbacksRef = useRef({ onExpired, onWarningChange });
  callbacksRef.current = { onExpired, onWarningChange };
  const lastWarningRef = useRef<WarningLevel>('none');

  useEffect(() => {
    if (!expiresAt) return;

    const computeRemaining = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, remaining);
    };

    setTimeRemaining(computeRemaining());

    const interval = setInterval(() => {
      const remaining = computeRemaining();
      setTimeRemaining(remaining);

      const level = getWarningLevel(remaining);
      if (level !== lastWarningRef.current) {
        lastWarningRef.current = level;
        callbacksRef.current.onWarningChange?.(level);
      }

      if (remaining <= 0) {
        setIsExpired(true);
        callbacksRef.current.onExpired?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formattedTime = formatCountdownTime(timeRemaining);
  const warningLevel = getWarningLevel(timeRemaining);

  return {
    timeRemaining,
    formattedTime,
    warningLevel,
    isExpired,
  };
}
