'use client';

interface ExecutiveDashboardHeaderProps {
  reportingPeriod: string;
}

export default function ExecutiveDashboardHeader({
  reportingPeriod,
}: ExecutiveDashboardHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-10">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
          Executive Overview
        </h1>
        <p className="text-on-primary-container font-medium">
          Reporting Period: {reportingPeriod}
        </p>
      </div>
      <div className="flex gap-3">
        <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/10">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Live Sync
          </span>
        </div>
      </div>
    </div>
  );
}
