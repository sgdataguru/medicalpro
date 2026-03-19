'use client';

import { FEATURE_PREVIEWS } from '@/lib/sandbox/sandbox.constants';
import FeaturePreviewCard from './FeaturePreviewCard';

export default function FeaturePreviewCards() {
  return (
    <section className="px-6 py-12 max-w-5xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURE_PREVIEWS.map((feature) => (
          <FeaturePreviewCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
