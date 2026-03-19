'use client';

import type { DataBasis } from '@/lib/recommendations/recommendations.types';
import {
  getModuleLabel,
  formatRecommendationDateTime,
} from '@/lib/recommendations/recommendations.utils';

interface SupportingDataTableProps {
  dataBasis: DataBasis;
}

export default function SupportingDataTable({
  dataBasis,
}: SupportingDataTableProps) {
  const moduleLabels = dataBasis.modules.map(getModuleLabel);

  const rows: { label: string; value: string }[] = [
    {
      label: 'Time Frame',
      value: `${dataBasis.timeframeDays} days`,
    },
    {
      label: 'Records Analyzed',
      value: dataBasis.recordCount.toLocaleString(),
    },
    {
      label: 'Data Quality',
      value: `${dataBasis.dataQualityScore}%`,
    },
    {
      label: 'Model Accuracy',
      value: `${dataBasis.modelAccuracy}%`,
    },
    {
      label: 'Modules',
      value: moduleLabels.join(', '),
    },
    {
      label: 'Last Updated',
      value: formatRecommendationDateTime(dataBasis.lastDataUpdateAt),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-outline-variant p-4 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-xs font-medium uppercase tracking-widest text-on-primary-container">
            {row.label}
          </p>
          <p className="mt-0.5 text-sm font-medium text-on-surface">
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}
