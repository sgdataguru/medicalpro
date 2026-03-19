'use client';

import { useState } from 'react';
import type { DataSourceCitation } from '@/lib/analytics-query/analytics-query.types';
import { formatCitation } from '@/lib/analytics-query/analytics-query.utils';
import { MODULE_CONFIG } from '@/lib/analytics-query/analytics-query.constants';

interface DataSourceCitationsProps {
  sources: DataSourceCitation[];
}

export default function DataSourceCitations({ sources }: DataSourceCitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="border-t border-outline-variant/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-primary-container hover:bg-surface-container-high/20 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">database</span>
          Data Sources ({sources.length})
        </span>
        <span className="material-symbols-outlined text-[16px] transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}>
          expand_more
        </span>
      </button>
      {isExpanded && (
        <div className="px-5 pb-3 space-y-2">
          {sources.map((source, i) => {
            const moduleConfig = MODULE_CONFIG[source.module];
            return (
              <div
                key={i}
                className="flex items-center gap-3 text-xs text-on-surface-variant"
              >
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ color: moduleConfig?.color }}
                >
                  {moduleConfig?.icon ?? 'help'}
                </span>
                <span>{formatCitation(source)}</span>
                <span className="ml-auto text-[10px] font-bold text-on-primary-container">
                  {source.dataQualityScore}% quality
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
