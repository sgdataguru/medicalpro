'use client';

import Link from 'next/link';

import type { OutcomeSummary } from '@/lib/recommendations/recommendations.types';
import { formatDollars } from '@/lib/recommendations/recommendations.utils';

interface RecommendationDashboardProps {
  totalCount: number;
  newCount: number;
  outcomeSummary: OutcomeSummary | null;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sublabel?: string;
  iconColorClass?: string;
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  iconColorClass = 'text-secondary',
}: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-outline-variant/15 bg-surface p-4 min-w-[180px] flex-1">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 ${iconColorClass}`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-on-primary-container">
          {label}
        </p>
        <p className="font-headline text-xl font-bold text-on-surface leading-tight">
          {value}
        </p>
        {sublabel && (
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

const NAV_LINKS: { href: string; label: string; icon: string }[] = [
  { href: '/recommendations/accepted', label: 'Accepted', icon: 'check_circle' },
  { href: '/recommendations/outcomes', label: 'Outcomes', icon: 'analytics' },
  { href: '/recommendations/history', label: 'History', icon: 'history' },
];

export default function RecommendationDashboard({
  totalCount,
  newCount,
  outcomeSummary,
}: RecommendationDashboardProps) {
  const successRate = outcomeSummary?.successRate ?? 0;
  const averageImpact = outcomeSummary?.averageImpactDollars ?? 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              recommend
            </span>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Prescriptive Recommendations
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant">
            {totalCount} active recommendation{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Navigation links */}
        <div className="flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/20 bg-surface text-xs font-medium text-on-surface-variant hover:border-secondary/30 hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="fiber_new"
          label="Active Count"
          value={totalCount}
          sublabel="Pending review"
        />
        <StatCard
          icon="priority_high"
          label="Urgent"
          value={newCount}
          sublabel="Require attention"
          iconColorClass="text-error"
        />
        <StatCard
          icon="trending_up"
          label="Success Rate"
          value={`${successRate}%`}
          sublabel={
            outcomeSummary
              ? `${outcomeSummary.positiveOutcomes} of ${outcomeSummary.totalAccepted} positive`
              : 'No data yet'
          }
          iconColorClass="text-on-tertiary-container"
        />
        <StatCard
          icon="payments"
          label="Avg Impact"
          value={averageImpact !== 0 ? formatDollars(averageImpact) : '--'}
          sublabel={
            outcomeSummary
              ? `Across ${outcomeSummary.totalAccepted} accepted`
              : 'No data yet'
          }
          iconColorClass="text-warning"
        />
      </div>
    </div>
  );
}
