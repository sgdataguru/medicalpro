export default function SupplyChainLoading() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Summary cards skeleton — 3 cards in a row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-6 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-6 pt-2">
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="h-5 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="h-72 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Table skeleton — 6 rows */}
      <div className="rounded-xl bg-white p-6 shadow-md space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200 mb-4" />
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 pb-3 border-b border-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-6 gap-4 py-3 border-b border-gray-50"
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <div
                key={col}
                className="h-4 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
