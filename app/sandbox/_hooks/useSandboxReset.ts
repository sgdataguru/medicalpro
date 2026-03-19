'use client';

import { useState, useCallback } from 'react';
import * as service from '@/lib/sandbox/sandbox.service';

export function useSandboxReset(sessionId: string) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(async () => {
    setIsResetting(true);
    setError(null);
    try {
      await service.resetSandbox(sessionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset sandbox');
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [sessionId]);

  return { reset, isResetting, error };
}
