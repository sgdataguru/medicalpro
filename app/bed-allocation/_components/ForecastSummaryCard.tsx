'use client';

import { format, parseISO } from 'date-fns';
import { formatOccupancyRate } from '@/lib/bed-allocation/bed-allocation.utils';
import type {
  BedDemandForecast,
  ForecastJobStatus,
} from '@/lib/bed-allocation/bed-allocation.types';

interface ForecastSummaryCardProps {
  forecast: BedDemandForecast | null;
  forecastJobStatus: ForecastJobStatus;
}

export default function ForecastSummaryCard({
  forecast,
  forecastJobStatus,
}: ForecastSummaryCardProps) {
  const isLoading =
    forecastJobStatus === 'queued' || forecastJobStatus === 'processing';

  return (
    <div className="rounded-xl shadow-sm p-6 bg-surface-container-lowest">
      <h3 className="font-headline text-on-surface text-lg font-semibold">
        Demand Forecast
      </h3>

      {isLoading && (
        <div className="mt-4 flex items-center gap-3">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          <span className="text-sm text-on-surface-variant animate-pulse">
            Analyzing...
          </span>
        </div>
      )}

      {!forecast && !isLoading && (
        <p className="mt-4 text-sm text-on-surface-variant/60">No forecast available</p>
      )}

      {forecast && !isLoading && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-on-surface-variant">Peak Occupancy</dt>
            <dd className="font-semibold text-on-surface">
              {formatOccupancyRate(forecast.peakOccupancyRate)}
            </dd>
            <dd className="text-xs text-on-surface-variant">
              {format(parseISO(forecast.peakOccupancyDate), 'MMM d, yyyy')}
            </dd>
          </div>

          <div>
            <dt className="text-on-surface-variant">Trough Occupancy</dt>
            <dd className="font-semibold text-on-surface">
              {formatOccupancyRate(forecast.troughOccupancyRate)}
            </dd>
            <dd className="text-xs text-on-surface-variant">
              {format(parseISO(forecast.troughOccupancyDate), 'MMM d, yyyy')}
            </dd>
          </div>

          <div>
            <dt className="text-on-surface-variant">Confidence</dt>
            <dd className="font-semibold text-on-surface">
              {(forecast.confidence * 100).toFixed(0)}%
            </dd>
          </div>

          <div>
            <dt className="text-on-surface-variant">Horizon</dt>
            <dd className="font-semibold text-on-surface">
              {forecast.horizonDays} days
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
