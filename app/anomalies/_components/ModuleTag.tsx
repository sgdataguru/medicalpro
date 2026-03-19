'use client';

import type { HospitalModule } from '@/lib/anomaly/anomaly.types';
import { MODULE_CONFIG } from '@/lib/anomaly/anomaly.constants';

interface ModuleTagProps {
  module: HospitalModule;
}

export default function ModuleTag({ module }: ModuleTagProps) {
  const config = MODULE_CONFIG[module];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgClass}`}>
      {config.label}
    </span>
  );
}
