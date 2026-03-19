'use client';

import { MODULE_NAV_ITEMS } from '@/lib/sandbox/sandbox.constants';
import ModuleNavigationCard from './ModuleNavigationCard';

interface ModuleNavigationGridProps {
  sessionId: string;
}

export default function ModuleNavigationGrid({ sessionId }: ModuleNavigationGridProps) {
  return (
    <div data-tour="module-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {MODULE_NAV_ITEMS.map((module) => (
        <ModuleNavigationCard
          key={module.id}
          module={module}
          sessionId={sessionId}
        />
      ))}
    </div>
  );
}
