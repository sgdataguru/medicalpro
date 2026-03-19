'use client';

import { PayerRow } from '@/lib/dashboard/dashboard.types';

interface PayerMixAnalysisProps {
  rows: PayerRow[];
}

function getBarColor(provider: string): string {
  if (provider.toLowerCase().includes('medicare')) return 'bg-on-surface-variant';
  if (provider.toLowerCase().includes('private') || provider.toLowerCase().includes('blue'))
    return 'bg-secondary';
  if (provider.toLowerCase().includes('aetna') || provider.toLowerCase().includes('united'))
    return 'bg-secondary/70';
  return 'bg-on-surface-variant';
}

const badgeStyle: Record<string, string> = {
  low: 'bg-error/10 text-error',
  high: 'bg-on-tertiary-container/10 text-on-tertiary-container',
  optimal: 'bg-secondary/10 text-secondary',
};

export default function PayerMixAnalysis({ rows }: PayerMixAnalysisProps) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline font-extrabold text-lg">
          Payer Mix Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-primary-container">
            Margin Health
          </span>
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="w-2 h-2 rounded-full bg-error" />
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-xs">
        <thead>
          <tr>
            {['Provider', 'Revenue Share', 'Avg Reimbursement', 'Margin Status'].map(
              (col) => (
                <th
                  key={col}
                  className="pb-3 font-bold uppercase tracking-widest text-[10px] text-on-primary-container border-b border-outline-variant/10"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {rows.map((row) => (
            <tr key={row.provider}>
              {/* Provider */}
              <td className="py-4 font-bold text-on-surface">
                {row.provider}
              </td>

              {/* Revenue Share */}
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(row.provider)}`}
                      style={{ width: `${row.revenueSharePercent}%` }}
                    />
                  </div>
                  <span className="font-medium text-[10px]">
                    {row.revenueSharePercent}%
                  </span>
                </div>
              </td>

              {/* Avg Reimbursement */}
              <td className="py-4 font-medium">{row.avgReimbursement}</td>

              {/* Margin Status */}
              <td className="py-4">
                <span
                  className={`px-2 py-1 rounded font-bold text-[9px] uppercase tracking-tighter ${badgeStyle[row.marginStatus.variant] ?? ''}`}
                >
                  {row.marginStatus.label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
