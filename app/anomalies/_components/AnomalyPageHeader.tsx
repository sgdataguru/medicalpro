'use client';

import Link from 'next/link';

export default function AnomalyPageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-1">
          <Link href="/" className="hover:text-secondary-container transition-colors">
            MedicalPro
          </Link>
          <span>/</span>
          <span className="text-on-surface">Anomaly Detection</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-secondary-container">
          Anomaly Detection Center
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          Live monitoring
        </div>
      </div>
    </div>
  );
}
