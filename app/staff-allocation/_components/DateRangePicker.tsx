'use client';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: DateRangePickerProps) {
  return (
    <div>
      <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
        Date Range
      </h3>
      <div className="space-y-1.5">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs text-on-surface bg-surface-container-high rounded-lg border border-outline-variant/20 focus:outline-none focus:border-secondary"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs text-on-surface bg-surface-container-high rounded-lg border border-outline-variant/20 focus:outline-none focus:border-secondary"
        />
      </div>
    </div>
  );
}
