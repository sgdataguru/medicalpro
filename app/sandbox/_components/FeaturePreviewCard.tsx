'use client';

interface FeaturePreviewCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeaturePreviewCard({
  icon,
  title,
  description,
}: FeaturePreviewCardProps) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-secondary/30 hover:bg-white/8">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
        <span className="material-symbols-outlined text-[22px] text-secondary">
          {icon}
        </span>
      </div>
      <h3 className="font-headline text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-white/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
