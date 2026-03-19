'use client';

import type { SandboxFeatureUsage } from '@/lib/sandbox/sandbox.types';
import {
  calculateExplorationProgress,
  countExploredFeatures,
  totalFeatureCount,
} from '@/lib/sandbox/sandbox.utils';

interface ExplorationProgressProps {
  features: SandboxFeatureUsage;
}

export default function ExplorationProgress({
  features,
}: ExplorationProgressProps) {
  const progress = calculateExplorationProgress(features);
  const explored = countExploredFeatures(features);
  const total = totalFeatureCount(features);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/60">
        Features explored: {explored}/{total}
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
