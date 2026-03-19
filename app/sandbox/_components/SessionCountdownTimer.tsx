'use client';

import { useSandboxContext } from './SandboxContextProvider';
import type { WarningLevel } from '@/lib/sandbox/sandbox.types';

/** Tailwind colour classes keyed by warning level */
const WARNING_COLORS: Record<WarningLevel, string> = {
  none: 'text-white/70',
  low: 'text-yellow-400',
  medium: 'text-orange-400',
  critical: 'text-red-400 animate-pulse',
};

const WARNING_ICONS: Record<WarningLevel, string> = {
  none: 'timer',
  low: 'timer',
  medium: 'avg_pace',
  critical: 'alarm',
};

export default function SessionCountdownTimer() {
  const { formattedTime, warningLevel, isExpired } = useSandboxContext();

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400">
        <span className="material-symbols-outlined text-[18px]">
          timer_off
        </span>
        Session expired
      </span>
    );
  }

  const colorClass = WARNING_COLORS[warningLevel];
  const icon = WARNING_ICONS[warningLevel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium tabular-nums ${colorClass}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {formattedTime}
    </span>
  );
}
