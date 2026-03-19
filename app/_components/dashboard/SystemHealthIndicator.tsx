'use client';

export default function SystemHealthIndicator() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-surface-container-high/70 backdrop-blur-xl p-3 rounded-full shadow-2xl border border-white/30 flex items-center gap-3">
        {/* Pulsing green dot */}
        <div className="relative">
          <span className="absolute inset-0 bg-tertiary-fixed rounded-full blur-[4px] animate-pulse" />
          <span className="w-2 h-2 bg-on-tertiary-container rounded-full relative z-10 block" />
        </div>

        {/* Label */}
        <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest pr-2">
          System Healthy: Real-time Analytics Active
        </span>
      </div>
    </div>
  );
}
