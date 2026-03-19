export default function BedAllocationLoading() {
  return (
    <div className="space-y-6">
      {/* ===== Top Header Skeleton ===== */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-72 animate-pulse rounded bg-surface-container-high" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-surface-container-high" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-container-high" />
        </div>
      </div>

      {/* --- Summary Cards Row --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`card-${i}`}
            className="rounded-xl bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-container-high" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-container-high" />
            </div>
            <div className="mb-2 h-8 w-20 animate-pulse rounded bg-surface-container-high" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-surface-container-high" />
              <div className="h-3 w-24 animate-pulse rounded bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>

      {/* --- Large Chart Skeleton --- */}
      <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-48 animate-pulse rounded bg-surface-container-high" />
          <div className="flex gap-2">
            <div className="h-8 w-16 animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-8 w-16 animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-8 w-16 animate-pulse rounded-md bg-surface-container-high" />
          </div>
        </div>
        <div className="flex h-72 items-end gap-3 pt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`bar-${i}`}
              className="flex-1 animate-pulse rounded-t bg-surface-container-high"
              style={{ height: `${30 + Math.round((i * 37) % 60)}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`label-${i}`} className="h-3 w-8 animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
      </div>

      {/* --- Table Skeleton --- */}
      <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-container-high" />
          <div className="h-9 w-48 animate-pulse rounded-lg bg-surface-container-high" />
        </div>

        {/* Table header */}
        <div className="mb-3 grid grid-cols-6 gap-4 border-b border-outline-variant/15 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`th-${i}`}
              className="h-3 animate-pulse rounded bg-surface-container-high"
              style={{ width: `${60 + (i * 13) % 35}%` }}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={`row-${row}`}
            className="grid grid-cols-6 gap-4 border-b border-outline-variant/10 py-3"
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <div
                key={`cell-${row}-${col}`}
                className="h-4 animate-pulse rounded bg-surface-container-high"
                style={{ width: `${50 + ((row + col) * 17) % 45}%` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* --- Two Bottom Panels --- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Panel 1 */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 h-5 w-36 animate-pulse rounded bg-surface-container-high" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`p1-${i}`} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container-high" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-surface-container-high" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container-high" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2 */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 h-5 w-44 animate-pulse rounded bg-surface-container-high" />
          <div className="flex h-48 items-center justify-center">
            <div className="h-40 w-40 animate-pulse rounded-full bg-surface-container-high" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`legend-${i}`} className="flex items-center gap-1">
                <div className="h-3 w-3 animate-pulse rounded-full bg-surface-container-high" />
                <div className="h-3 w-14 animate-pulse rounded bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
