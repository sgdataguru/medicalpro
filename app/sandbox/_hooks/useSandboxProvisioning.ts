'use client';

import { useState, useCallback } from 'react';
import type { ProvisioningStage, SandboxConfig } from '@/lib/sandbox/sandbox.types';
import * as service from '@/lib/sandbox/sandbox.service';

export function useSandboxProvisioning() {
  const [status, setStatus] = useState<ProvisioningStage | 'idle' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provision = useCallback(async (): Promise<{
    sessionId: string;
    expiresAt: string;
    config: SandboxConfig;
  } | null> => {
    setStatus('initializing');
    setProgress(0);
    setError(null);

    try {
      const result = await service.provisionSandbox((stage, percent) => {
        setStatus(stage as ProvisioningStage);
        setProgress(percent);
      });

      setSessionId(result.sessionId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Provisioning failed');
      setStatus('error');
      return null;
    }
  }, []);

  return {
    provision,
    status,
    progress,
    sessionId,
    error,
  };
}
