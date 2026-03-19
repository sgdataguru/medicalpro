'use client';

import type { ProvisioningStage } from '@/lib/sandbox/sandbox.types';
import { PROVISIONING_STAGES } from '@/lib/sandbox/sandbox.constants';

interface SandboxProvisioningLoaderProps {
  status: ProvisioningStage | 'idle' | 'error';
  progress: number;
}

export default function SandboxProvisioningLoader({
  status,
  progress,
}: SandboxProvisioningLoaderProps) {
  const stageLabel =
    status === 'idle' || status === 'error'
      ? 'Preparing...'
      : PROVISIONING_STAGES[status] ?? 'Processing...';

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Spinner */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-secondary" />
        <span className="material-symbols-outlined text-[28px] text-secondary">
          monitoring
        </span>
      </div>

      {/* Stage Label */}
      <p className="text-sm font-medium text-white/80">{stageLabel}</p>

      {/* Progress Bar */}
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-400">
          Provisioning failed. Please try again.
        </p>
      )}
    </div>
  );
}
