'use client';

import Link from 'next/link';
import type { Recommendation } from '@/lib/recommendations/recommendations.types';
import { PRIORITY_CONFIG, MODULE_CONFIG } from '@/lib/recommendations/recommendations.constants';

interface RelatedRecommendationsProps {
  recommendations: Recommendation[];
}

export default function RelatedRecommendations({
  recommendations,
}: RelatedRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-headline text-base font-semibold text-on-surface mb-3">
        Related Recommendations
      </h3>
      <ul className="space-y-2">
        {recommendations.map((rec) => {
          const priorityConfig = PRIORITY_CONFIG[rec.priority.level];
          const moduleConfig = MODULE_CONFIG[rec.module];

          return (
            <li key={rec.id}>
              <Link
                href={`/recommendations/${rec.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 hover:bg-surface-container-high/30 transition-colors group"
              >
                {/* Priority dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: priorityConfig.color }}
                />

                {/* Title */}
                <span className="font-body text-sm text-on-surface truncate flex-1 group-hover:text-secondary transition-colors">
                  {rec.title}
                </span>

                {/* Module badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${moduleConfig.bgClass}`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {moduleConfig.icon}
                  </span>
                  {moduleConfig.label}
                </span>

                {/* Chevron */}
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-secondary transition-colors">
                  chevron_right
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
