export default function SimulationsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-surface-container-high" />
        <div className="h-4 w-96 rounded bg-surface-container-high" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-surface-container-high" />
        ))}
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-full max-w-md rounded-lg bg-surface-container-high" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-surface-container p-5 ring-1 ring-outline-variant/15"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-surface-container-high" />
              <div className="h-5 w-20 rounded-full bg-surface-container-high" />
            </div>
            <div className="mb-2 h-5 w-3/4 rounded bg-surface-container-high" />
            <div className="mb-4 h-4 w-full rounded bg-surface-container-high" />
            <div className="flex gap-2">
              <div className="h-6 w-14 rounded-full bg-surface-container-high" />
              <div className="h-6 w-14 rounded-full bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
