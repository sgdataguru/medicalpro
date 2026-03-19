import { getOccupancyBarColor } from '@/lib/bed-allocation/bed-allocation.utils';

interface OccupancyBarProps {
  rate: number;
}

export default function OccupancyBar({ rate }: OccupancyBarProps) {
  const widthPercent = Math.min(Math.max(rate * 100, 0), 100);
  const barColor = getOccupancyBarColor(rate);

  return (
    <div className="h-2 w-full rounded-full bg-surface-container-high">
      <div
        className={`h-2 rounded-full ${barColor} transition-all duration-500 ease-in-out`}
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
}
