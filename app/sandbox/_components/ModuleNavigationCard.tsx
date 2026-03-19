'use client';

import Link from 'next/link';
import type { ModuleNavItem } from '@/lib/sandbox/sandbox.types';

interface ModuleNavigationCardProps {
  module: ModuleNavItem;
  sessionId: string;
}

export default function ModuleNavigationCard({
  module,
  sessionId,
}: ModuleNavigationCardProps) {
  return (
    <Link
      href={`/sandbox/${sessionId}/${module.href}`}
      data-tour={module.id === 'anomalies' ? 'anomaly-card' : undefined}
      className="group block rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/8"
      style={{ borderLeftColor: module.accentColor, borderLeftWidth: '3px' }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${module.accentColor}20` }}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ color: module.accentColor }}
          >
            {module.icon}
          </span>
        </div>
        <h3 className="font-headline text-lg font-semibold text-white">
          {module.title}
        </h3>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/50">
        {module.description}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">{module.kpiLabel}</p>
          <p className="text-lg font-bold text-white">{module.kpiValue}</p>
        </div>
        {module.secondaryKpiLabel && (
          <div className="text-right">
            <p className="text-xs text-white/40">{module.secondaryKpiLabel}</p>
            <p className="text-lg font-bold text-white">
              {module.secondaryKpiValue}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
        Explore
        <span className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </div>
    </Link>
  );
}
