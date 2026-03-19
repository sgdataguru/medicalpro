'use client';

interface LiveUnitPulseProps {
  efficiency: number;
}

export default function LiveUnitPulse({ efficiency }: LiveUnitPulseProps) {
  const barHeights = [4, 6, 10, 8, 12, 7, 5];

  return (
    <div className="mt-8 bg-surface-bright p-6 rounded-2xl shadow-[0px_0px_24px_rgba(124,131,155,0.06)] border border-outline-variant/10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Live Unit Pulse</h4>
        <span className="w-2 h-2 rounded-full bg-on-tertiary-container shadow-[0_0_8px_#6ffbbe]" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-12 flex items-end gap-1">
          {barHeights.map((h, i) => {
            const opacity = [0.2, 0.3, 0.4, 1, 0.8, 0.6, 0.3];
            return (
              <div
                key={i}
                className="w-1 bg-secondary rounded-full"
                style={{ height: `${h * 4}px`, opacity: opacity[i] }}
              />
            );
          })}
        </div>
        <div className="text-right">
          <p className="text-2xl font-black font-headline">{efficiency.toFixed(1)}%</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase">Efficiency</p>
        </div>
      </div>
    </div>
  );
}
