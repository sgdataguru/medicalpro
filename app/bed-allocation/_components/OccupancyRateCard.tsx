'use client';

import {
  formatOccupancyRate,
  getOccupancyColor,
  getOccupancyBarColor,
} from '@/lib/bed-allocation/bed-allocation.utils';

interface OccupancyRateCardProps {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export default function OccupancyRateCard({
  totalBeds,
  occupiedBeds,
  availableBeds,
  occupancyRate,
}: OccupancyRateCardProps) {
  const rateColor = getOccupancyColor(occupancyRate);
  const barColor = getOccupancyBarColor(occupancyRate);
  const barWidth = Math.min(occupancyRate * 100, 100);

  return (
    <div className="rounded-xl shadow-sm p-6 bg-surface-container-lowest">
      <h3 className="font-headline text-on-surface text-lg font-semibold">
        Overall Occupancy
      </h3>

      <p className={`mt-3 text-4xl font-bold ${rateColor}`}>
        {formatOccupancyRate(occupancyRate)}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm text-on-surface-variant">
        <span>
          Beds: {occupiedBeds}/{totalBeds}
        </span>
        <span>Available: {availableBeds}</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
