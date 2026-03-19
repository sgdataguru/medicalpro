'use client';

import type { KpiCard } from '@/lib/dashboard/dashboard.types';

interface KpiSectionProps {
  kpis: KpiCard[];
}

export default function KpiSection({ kpis }: KpiSectionProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {kpis.map((kpi) =>
        kpi.gradient ? (
          <GradientCard key={kpi.label} kpi={kpi} />
        ) : (
          <RegularCard key={kpi.label} kpi={kpi} />
        )
      )}
    </section>
  );
}

function RegularCard({ kpi }: { kpi: KpiCard }) {
  const progressPercent =
    kpi.progress && kpi.progress.target > 0
      ? Math.min((kpi.progress.current / kpi.progress.target) * 100, 100)
      : 0;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
      {/* Top row: label + badge or icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
          {kpi.label}
        </span>

        {kpi.badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              kpi.badge.variant === 'success'
                ? 'text-on-tertiary-container bg-tertiary-container/10'
                : kpi.badge.variant === 'error'
                  ? 'text-error bg-error/10'
                  : 'text-on-surface-variant bg-surface-container-low'
            }`}
          >
            {kpi.badge.text}
          </span>
        )}

        {!kpi.badge && kpi.icon && (
          <span className="material-symbols-outlined text-secondary text-sm">
            {kpi.icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-headline font-extrabold text-on-surface mb-1">
        {kpi.value}
      </p>

      {/* Progress bar */}
      {kpi.progress && (
        <div className="mt-3 mb-1">
          <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-on-primary-container mt-1">
            {kpi.progress.label}
          </p>
        </div>
      )}

      {/* Subtitle */}
      {kpi.subtitle && !kpi.progress && (
        <p className="text-xs text-on-primary-container flex items-center gap-1">
          {kpi.subtitleIcon && (
            <span
              className={`material-symbols-outlined text-sm ${
                kpi.label.toLowerCase().includes('ar days') ||
                kpi.label.toLowerCase().includes('a/r')
                  ? 'text-error'
                  : 'text-secondary'
              }`}
            >
              {kpi.subtitleIcon}
            </span>
          )}
          {kpi.subtitle}
        </p>
      )}
    </div>
  );
}

function GradientCard({ kpi }: { kpi: KpiCard }) {
  return (
    <div className="bg-gradient-to-br from-secondary to-secondary-container p-6 rounded-xl shadow-lg shadow-blue-500/20 text-white">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-white/70">
          {kpi.label}
        </span>

        {kpi.icon && (
          <span className="material-symbols-outlined text-white/50 text-sm">
            {kpi.icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-headline font-extrabold text-white mb-1">
        {kpi.value}
      </p>

      {/* Subtitle */}
      {kpi.subtitle && (
        <p className="text-xs text-blue-100 font-medium opacity-90 flex items-center gap-1">
          {kpi.subtitleIcon && (
            <span className="material-symbols-outlined text-sm text-white/50">
              {kpi.subtitleIcon}
            </span>
          )}
          {kpi.subtitle}
        </p>
      )}
    </div>
  );
}
